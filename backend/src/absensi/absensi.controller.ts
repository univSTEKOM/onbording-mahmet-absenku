import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, UsePipes, ParseIntPipe } from '@nestjs/common'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { AbsensiService } from './absensi.service'
import { checkInSchema, checkOutSchema } from './absensi.schema'
import type { CheckInDto, CheckOutDto } from './absensi.schema'

interface UserFromSession {
  id: string
  role: string
}

@Controller()
export class AbsensiController {
  constructor(private readonly absensiService: AbsensiService) {}

  @Post('/absensi')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(checkInSchema))
  async checkIn(@Body() body: CheckInDto, @CurrentUser() currentUser: UserFromSession) {
    const record = await this.absensiService.checkIn(body, currentUser.id, currentUser.role)
    return { success: true, data: record }
  }

  @Patch('/absensi/:id')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(checkOutSchema))
  async checkOut(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: CheckOutDto,
    @CurrentUser() currentUser: UserFromSession,
  ) {
    const record = await this.absensiService.checkOut(id, body, currentUser.id, currentUser.role)
    return { success: true, data: record }
  }

  @Get('/absensi')
  @UseGuards(AuthGuard)
  async list(
    @CurrentUser() currentUser: UserFromSession,
    @Query('userId') userId?: string,
    @Query('tanggal') tanggal?: string,
    @Query('tanggal_gte') tanggalGte?: string,
    @Query('tanggal_lte') tanggalLte?: string,
    @Query('status') status?: string | string[],
    @Query('mainCategory') mainCategory?: string | string[],
    @Query('subCategory') subCategory?: string | string[],
    @Query('_sort') sort?: string,
    @Query('_order') order?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
  ) {
    const effectiveUserId = currentUser.role !== 'admin' ? currentUser.id : userId
    const result = await this.absensiService.list({
      userId: effectiveUserId,
      tanggal,
      tanggal_gte: tanggalGte,
      tanggal_lte: tanggalLte,
      status,
      mainCategory,
      subCategory,
      _sort: sort,
      _order: order,
      _page: page ? parseInt(page) : undefined,
      _limit: limit ? parseInt(limit) : undefined,
    })
    return { success: true, ...result }
  }

  @Get('/api/absensi/search')
  @UseGuards(AuthGuard)
  async search(
    @CurrentUser() currentUser: UserFromSession,
    @Query('q') q?: string,
    @Query('userId') userId?: string,
    @Query('tanggal_gte') tanggalGte?: string,
    @Query('tanggal_lte') tanggalLte?: string,
    @Query('status') status?: string | string[],
    @Query('mainCategory') mainCategory?: string | string[],
    @Query('subCategory') subCategory?: string | string[],
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
  ) {
    const effectiveUserId = currentUser.role !== 'admin' ? currentUser.id : userId
    const result = await this.absensiService.search({
      q,
      userId: effectiveUserId,
      tanggal_gte: tanggalGte,
      tanggal_lte: tanggalLte,
      status,
      mainCategory,
      subCategory,
      _page: page ? parseInt(page) : undefined,
      _limit: limit ? parseInt(limit) : undefined,
    })
    return { success: true, ...result }
  }
}
