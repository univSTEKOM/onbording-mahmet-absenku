import { Injectable, Inject, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common'
import { eq, and, gte, lte, inArray, ilike, count, sql } from 'drizzle-orm'
import { DRIZZLE_DB } from '../database/database.providers'
import { absensi } from '../database/schema/absensi.schema'
import { user } from '../database/schema/auth.schema'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../database/schema'
import { evaluateCheckIn, evaluateCheckOut } from './absensi.rules'
import type { CheckInDto, CheckOutDto } from './absensi.schema'

type DrizzleDb = NodePgDatabase<typeof schema>

function normalizeArray(val: string | string[] | undefined): string[] | undefined {
  if (!val) return undefined
  if (Array.isArray(val)) return val.length > 0 ? val : undefined
  return [val]
}

interface AbsensiQueryParams {
  userId?: string
  tanggal?: string
  tanggal_gte?: string
  tanggal_lte?: string
  status?: string | string[]
  mainCategory?: string | string[]
  subCategory?: string | string[]
  q?: string
  _sort?: string
  _order?: string
  _page?: number
  _limit?: number
}

@Injectable()
export class AbsensiService {
  constructor(@Inject(DRIZZLE_DB) private readonly db: DrizzleDb) {}

  async checkIn(dto: CheckInDto, currentUserId: string, currentUserRole: string) {
    if (currentUserRole !== 'admin' && dto.userId !== currentUserId) {
      throw new ForbiddenException('Anda hanya bisa absen untuk diri sendiri')
    }

    const [existingUser] = await this.db.select({ id: user.id }).from(user).where(eq(user.id, dto.userId)).limit(1)
    if (!existingUser) throw new NotFoundException('User tidak ditemukan')

    const checkInResult = evaluateCheckIn()
    if (!checkInResult.allowed) throw new BadRequestException('Absensi dibuka pukul 06:45.')

    const [duplicate] = await this.db.select({ id: absensi.id }).from(absensi)
      .where(and(eq(absensi.userId, dto.userId), eq(absensi.tanggal, dto.tanggal)))
      .limit(1)
    if (duplicate) throw new ConflictException('Sudah absen hari ini')

    const [record] = await this.db.insert(absensi).values({
      userId: dto.userId,
      tanggal: dto.tanggal,
      checkIn: dto.checkIn ? new Date(dto.checkIn) : null,
      checkOut: null,
      status: checkInResult.status,
      mainCategory: checkInResult.mainCategory,
      subCategory: checkInResult.subCategory,
      faceVerified: dto.faceVerified || false,
      photos: dto.photos || [],
      keterangan: dto.keterangan || '',
    } as never).returning()

    return record
  }

  async checkOut(absensiId: number, dto: CheckOutDto, currentUserId: string, currentUserRole: string) {
    const [existing] = await this.db.select().from(absensi).where(eq(absensi.id, absensiId)).limit(1)
    if (!existing) throw new NotFoundException('Absensi tidak ditemukan')

    if (currentUserRole !== 'admin' && existing.userId !== currentUserId) {
      throw new ForbiddenException('Anda hanya bisa check-out untuk diri sendiri')
    }

    const checkOutResult = evaluateCheckOut()
    const currentPhotos = (existing.photos as unknown as Array<Record<string, string>>) || []
    const photos = dto.photos?.length ? [...currentPhotos, ...dto.photos] : existing.photos

    const [updated] = await this.db.update(absensi).set({
      checkOut: new Date(dto.checkOut),
      status: checkOutResult.pulangCepat ? 'pulang_cepat' : existing.status,
      subCategory: checkOutResult.pulangCepat ? checkOutResult.subCategory : existing.subCategory,
      photos,
    } as never).where(eq(absensi.id, absensiId)).returning()

    return updated
  }

  async list(params: AbsensiQueryParams) {
    const page = params._page || 1
    const limit = params._limit || 10
    const offset = (page - 1) * limit

    const filters: any[] = []

    if (params.userId) filters.push(eq(absensi.userId, params.userId))
    if (params.tanggal) filters.push(eq(absensi.tanggal, params.tanggal))
    if (params.tanggal_gte) filters.push(gte(absensi.tanggal, params.tanggal_gte))
    if (params.tanggal_lte) filters.push(lte(absensi.tanggal, params.tanggal_lte))

    const statusArr = normalizeArray(params.status)
    if (statusArr) filters.push(inArray(absensi.status, statusArr))

    const mainCatArr = normalizeArray(params.mainCategory)
    if (mainCatArr) filters.push(inArray(absensi.mainCategory, mainCatArr))

    const subCatArr = normalizeArray(params.subCategory)
    if (subCatArr) filters.push(inArray(absensi.subCategory, subCatArr))

    const where = filters.length > 0 ? and(...filters) : undefined

    const [totalResult] = await this.db.select({ total: count() }).from(absensi).where(where)
    const total = totalResult?.total || 0

    const allowedSortFields = ['tanggal', 'checkIn', 'checkOut', 'status', 'mainCategory', 'subCategory', 'createdAt']
    const sortField = params._sort && allowedSortFields.includes(params._sort) ? params._sort : 'tanggal'
    const orderDir = params._order === 'asc' ? 'ASC' : 'DESC'
    const sortOrder = sql`${sql.identifier(sortField)} ${sql.raw(orderDir)}`

    const rows = await this.db.select().from(absensi)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(sortOrder)

    return { data: rows, meta: { page, total, totalPages: Math.ceil(total / limit) } }
  }

  async search(params: AbsensiQueryParams) {
    const page = params._page || 1
    const limit = params._limit || 15
    const offset = (page - 1) * limit

    const filters: any[] = []

    if (params.q) {
      const pattern = `%${params.q}%`
      const matchedIds = this.db.select({ id: user.id }).from(user)
        .where(ilike(user.name, pattern))
      filters.push(sql`${absensi.userId} IN (${matchedIds})`)
    }

    if (params.userId) filters.push(eq(absensi.userId, params.userId))
    if (params.tanggal_gte) filters.push(gte(absensi.tanggal, params.tanggal_gte))
    if (params.tanggal_lte) filters.push(lte(absensi.tanggal, params.tanggal_lte))

    const statusArr = normalizeArray(params.status)
    if (statusArr) filters.push(inArray(absensi.status, statusArr))

    const mainCatArr = normalizeArray(params.mainCategory)
    if (mainCatArr) filters.push(inArray(absensi.mainCategory, mainCatArr))

    const subCatArr = normalizeArray(params.subCategory)
    if (subCatArr) filters.push(inArray(absensi.subCategory, subCatArr))

    const where = filters.length > 0 ? and(...filters) : undefined

    const [totalResult] = await this.db.select({ total: count() }).from(absensi).where(where)
    const total = totalResult?.total || 0

    const rows = await this.db.select().from(absensi)
      .where(where)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`tanggal DESC`)

    return { data: rows, meta: { page, total, totalPages: Math.ceil(total / limit) } }
  }
}
