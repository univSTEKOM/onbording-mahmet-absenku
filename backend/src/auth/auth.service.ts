import {
  Injectable,
  Inject,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { AUTH_INSTANCE } from './auth.module';
import type { Auth } from './auth.instance';
import type { RegisterDto } from './auth.register.schema';
import type { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(@Inject(AUTH_INSTANCE) private readonly auth: Auth) {}

  async register(dto: RegisterDto, req: Request) {
    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });
    const isAdminAction = session?.user?.role === 'admin';

    if (!isAdminAction) {
      if (dto.password.length < 8)
        throw new BadRequestException('Password minimal 8 karakter');
      if (!/[A-Z]/.test(dto.password))
        throw new BadRequestException(
          'Password harus mengandung huruf kapital',
        );
      if (!/[a-z]/.test(dto.password))
        throw new BadRequestException('Password harus mengandung huruf kecil');
      if (!/[0-9]/.test(dto.password))
        throw new BadRequestException('Password harus mengandung angka');
    }

    const effectiveRole = isAdminAction ? dto.role || 'karyawan' : 'karyawan';
    const effectiveStatus = isAdminAction ? 'approved' : 'pending';

    const response = await this.auth.api.signUpEmail({
      body: {
        email: dto.email,
        password: dto.password,
        name: dto.nama,
        role: effectiveRole,
        status: effectiveStatus,
        jabatan: dto.jabatan || '',
        phone: dto.phone || '',
        alamat: dto.alamat || '',
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
      const msg = (errBody?.message as string) || '';
      if (
        msg.toLowerCase().includes('already') ||
        msg.toLowerCase().includes('exist')
      ) {
        throw new ConflictException('Email sudah terdaftar');
      }
      throw new BadRequestException(msg || 'Gagal mendaftar');
    }

    const data = (await response.json()) as { user: Record<string, unknown> };
    return {
      id: data.user.id as string,
      email: data.user.email as string,
      name: data.user.name as string,
      role: effectiveRole,
      status: effectiveStatus,
      jabatan: dto.jabatan || '',
      phone: dto.phone || '',
      alamat: dto.alamat || '',
      createdAt: data.user.createdAt || new Date().toISOString(),
    };
  }
}
