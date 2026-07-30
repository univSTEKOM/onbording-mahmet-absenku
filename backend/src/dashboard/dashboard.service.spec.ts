import { Test } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DRIZZLE_DB } from '../database/database.providers';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockLimit: jest.Mock;

  function db() {
    return {
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: mockLimit,
              then: (resolve: (v: unknown) => void) => resolve(mockLimit()),
            }),
            limit: mockLimit,
            then: (resolve: (v: unknown) => void) => resolve(mockLimit()),
          }),
        }),
      }),
    };
  }

  beforeEach(async () => {
    mockLimit = jest.fn();
    const module = await Test.createTestingModule({
      providers: [DashboardService, { provide: DRIZZLE_DB, useFactory: db }],
    }).compile();
    service = module.get(DashboardService);
  });

  describe('getRecent', () => {
    it('should return 7 days of data', async () => {
      mockLimit.mockResolvedValue([]);
      const result = await service.getRecent('user-1');
      expect(result.data).toHaveLength(7);
    });

    it('should fill in matching data for existing records', async () => {
      const today = new Date().toISOString().split('T')[0];
      mockLimit.mockResolvedValue([
        {
          tanggal: today,
          checkIn: new Date(),
          checkOut: new Date(),
          status: 'hadir',
        },
      ]);
      const result = await service.getRecent('user-1');
      const todayEntry = result.data[6];
      expect(todayEntry.status).toBe('hadir');
    });
  });

  describe('getMonth', () => {
    it('should return data for all days in month', async () => {
      mockLimit.mockResolvedValue([]);
      const result = await service.getMonth(2026, 7);
      expect(result.data).toHaveLength(31);
    });

    it('should have present/absentPermit/absentUnpermit fields', async () => {
      mockLimit.mockResolvedValue([]);
      const result = await service.getMonth(2026, 7);
      expect(result.data[0]).toHaveProperty('present');
      expect(result.data[0]).toHaveProperty('absentPermit');
      expect(result.data[0]).toHaveProperty('absentUnpermit');
    });
  });
});
