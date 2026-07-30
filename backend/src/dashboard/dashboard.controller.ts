import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

interface UserFromSession {
  id: string;
  role: string;
}

@Controller()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/api/dashboard/recent')
  @UseGuards(AuthGuard)
  async getRecent(
    @CurrentUser() currentUser: UserFromSession,
    @Query('userId') userId?: string,
  ) {
    const effectiveUserId =
      currentUser.role !== 'admin' ? currentUser.id : userId || currentUser.id;
    const result = await this.dashboardService.getRecent(effectiveUserId);
    return { success: true, ...result };
  }

  @Get('/api/dashboard/admin/week')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getAdminWeek() {
    const result = await this.dashboardService.getAdminWeek();
    return { success: true, ...result };
  }

  @Get('/api/dashboard/month')
  @UseGuards(AuthGuard)
  async getMonth(
    @CurrentUser() currentUser: UserFromSession,
    @Query('tahun') tahun?: string,
    @Query('bulan') bulan?: string,
    @Query('userId') userId?: string,
  ) {
    const effectiveUserId =
      currentUser.role !== 'admin' ? currentUser.id : userId;
    const result = await this.dashboardService.getMonth(
      tahun ? parseInt(tahun) : new Date().getFullYear(),
      bulan ? parseInt(bulan) : new Date().getMonth() + 1,
      effectiveUserId,
    );
    return { success: true, ...result };
  }
}
