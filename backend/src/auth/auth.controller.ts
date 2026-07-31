import { Controller, Post, Body, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { registerSchema } from './auth.register.schema';
import type { RegisterDto } from './auth.register.schema';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/api/register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterDto,
    @Req() req: Request,
  ) {
    const user = await this.authService.register(body, req);
    return { success: true, data: { user } };
  }
}
