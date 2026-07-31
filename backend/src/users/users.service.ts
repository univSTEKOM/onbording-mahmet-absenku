import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { eq, ilike, count, sql, and, type SQLWrapper } from 'drizzle-orm';
import { DRIZZLE_DB } from '../database/database.providers';
import { user } from '../database/schema/auth.schema';
import { absensi } from '../database/schema/absensi.schema';
import { pengajuan } from '../database/schema/pengajuan.schema';
import { account, session } from '../database/schema/auth.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type * as schema from '../database/schema';
import type {
  UpdateUserDto,
  AdminUpdateUserDto,
  UpdateUserStatusDto,
  AddNoteDto,
} from './users.schema';

type DrizzleDb = NodePgDatabase<typeof schema>;

function stripInternal(userRow: Record<string, unknown>) {
  const { emailVerified: _ev, ...rest } = userRow;
  void _ev;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async getProfile(userId: string) {
    const [row] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!row) throw new NotFoundException('User tidak ditemukan');
    return stripInternal(row);
  }

  async updateProfile(
    userId: string,
    dto: UpdateUserDto,
    currentUserId: string,
  ) {
    if (userId !== currentUserId)
      throw new ForbiddenException('Anda hanya bisa mengubah profil sendiri');

    const [existing] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!existing) throw new NotFoundException('User tidak ditemukan');

    const updateFields: Record<string, unknown> = {};
    if (dto.nama !== undefined) {
      updateFields.name = dto.nama;
    }
    if (dto.email !== undefined) {
      const [emailOwner] = await this.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, dto.email))
        .limit(1);
      if (emailOwner && emailOwner.id !== userId)
        throw new ConflictException('Email sudah digunakan');
      updateFields.email = dto.email;
    }
    if (dto.jabatan !== undefined) updateFields.jabatan = dto.jabatan;
    if (dto.phone !== undefined) updateFields.phone = dto.phone;
    if (dto.alamat !== undefined) updateFields.alamat = dto.alamat;
    if (dto.foto !== undefined) {
      updateFields.image = dto.foto;
      updateFields.foto = dto.foto;
    }
    if (dto.faceDescriptor !== undefined)
      updateFields.faceDescriptor = dto.faceDescriptor;

    if (Object.keys(updateFields).length > 0) {
      if ((existing as Record<string, unknown>).status === 'rejected') {
        updateFields.status = 'pending';
        updateFields.rejectionNotes = '[]';
      }
      await this.db.update(user).set(updateFields).where(eq(user.id, userId));
    }

    const [updated] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    return stripInternal(updated);
  }

  async getPendingUsers() {
    const rows = await this.db
      .select()
      .from(user)
      .where(eq(user.status, 'pending'))
      .orderBy(sql`created_at DESC`);
    return rows.map((r) =>
      stripInternal(r as unknown as Record<string, unknown>),
    );
  }

  async getAllUsers(params: {
    page?: number;
    limit?: number;
    q?: string;
    role?: string;
    status?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 15;
    const offset = (page - 1) * limit;

    const filters: SQLWrapper[] = [];

    if (params.q) {
      const pattern = `%${params.q}%`;
      filters.push(
        sql`(${ilike(user.name, pattern)} OR ${ilike(user.email, pattern)})`,
      );
    }
    if (params.role) filters.push(eq(user.role, params.role));
    if (params.status) filters.push(eq(user.status, params.status));

    const where = filters.length > 0 ? and(...filters) : undefined;

    const [totalResult] = await this.db
      .select({ total: count() })
      .from(user)
      .where(where);
    const total = totalResult?.total || 0;

    const rows = await this.db
      .select()
      .from(user)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`created_at DESC`);

    return {
      data: rows.map((r) =>
        stripInternal(r as unknown as Record<string, unknown>),
      ),
      meta: { page, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminUpdateUser(userId: string, dto: AdminUpdateUserDto) {
    const [existing] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!existing) throw new NotFoundException('User tidak ditemukan');

    const updateFields: Record<string, unknown> = {};
    if (dto.nama !== undefined) {
      updateFields.name = dto.nama;
    }
    if (dto.email !== undefined) {
      const [emailOwner] = await this.db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, dto.email))
        .limit(1);
      if (emailOwner && emailOwner.id !== userId)
        throw new ConflictException('Email sudah digunakan');
      updateFields.email = dto.email;
    }
    if (dto.jabatan !== undefined) updateFields.jabatan = dto.jabatan;
    if (dto.phone !== undefined) updateFields.phone = dto.phone;
    if (dto.alamat !== undefined) updateFields.alamat = dto.alamat;
    if (dto.role !== undefined) updateFields.role = dto.role;
    if (dto.foto !== undefined) {
      updateFields.image = dto.foto;
      updateFields.foto = dto.foto;
    }
    if (dto.faceDescriptor !== undefined)
      updateFields.faceDescriptor = dto.faceDescriptor;

    if (Object.keys(updateFields).length > 0) {
      await this.db.update(user).set(updateFields).where(eq(user.id, userId));
    }

    return { message: 'User berhasil diupdate' };
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    const [existing] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!existing) throw new NotFoundException('User tidak ditemukan');

    if (dto.status === 'approved') {
      await this.db
        .update(user)
        .set({ status: 'approved', rejectionNotes: '[]' })
        .where(eq(user.id, userId));
    } else {
      const existingNotes =
        ((existing as unknown as Record<string, unknown>)
          .rejectionNotes as string) || '[]';
      let notes: { note: string; createdAt: string }[] = [];
      try {
        notes = JSON.parse(existingNotes) as {
          note: string;
          createdAt: string;
        }[];
      } catch {
        notes = [];
      }
      if (dto.note) {
        notes.push({ note: dto.note, createdAt: new Date().toISOString() });
      }
      await this.db
        .update(user)
        .set({ status: 'rejected', rejectionNotes: JSON.stringify(notes) })
        .where(eq(user.id, userId));
    }

    return { message: `Status berhasil diubah ke ${dto.status}` };
  }

  async addUserNote(userId: string, dto: AddNoteDto) {
    const [existing] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!existing) throw new NotFoundException('User tidak ditemukan');

    const existingNotes =
      ((existing as unknown as Record<string, unknown>)
        .rejectionNotes as string) || '[]';
    let notes: { note: string; createdAt: string }[] = [];
    try {
      notes = JSON.parse(existingNotes) as {
        note: string;
        createdAt: string;
      }[];
    } catch {
      notes = [];
    }
    notes.push({ note: dto.note, createdAt: new Date().toISOString() });

    await this.db
      .update(user)
      .set({ rejectionNotes: JSON.stringify(notes) })
      .where(eq(user.id, userId));
    return { message: 'Catatan ditambahkan' };
  }

  async deleteUser(userId: string) {
    const [existing] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    if (!existing) throw new NotFoundException('User tidak ditemukan');

    await this.db.delete(account).where(eq(account.userId, userId));
    await this.db.delete(session).where(eq(session.userId, userId));
    await this.db.delete(absensi).where(eq(absensi.userId, userId));
    await this.db.delete(pengajuan).where(eq(pengajuan.userId, userId));
    await this.db.delete(user).where(eq(user.id, userId));

    return { message: 'User dan semua data terkait berhasil dihapus' };
  }
}
