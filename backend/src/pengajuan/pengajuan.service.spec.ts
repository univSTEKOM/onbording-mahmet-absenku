import { Test } from '@nestjs/testing';
import { PengajuanService } from './pengajuan.service';
import { DRIZZLE_DB } from '../database/database.providers';
import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

function mockDb() {
  const chain: Record<string, unknown> = {
    from: () => chain,
    where: () => chain,
    limit: () => Promise.resolve([]),
    orderBy: () => chain,
    offset: () => chain,
    values: () => ({
      returning: () => Promise.resolve([{ id: 1, status: 'pending' }]),
    }),
    set: () => chain,
    returning: () => Promise.resolve([{ id: 1, status: 'approved' }]),
  };
  return {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    delete: () => ({ where: () => Promise.resolve() }),
  };
}

describe('PengajuanService', () => {
  let service: PengajuanService;
  let db: ReturnType<typeof mockDb>;

  beforeEach(async () => {
    db = mockDb();
    const module = await Test.createTestingModule({
      providers: [PengajuanService, { provide: DRIZZLE_DB, useValue: db }],
    }).compile();
    service = module.get(PengajuanService);
  });

  describe('create', () => {
    it('should reject non-admin create for other user', async () => {
      await expect(
        service.create(
          {
            userId: 'user-2',
            jenis: 'cuti',
            tanggalMulai: '2026-08-01',
            tanggalSelesai: '2026-08-03',
            alasan: 'Liburan tahunan keluarga',
          },
          'user-1',
          'karyawan',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin create for any user', async () => {
      db.insert().values = () => ({
        returning: () =>
          Promise.resolve([
            { id: 1, userId: 'user-2', jenis: 'cuti', status: 'pending' },
          ]),
      });
      const result = await service.create(
        {
          userId: 'user-2',
          jenis: 'cuti',
          tanggalMulai: '2026-08-01',
          tanggalSelesai: '2026-08-03',
          alasan: 'Liburan tahunan keluarga',
        },
        'admin-1',
        'admin',
      );
      expect(result).toHaveProperty('status', 'pending');
      expect(result).toHaveProperty('id', 1);
    });
  });

  describe('update', () => {
    it('should reject update for non-existent pengajuan', async () => {
      db.select().limit = () => Promise.resolve([]);
      await expect(
        service.update(999, { status: 'approved' }, 'admin-1', 'admin'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should reject update for already processed pengajuan', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'approved', userId: 'user-1' }]);
      await expect(
        service.update(1, { status: 'rejected' }, 'admin-1', 'admin'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject edit pengajuan orang lain oleh non-admin', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'pending', userId: 'user-2' }]);
      await expect(
        service.update(
          1,
          { alasan: 'Alasan baru di sini' },
          'user-1',
          'karyawan',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should reject status change by non-admin', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'pending', userId: 'user-1' }]);
      await expect(
        service.update(1, { status: 'approved' }, 'user-1', 'karyawan'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow owner to edit own pending pengajuan', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'pending', userId: 'user-1' }]);
      let setData: Record<string, unknown> = {};
      db.update().set = (data: Record<string, unknown>) => {
        setData = data;
        return {
          where: () => ({
            returning: () =>
              Promise.resolve([{ id: 1, ...data, status: 'pending' }]),
          }),
        };
      };

      const result = await service.update(
        1,
        { alasan: 'Alasan baru di sini', tanggalMulai: '2026-08-05' },
        'user-1',
        'karyawan',
      );
      expect(setData).toHaveProperty('alasan', 'Alasan baru di sini');
      expect(setData).toHaveProperty('tanggalMulai', '2026-08-05');
      expect(result).toHaveProperty('status', 'pending');
    });

    it('should allow admin to approve', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'pending', userId: 'user-1' }]);
      db.update().set = () => ({
        where: () => ({
          returning: () => Promise.resolve([{ id: 1, status: 'approved' }]),
        }),
      });

      const result = await service.update(
        1,
        { status: 'approved' },
        'admin-1',
        'admin',
      );
      expect(result).toHaveProperty('status', 'approved');
    });
  });

  describe('delete', () => {
    it('should reject delete for non-existent pengajuan', async () => {
      db.select().limit = () => Promise.resolve([]);
      await expect(service.delete(999, 'user-1', 'karyawan')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should reject delete for processed pengajuan', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'approved', userId: 'user-1' }]);
      await expect(service.delete(1, 'user-1', 'karyawan')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should reject delete by non-owner, non-admin', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'pending', userId: 'user-1' }]);
      await expect(service.delete(1, 'user-2', 'karyawan')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow owner to delete pending', async () => {
      db.select().limit = () =>
        Promise.resolve([{ id: 1, status: 'pending', userId: 'user-1' }]);
      const result = await service.delete(1, 'user-1', 'karyawan');
      expect(result).toHaveProperty('message', 'Dihapus');
    });
  });
});
