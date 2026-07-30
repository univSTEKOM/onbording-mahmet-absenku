import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { PengajuanService } from './pengajuan.service';
import {
  createPengajuanSchema,
  updatePengajuanSchema,
} from './pengajuan.schema';
import type {
  CreatePengajuanDto,
  UpdatePengajuanDto,
} from './pengajuan.schema';
import type { UserFromSession } from '../common/types';

@Controller()
export class PengajuanController {
  constructor(private readonly pengajuanService: PengajuanService) {}

  @Post('/pengajuan')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(createPengajuanSchema))
  async create(
    @Body() body: CreatePengajuanDto,
    @CurrentUser() currentUser: UserFromSession,
  ) {
    const record = await this.pengajuanService.create(
      body,
      currentUser.id,
      currentUser.role,
    );
    return { success: true, data: record };
  }

  @Get('/pengajuan')
  @UseGuards(AuthGuard)
  async list(
    @CurrentUser() currentUser: UserFromSession,
    @Query('userId') userId?: string,
    @Query('jenis') jenis?: string,
    @Query('status') status?: string,
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
  ) {
    const effectiveUserId =
      currentUser.role !== 'admin' ? currentUser.id : userId;
    const result = await this.pengajuanService.list({
      userId: effectiveUserId,
      jenis,
      status,
      _page: page ? parseInt(page) : undefined,
      _limit: limit ? parseInt(limit) : undefined,
    });
    return { success: true, ...result };
  }

  @Patch('/pengajuan/:id')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(updatePengajuanSchema))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePengajuanDto,
    @CurrentUser() currentUser: UserFromSession,
  ) {
    const record = await this.pengajuanService.update(
      id,
      body,
      currentUser.role,
    );
    return { success: true, data: record };
  }

  @Delete('/pengajuan/:id')
  @UseGuards(AuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: UserFromSession,
  ) {
    const result = await this.pengajuanService.delete(
      id,
      currentUser.id,
      currentUser.role,
    );
    return { success: true, data: result };
  }
}
