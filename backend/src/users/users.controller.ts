import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';
import {
  updateUserSchema,
  adminUpdateUserSchema,
  updateUserStatusSchema,
  addNoteSchema,
} from './users.schema';
import type {
  UpdateUserDto,
  AdminUpdateUserDto,
  UpdateUserStatusDto,
  AddNoteDto,
} from './users.schema';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/api/me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() currentUser: { id: string }) {
    const profile = await this.usersService.getProfile(currentUser.id);
    return { success: true, data: profile };
  }

  @Patch('/users/:id')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  async updateProfile(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() currentUser: { id: string },
  ) {
    const profile = await this.usersService.updateProfile(
      id,
      body,
      currentUser.id,
    );
    return { success: true, data: profile };
  }

  @Get('/api/users/pending')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getPendingUsers() {
    const users = await this.usersService.getPendingUsers();
    return { success: true, data: users };
  }

  @Get('/api/users/all')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers(
    @Query('_page') page?: string,
    @Query('_limit') limit?: string,
    @Query('q') q?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.usersService.getAllUsers({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      q,
      role,
      status,
    });
    return { success: true, ...result };
  }

  @Patch('/api/users/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(adminUpdateUserSchema))
  async adminUpdateUser(
    @Param('id') id: string,
    @Body() body: AdminUpdateUserDto,
  ) {
    const result = await this.usersService.adminUpdateUser(id, body);
    return { success: true, data: result };
  }

  @Patch('/api/users/:id/status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(updateUserStatusSchema))
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    const result = await this.usersService.updateUserStatus(id, body);
    return { success: true, data: result };
  }

  @Post('/api/users/:id/notes')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @UsePipes(new ZodValidationPipe(addNoteSchema))
  async addUserNote(@Param('id') id: string, @Body() body: AddNoteDto) {
    const result = await this.usersService.addUserNote(id, body);
    return { success: true, data: result };
  }

  @Delete('/api/users/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id') id: string) {
    const result = await this.usersService.deleteUser(id);
    return { success: true, data: result };
  }
}
