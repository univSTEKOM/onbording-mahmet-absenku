import { Injectable, Inject, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { AUTH_INSTANCE } from '../auth/auth.module';
import { DRIZZLE_DB } from '../database/database.providers';
import { user } from '../database/schema/auth.schema';
import { absensi } from '../database/schema/absensi.schema';
import { pengajuan } from '../database/schema/pengajuan.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { Auth } from '../auth/auth.instance';
import * as schema from '../database/schema';
import { PERSONAS, SAMPLE_PENGAJUAN } from './seed.data';

type DrizzleDb = NodePgDatabase<typeof schema>;

const APP_RELEASE = '2026-07-13';
const CAT_MAP: Record<string, { main: string; sub: string }> = {
  hadir: { main: 'physical_present', sub: 'physical_standard' },
  terlambat: { main: 'physical_present', sub: 'physical_violation' },
  pulang_cepat: { main: 'physical_present', sub: 'physical_violation' },
  izin: { main: 'absent_permit', sub: 'permit_general' },
  sakit: { main: 'absent_permit', sub: 'permit_sick' },
  cuti: { main: 'absent_permit', sub: 'leave_annual' },
};

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickWeighted(items: { weight: number; value: string }[]): string {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function isWeekend(tgl: string): boolean {
  const d = new Date(tgl + 'T00:00:00');
  return d.getDay() === 0 || d.getDay() === 6;
}

function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  const d = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  while (d <= end) {
    days.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(AUTH_INSTANCE) private readonly auth: Auth,
    @Inject(DRIZZLE_DB) private readonly db: DrizzleDb,
  ) {}

  async seed(password: string) {
    const created: { persona: (typeof PERSONAS)[number]; id: string }[] = [];

    for (const p of PERSONAS) {
      const [existing] = await this.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, p.email))
        .limit(1);
      if (existing) {
        this.logger.log(`Already exists: ${p.email}`);
        created.push({ persona: p, id: existing.id });
        continue;
      }

      try {
        const response = await this.auth.api.signUpEmail({
          body: {
            email: p.email,
            password,
            name: p.nama,
            role: p.role,
            status: p.status,
            jabatan: p.jabatan,
            phone: p.phone,
            alamat: p.alamat,
            faceDescriptor: '',
            rejectionNotes: '[]',
          },
          asResponse: true,
        });

        if (response.status !== 200) {
          const text = await response.text().catch(() => '');
          const errBody: Record<string, unknown> = text
            ? (JSON.parse(text) as Record<string, unknown>)
            : {};
          this.logger.warn(
            `Failed to create ${p.email}: ${(errBody?.message as string) || 'unknown error'}`,
          );
          continue;
        }

        const data = (await response.json()) as { user: { id: string } };
        this.logger.log(`Created: ${p.email} -> ${data.user.id}`);
        created.push({ persona: p, id: data.user.id });
      } catch (e) {
        this.logger.warn(`Error creating ${p.email}: ${(e as Error).message}`);
        continue;
      }
    }

    const approvedUsers = created.filter(
      (c) => c.persona.status === 'approved',
    );
    if (approvedUsers.length > 0) {
      await this.generateAbsensi(approvedUsers);
    }

    await this.generatePengajuan(created);

    this.logger.log(`Seed selesai: ${created.length} users, absensi terisi`);
  }

  private async generateAbsensi(
    users: { persona: (typeof PERSONAS)[number]; id: string }[],
  ) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const workDays = eachDay(APP_RELEASE, todayStr).filter(
      (tgl) => !isWeekend(tgl),
    );

    const records: Array<{
      userId: string;
      tanggal: string;
      checkIn: Date;
      checkOut: Date | null;
      status: string;
      mainCategory: string;
      subCategory: string;
      faceVerified: boolean;
      photos: never[];
      keterangan: string;
    }> = [];

    for (const u of users) {
      if (!u.persona.weights) continue;

      for (const tgl of workDays) {
        const status = pickWeighted(
          Object.entries(u.persona.weights).map(([k, w]) => ({
            weight: w,
            value: k,
          })),
        );

        if (status === 'tidakHadir') continue;

        const checkInHour = status === 'terlambat' ? rand(8, 9) : rand(6, 7);
        const checkInMin = status === 'terlambat' ? rand(46, 59) : rand(45, 59);
        const checkIn = new Date(
          `${tgl}T${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:${String(rand(0, 59)).padStart(2, '0')}.000Z`,
        );

        const isPulangCepat = status === 'pulang_cepat';
        const checkOutHour = isPulangCepat ? rand(13, 15) : rand(16, 17);
        const checkOut = new Date(
          `${tgl}T${String(checkOutHour).padStart(2, '0')}:${String(rand(10, 50)).padStart(2, '0')}:${String(rand(0, 59)).padStart(2, '0')}.000Z`,
        );

        const cat = CAT_MAP[status] || CAT_MAP.hadir;

        records.push({
          userId: u.id,
          tanggal: tgl,
          checkIn,
          checkOut,
          status,
          mainCategory: cat.main,
          subCategory: cat.sub,
          faceVerified: Math.random() < 0.7,
          photos: [],
          keterangan: '',
        });
      }
    }

    if (records.length > 0) {
      await this.db.insert(absensi).values(records as never[]);
      this.logger.log(`Generated ${records.length} absensi records`);
    }
  }

  private async generatePengajuan(
    users: { persona: (typeof PERSONAS)[number]; id: string }[],
  ) {
    let inserted = 0;
    const now = new Date();

    for (const s of SAMPLE_PENGAJUAN) {
      const match = users.find((u) =>
        u.persona.email.startsWith(s.emailPrefix),
      );
      if (!match) continue;

      await this.db.insert(pengajuan).values({
        userId: match.id,
        jenis: s.jenis,
        tanggalMulai: s.tanggalMulai,
        tanggalSelesai: s.tanggalSelesai,
        alasan: s.alasan,
        status: s.status,
        catatan: s.status === 'approved' ? 'Disetujui' : '',
        createdAt: now,
      });
      inserted++;
    }

    this.logger.log(`Generated ${inserted} pengajuan records`);
  }
}
