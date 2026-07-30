import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DRIZZLE_DB } from '../database/database.providers';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockWhere: jest.Mock;
  let mockSet: jest.Mock;
  let capturedSetData: Record<string, unknown>;

  function db() {
    return {
      select: () => ({
        from: () => ({
          where: mockWhere,
          limit: jest.fn().mockResolvedValue([]),
          orderBy: () => ({ limit: jest.fn().mockResolvedValue([]) }),
        }),
      }),
      insert: () => ({
        values: () => ({ returning: jest.fn() }),
      }),
      update: () => ({
        set: mockSet,
      }),
      delete: () => ({ where: () => jest.fn() }),
    };
  }

  beforeEach(async () => {
    capturedSetData = {};
    mockWhere = jest.fn();
    mockSet = jest.fn().mockImplementation((data: Record<string, unknown>) => {
      capturedSetData = data;
      return { where: () => jest.fn() };
    });
    const module = await Test.createTestingModule({
      providers: [UsersService, { provide: DRIZZLE_DB, useFactory: db }],
    }).compile();
    service = module.get(UsersService);
  });

  describe('getProfile', () => {
    it('should throw NotFoundException for non-existent user', async () => {
      mockWhere.mockReturnValue({ limit: jest.fn().mockResolvedValue([]) });
      await expect(service.getProfile('unknown-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return user profile', async () => {
      mockWhere.mockReturnValue({
        limit: jest.fn().mockResolvedValue([
          {
            id: 'u1',
            email: 'test@test.com',
            name: 'Test',
            role: 'karyawan',
            status: 'approved',
            emailVerified: false,
          },
        ]),
      });
      const profile = await service.getProfile('u1');
      expect(profile).toHaveProperty('id', 'u1');
      expect(profile).not.toHaveProperty('emailVerified');
    });
  });

  describe('updateProfile', () => {
    it('should reject update for other user', async () => {
      await expect(
        service.updateProfile('user-2', { nama: 'Test' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject duplicate email', async () => {
      mockWhere
        .mockReturnValueOnce({
          limit: jest
            .fn()
            .mockResolvedValue([{ id: 'user-1', status: 'approved' }]),
        })
        .mockReturnValueOnce({
          limit: jest.fn().mockResolvedValue([{ id: 'user-2' }]),
        })
        .mockReturnValue({ limit: jest.fn().mockResolvedValue([]) });

      await expect(
        service.updateProfile(
          'user-1',
          { email: 'existing@test.com' },
          'user-1',
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow update with own email', async () => {
      mockWhere
        .mockReturnValueOnce({
          limit: jest
            .fn()
            .mockResolvedValue([{ id: 'user-1', status: 'approved' }]),
        })
        .mockReturnValueOnce({
          limit: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
        })
        .mockReturnValue({
          limit: jest
            .fn()
            .mockResolvedValue([
              { id: 'user-1', email: 'same@test.com', name: 'test' },
            ]),
        });

      const result = await service.updateProfile(
        'user-1',
        { email: 'same@test.com' },
        'user-1',
      );
      expect(result).toHaveProperty('id', 'user-1');
    });

    it('should reset status to pending if rejected', async () => {
      mockWhere
        .mockReturnValueOnce({
          limit: jest
            .fn()
            .mockResolvedValue([{ id: 'user-1', status: 'rejected' }]),
        })
        .mockReturnValue({
          limit: jest.fn().mockResolvedValue([{ id: 'user-1' }]),
        });

      await service.updateProfile('user-1', { nama: 'Updated' }, 'user-1');
      expect(capturedSetData).toHaveProperty('status', 'pending');
      expect(capturedSetData).toHaveProperty('rejectionNotes', '[]');
    });
  });

  describe('updateUserStatus', () => {
    it('should approve user and clear notes', async () => {
      mockWhere.mockReturnValue({
        limit: jest
          .fn()
          .mockResolvedValue([{ id: 'u1', rejectionNotes: '[]' }]),
      });
      await service.updateUserStatus('u1', { status: 'approved' });
      expect(capturedSetData).toHaveProperty('status', 'approved');
      expect(capturedSetData).toHaveProperty('rejectionNotes', '[]');
    });

    it('should reject with note', async () => {
      mockWhere.mockReturnValue({
        limit: jest
          .fn()
          .mockResolvedValue([{ id: 'u1', rejectionNotes: '[]' }]),
      });
      await service.updateUserStatus('u1', {
        status: 'rejected',
        note: 'Data tidak lengkap',
      });
      expect(capturedSetData).toHaveProperty('status', 'rejected');
      const notes = JSON.parse(capturedSetData.rejectionNotes as string);
      expect(notes).toHaveLength(1);
      expect(notes[0].note).toBe('Data tidak lengkap');
    });
  });
});
