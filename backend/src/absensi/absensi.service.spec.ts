import { Test } from '@nestjs/testing';
import { AbsensiService } from './absensi.service';
import { DRIZZLE_DB } from '../database/database.providers';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('AbsensiService', () => {
  let service: AbsensiService;
  let mockLimit: jest.Mock;
  let mockReturning: jest.Mock;

  function db() {
    return {
      select: () => ({
        from: () => ({
          where: () => ({ limit: mockLimit, orderBy: () => ({ limit: mockLimit }) }),
          limit: mockLimit,
        }),
        where: () => ({ limit: mockLimit }),
      }),
      insert: () => ({
        values: () => ({ returning: mockReturning }),
      }),
      update: () => ({
        set: () => ({
          where: () => ({ returning: mockReturning }),
        }),
      }),
      delete: () => ({ where: () => jest.fn() }),
    };
  }

  beforeEach(async () => {
    mockLimit = jest.fn();
    mockReturning = jest.fn();
    const module = await Test.createTestingModule({
      providers: [
        AbsensiService,
        { provide: DRIZZLE_DB, useFactory: db },
      ],
    }).compile();
    service = module.get(AbsensiService);
  });

  describe('checkIn', () => {
    it('should reject non-admin check-in for other user', async () => {
      await expect(
        service.checkIn({ userId: 'user-2', tanggal: '2026-07-30' }, 'user-1', 'karyawan'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject check-in for non-existent user', async () => {
      mockLimit.mockResolvedValue([]);
      await expect(
        service.checkIn({ userId: 'unknown', tanggal: '2026-07-30' }, 'unknown', 'admin'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject duplicate check-in', async () => {
      mockLimit
        .mockResolvedValueOnce([{ id: 'user-1' }])  // user exists
        .mockResolvedValueOnce([{ id: 1 }]);           // duplicate exists
      await expect(
        service.checkIn({ userId: 'user-1', tanggal: '2026-07-30' }, 'user-1', 'admin'),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow admin check-in for any user', async () => {
      mockLimit
        .mockResolvedValueOnce([{ id: 'user-2' }])  // user exists
        .mockResolvedValueOnce([]);                    // no duplicate
      mockReturning.mockResolvedValue([{ id: 1, status: 'hadir' }]);

      const result = await service.checkIn(
        { userId: 'user-2', tanggal: '2026-07-30' }, 'admin-1', 'admin',
      );
      expect(result).toEqual({ id: 1, status: 'hadir' });
    });
  });

  describe('checkOut', () => {
    it('should reject check-out for non-existent absensi', async () => {
      mockLimit.mockResolvedValue([]);
      await expect(
        service.checkOut(999, { checkOut: new Date().toISOString() }, 'user-1', 'karyawan'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject non-admin check-out for other user', async () => {
      mockLimit.mockResolvedValue([{ id: 1, userId: 'user-2', status: 'hadir', mainCategory: 'physical_present', subCategory: 'physical_standard', photos: [], checkIn: new Date() }]);
      await expect(
        service.checkOut(1, { checkOut: new Date().toISOString() }, 'user-1', 'karyawan'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin check-out for any user', async () => {
      mockLimit.mockResolvedValue([{ id: 1, userId: 'user-2', status: 'hadir', mainCategory: 'physical_present', subCategory: 'physical_standard', photos: [], checkIn: new Date() }]);
      mockReturning.mockResolvedValue([{ id: 1, status: 'hadir', checkOut: new Date().toISOString() }]);
      const result = await service.checkOut(1, { checkOut: new Date().toISOString() }, 'admin-1', 'admin');
      expect(result).toHaveProperty('status', 'hadir');
    });
  });
});
