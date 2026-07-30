import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { eq, and, count, sql, type SQLWrapper } from 'drizzle-orm'
import { DRIZZLE_DB } from '../database/database.providers'
import { pengajuan } from '../database/schema/pengajuan.schema'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../database/schema'
import type { CreatePengajuanDto, UpdatePengajuanDto } from './pengajuan.schema'

type DrizzleDb = NodePgDatabase<typeof schema>

@Injectable()
export class PengajuanService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async create(dto: CreatePengajuanDto, currentUserId: string, currentUserRole: string) {
    if (currentUserRole !== 'admin' && dto.userId !== currentUserId) {
      throw new ForbiddenException('Anda hanya bisa membuat pengajuan untuk diri sendiri')
    }

    const [record] = await this.db.insert(pengajuan).values({
      userId: dto.userId,
      jenis: dto.jenis,
      tanggalMulai: dto.tanggalMulai,
      tanggalSelesai: dto.tanggalSelesai,
      alasan: dto.alasan,
      status: 'pending',
      catatan: '',
    }).returning()

    return record
  }

  async list(params: { userId?: string; jenis?: string; status?: string; _page?: number; _limit?: number }) {
    const page = params._page || 1
    const limit = params._limit || 10
    const offset = (page - 1) * limit

    const filters: SQLWrapper[] = []

    if (params.userId) filters.push(eq(pengajuan.userId, params.userId))
    if (params.jenis) filters.push(eq(pengajuan.jenis, params.jenis))
    if (params.status) filters.push(eq(pengajuan.status, params.status))

    const where = filters.length > 0 ? and(...filters) : undefined

    const [totalResult] = await this.db.select({ total: count() }).from(pengajuan).where(where)
    const total = totalResult?.total || 0

    const rows = await this.db.select().from(pengajuan)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`created_at DESC`)

    return { data: rows, meta: { page, total, totalPages: Math.ceil(total / limit) } }
  }

  async update(id: number, dto: UpdatePengajuanDto, currentUserRole: string) {
    const [existing] = await this.db.select().from(pengajuan).where(eq(pengajuan.id, id)).limit(1)
    if (!existing) throw new NotFoundException('Pengajuan tidak ditemukan')

    if (existing.status !== 'pending') throw new BadRequestException('Pengajuan sudah diproses')

    if (dto.status !== undefined && currentUserRole !== 'admin') {
      throw new ForbiddenException('Hanya admin yang bisa mengubah status pengajuan')
    }

    const updateFields: Record<string, unknown> = {}
    if (dto.status !== undefined) updateFields.status = dto.status
    if (dto.catatan !== undefined) updateFields.catatan = dto.catatan

    if (Object.keys(updateFields).length === 0) return existing

    const [updated] = await this.db.update(pengajuan).set(updateFields)
      .where(eq(pengajuan.id, id)).returning()

    return updated
  }

  async delete(id: number, currentUserId: string, currentUserRole: string) {
    const [existing] = await this.db.select().from(pengajuan).where(eq(pengajuan.id, id)).limit(1)
    if (!existing) throw new NotFoundException('Pengajuan tidak ditemukan')

    if (existing.status !== 'pending') throw new BadRequestException('Hanya pengajuan pending yang bisa dihapus')

    if (currentUserRole !== 'admin' && existing.userId !== currentUserId) {
      throw new ForbiddenException('Anda hanya bisa menghapus pengajuan sendiri')
    }

    await this.db.delete(pengajuan).where(eq(pengajuan.id, id))
    return { message: 'Dihapus' }
  }
}
