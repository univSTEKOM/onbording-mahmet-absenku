jest.mock('better-auth', () => ({ betterAuth: jest.fn() }));
jest.mock('better-auth/adapters/drizzle', () => ({ drizzleAdapter: jest.fn() }));
jest.mock('better-auth/node', () => ({
  fromNodeHeaders: jest.fn(),
  toNodeHandler: jest.fn(),
}));

import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AUTH_INSTANCE } from './auth.module';
import { BadRequestException, ConflictException } from '@nestjs/common';

function mockRequest(): Record<string, unknown> {
  return { headers: {} };
}

describe('AuthService', () => {
  let service: AuthService;
  let mockGetSession: jest.Mock;
  let mockSignUpEmail: jest.Mock;

  const mockAuth = {
    api: {
      getSession: () => mockGetSession(),
      signUpEmail: (opts: Record<string, unknown>) => mockSignUpEmail(opts),
    },
  };

  beforeEach(async () => {
    mockGetSession = jest.fn();
    mockSignUpEmail = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AUTH_INSTANCE, useValue: mockAuth },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  describe('register', () => {
    it('should reject weak password for public user', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        service.register(
          { email: 'test@test.com', password: 'short', nama: 'Test' },
          mockRequest() as never,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject password without uppercase', async () => {
      mockGetSession.mockResolvedValue(null);

      await expect(
        service.register(
          { email: 'test@test.com', password: 'lowercase1', nama: 'Test' },
          mockRequest() as never,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject duplicate email', async () => {
      mockGetSession.mockResolvedValue(null);
      mockSignUpEmail.mockResolvedValue({
        status: 400,
        text: () => Promise.resolve(JSON.stringify({ message: 'User already exists' })),
        json: () => Promise.resolve({ message: 'User already exists' }),
      });

      await expect(
        service.register(
          { email: 'existing@test.com', password: 'ValidPass1', nama: 'Test' },
          mockRequest() as never,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should register successfully for public user', async () => {
      mockGetSession.mockResolvedValue(null);
      mockSignUpEmail.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ user: { id: 'new-id', email: 'new@test.com', name: 'New User', createdAt: '2026-07-30' } }),
        text: () => Promise.resolve(JSON.stringify({ user: { id: 'new-id', email: 'new@test.com', name: 'New User' } })),
      });

      const result = await service.register(
        { email: 'new@test.com', password: 'ValidPass1', nama: 'New User', jabatan: 'Staff' },
        mockRequest() as never,
      );
      expect(result).toHaveProperty('id', 'new-id');
      expect(result).toHaveProperty('status', 'pending');
    });

    it('should set approved status when admin registers', async () => {
      mockGetSession.mockResolvedValue({ user: { role: 'admin' } });
      mockSignUpEmail.mockResolvedValue({
        status: 200,
        json: () => Promise.resolve({ user: { id: 'new-id', email: 'new@test.com', name: 'New User' } }),
        text: () => Promise.resolve(''),
      });

      const result = await service.register(
        { email: 'new@test.com', password: 'simple', nama: 'New User', role: 'karyawan' },
        mockRequest() as never,
      );
      expect(result).toHaveProperty('status', 'approved');
    });
  });
});
