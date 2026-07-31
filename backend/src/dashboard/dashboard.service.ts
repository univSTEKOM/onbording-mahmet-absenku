import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, count, type SQLWrapper } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.providers';
import { absensi } from '../database/schema/absensi.schema';
import { user } from '../database/schema/auth.schema';
import { pengajuan } from '../database/schema/pengajuan.schema';
import { fmtDate } from '../common/utils';
import { catType } from '../attendance-categories';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../database/schema';

type DrizzleDb = NodePgDatabase<typeof schema>;

@Injectable()
export class DashboardService {
  private readonly appReleaseDate: string;

  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {
    this.appReleaseDate = process.env.APP_RELEASE_DATE || '2026-07-13';
  }

  async getRecent(userId: string) {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);

    const rows = await this.db
      .select()
      .from(absensi)
      .where(
        and(
          eq(absensi.userId, userId),
          gte(absensi.tanggal, fmtDate(sevenDaysAgo)),
        ),
      )
      .orderBy(absensi.tanggal);

    const data: {
      tanggal: string;
      checkIn: string | null;
      checkOut: string | null;
      status: string | null;
    }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const tgl = fmtDate(d);
      const match = rows.find((r) => r.tanggal === tgl);

      data.push({
        tanggal: tgl,
        checkIn: match?.checkIn ? match.checkIn.toISOString() : null,
        checkOut: match?.checkOut ? match.checkOut.toISOString() : null,
        status: match?.status || null,
      });
    }

    return { data };
  }

  async getAdminWeek() {
    const today = new Date();
    const todayStr = fmtDate(today);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const weekStartStr = fmtDate(weekStart);
    const monthStartStr = fmtDate(
      new Date(today.getFullYear(), today.getMonth(), 1),
    );

    const [karyawanCount] = await this.db
      .select({ total: count() })
      .from(user)
      .where(eq(user.role, 'karyawan'));
    const totalKaryawan = karyawanCount?.total || 0;

    const absensiRows = await this.db
      .select()
      .from(absensi)
      .where(
        and(gte(absensi.tanggal, weekStartStr), lte(absensi.tanggal, todayStr)),
      );

    const pengajuanRows = await this.db
      .select()
      .from(pengajuan)
      .where(
        and(
          eq(pengajuan.status, 'approved'),
          gte(pengajuan.tanggalSelesai, weekStartStr),
        ),
      );

    const chart: Array<{
      name: string;
      hadir: number;
      pulangCepat: number;
      terlambat: number;
      izin: number;
      sakit: number;
      cuti: number;
      tidakHadir: number;
      present: number;
      absentPermit: number;
      absentUnpermit: number;
      persen: number;
    }> = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const tgl = fmtDate(d);

      const da = absensiRows.filter((a) => a.tanggal === tgl);
      const dp = pengajuanRows.filter(
        (p) => p.tanggalMulai <= tgl && p.tanggalSelesai >= tgl,
      );

      const hadir = da.filter((a) => a.status === 'hadir').length;
      const pulangCepat = da.filter((a) => a.status === 'pulang_cepat').length;
      const terlambat = da.filter((a) => a.status === 'terlambat').length;
      const izin =
        da.filter((a) => a.status === 'izin').length +
        dp.filter((p) => p.jenis === 'izin').length;
      const sakit =
        da.filter((a) => a.status === 'sakit').length +
        dp.filter((p) => p.jenis === 'sakit').length;
      const cuti =
        da.filter((a) => a.status === 'cuti').length +
        dp.filter((p) => p.jenis === 'cuti').length;
      const totalAktif = hadir + pulangCepat + terlambat;
      const tidakHadir = Math.max(
        0,
        totalKaryawan - hadir - pulangCepat - terlambat - izin - sakit - cuti,
      );
      const present = da.filter((a) => catType(a) === 'present').length;
      const absentPermit =
        da.filter((a) => catType(a) === 'absent_permit').length +
        dp.filter((p) => p.jenis === 'izin').length;

      chart.push({
        name: d.toLocaleDateString('id-ID', { weekday: 'short' }),
        hadir,
        pulangCepat,
        terlambat,
        izin,
        sakit,
        cuti,
        tidakHadir,
        present,
        absentPermit,
        absentUnpermit: tidakHadir,
        persen: Math.round((totalAktif / (totalKaryawan || 1)) * 100),
      });
    }

    const ta = absensiRows.filter((a) => a.tanggal === todayStr);
    const hadirHariIni = ta.filter((a) =>
      ['hadir', 'pulang_cepat'].includes(a.status),
    ).length;
    const terlambatHariIni = ta.filter((a) => a.status === 'terlambat').length;
    const izinHariIni = ta.filter((a) =>
      ['izin', 'sakit', 'cuti'].includes(a.status),
    ).length;
    const sudahAbsen = ta.filter((a) => a.checkIn).length;
    const alfaHariIni = Math.max(
      0,
      totalKaryawan - hadirHariIni - terlambatHariIni - izinHariIni,
    );
    const weekAvg = chart.length
      ? Math.round(chart.reduce((s, c) => s + c.persen, 0) / chart.length)
      : 0;
    const bestDay = chart.length
      ? chart.reduce((a, b) => (a.persen > b.persen ? a : b))
      : null;

    const ma = absensiRows.filter((a) => a.tanggal >= monthStartStr);
    const presentMonth = ma.filter((a) => catType(a) === 'present').length;
    const permitMonth = ma.filter((a) => catType(a) === 'absent_permit').length;
    const unpermitMonth = ma.filter(
      (a) => catType(a) === 'absent_unpermit',
    ).length;

    return {
      chart,
      summary: {
        totalKaryawan,
        hadirHariIni,
        terlambatHariIni,
        izinHariIni,
        alfaHariIni,
        belumAbsen: totalKaryawan - sudahAbsen,
        totalAbsensiBulanIni: ma.length,
        weekAvg,
        bestDay: bestDay
          ? { name: bestDay.name, persen: bestDay.persen }
          : null,
        presentMonth,
        permitMonth,
        unpermitMonth,
      },
    };
  }

  async getMonth(tahun: number, bulan: number, userId?: string) {
    const today = new Date();
    const todayStr = fmtDate(today);
    const daysInMonth = new Date(tahun, bulan, 0).getDate();
    const monthStart = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    const monthEnd = `${tahun}-${String(bulan).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const absConditions: SQLWrapper[] = [
      gte(absensi.tanggal, monthStart),
      lte(absensi.tanggal, monthEnd),
    ];
    if (userId) absConditions.push(eq(absensi.userId, userId));
    const absWhere = and(...absConditions);

    const pengConditions: SQLWrapper[] = [
      eq(pengajuan.status, 'approved'),
      lte(pengajuan.tanggalMulai, monthEnd),
      gte(pengajuan.tanggalSelesai, monthStart),
    ];
    if (userId) pengConditions.push(eq(pengajuan.userId, userId));
    const pengWhere = and(...pengConditions);

    const [absensiRows, pengajuanRows] = await Promise.all([
      this.db.select().from(absensi).where(absWhere),
      this.db.select().from(pengajuan).where(pengWhere),
    ]);

    const total = userId
      ? 1
      : (
          await this.db
            .select({ total: count() })
            .from(user)
            .where(eq(user.role, 'karyawan'))
        )[0]?.total || 0;

    const data: Array<{
      tanggal: string;
      hadir: number;
      pulangCepat: number;
      terlambat: number;
      checkInOnly: number;
      izin: number;
      sakit: number;
      cuti: number;
      tidakHadir: number;
      present: number;
      absentPermit: number;
      absentUnpermit: number;
    }> = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const tgl = `${tahun}-${String(bulan).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      if (tgl < this.appReleaseDate || tgl > todayStr) {
        data.push({
          tanggal: tgl,
          hadir: 0,
          pulangCepat: 0,
          terlambat: 0,
          checkInOnly: 0,
          izin: 0,
          sakit: 0,
          cuti: 0,
          tidakHadir: 0,
          present: 0,
          absentPermit: 0,
          absentUnpermit: 0,
        });
        continue;
      }

      const da = absensiRows.filter((a) => a.tanggal === tgl);
      const dp = pengajuanRows.filter(
        (p) => p.tanggalMulai <= tgl && p.tanggalSelesai >= tgl,
      );

      const hadir = da.filter((a) => a.status === 'hadir').length;
      const pulangCepat = da.filter((a) => a.status === 'pulang_cepat').length;
      const terlambat = da.filter((a) => a.status === 'terlambat').length;
      const checkInOnly = da.filter((a) => a.checkIn && !a.checkOut).length;
      const izin =
        da.filter((a) => a.status === 'izin').length +
        dp.filter((p) => p.jenis === 'izin').length;
      const sakit =
        da.filter((a) => a.status === 'sakit').length +
        dp.filter((p) => p.jenis === 'sakit').length;
      const cuti =
        da.filter((a) => a.status === 'cuti').length +
        dp.filter((p) => p.jenis === 'cuti').length;
      const tidakHadir = Math.max(
        0,
        total -
          hadir -
          pulangCepat -
          terlambat -
          checkInOnly -
          izin -
          sakit -
          cuti,
      );
      const present = da.filter((a) => catType(a) === 'present').length;
      const absentPermit =
        da.filter((a) => catType(a) === 'absent_permit').length +
        dp.filter((p) => p.jenis === 'izin').length;
      const absentUnpermit = da.filter(
        (a) => catType(a) === 'absent_unpermit',
      ).length;

      data.push({
        tanggal: tgl,
        hadir,
        pulangCepat,
        terlambat,
        checkInOnly,
        izin,
        sakit,
        cuti,
        tidakHadir,
        present,
        absentPermit,
        absentUnpermit,
      });
    }

    return { data, totalKaryawan: total };
  }
}
