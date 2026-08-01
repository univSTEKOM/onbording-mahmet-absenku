import { evaluateCheckIn, evaluateCheckOut } from './absensi.rules';

function time(h: number, m: number): Date {
  const d = new Date('2026-07-30');
  d.setHours(h, m, 0, 0);
  return d;
}

describe('absensi.rules', () => {
  describe('evaluateCheckIn', () => {
    it('should return hadir at 04:00 (early bird)', () => {
      const result = evaluateCheckIn(time(4, 0));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('hadir');
    });

    it('should return hadir at 05:00 (early bird)', () => {
      const result = evaluateCheckIn(time(5, 0));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('hadir');
    });

    it('should return hadir at 07:00 (on time)', () => {
      const result = evaluateCheckIn(time(7, 0));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('hadir');
    });

    it('should return hadir at CHECK_IN_END (09:00)', () => {
      const result = evaluateCheckIn(time(9, 0));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('hadir');
    });

    it('should return terlambat after CHECK_IN_END', () => {
      const result = evaluateCheckIn(time(9, 1));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('terlambat');
    });

    it('should return hadir at midnight (new day, before CHECK_IN_END)', () => {
      const result = evaluateCheckIn(time(0, 0));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('hadir');
    });
  });

  describe('evaluateCheckOut', () => {
    it('should return half_day before 14:00', () => {
      const result = evaluateCheckOut(time(13, 0));
      expect(result.pulangCepat).toBe(true);
      expect(result.halfDay).toBe(true);
    });

    it('should return pulang_cepat at 14:00', () => {
      const result = evaluateCheckOut(time(14, 0));
      expect(result.pulangCepat).toBe(true);
      expect(result.halfDay).toBe(false);
    });

    it('should return normal at CHECK_OUT_MIN (16:00)', () => {
      const result = evaluateCheckOut(time(16, 0));
      expect(result.pulangCepat).toBe(false);
      expect(result.halfDay).toBe(false);
    });

    it('should return normal after CHECK_OUT_MIN', () => {
      const result = evaluateCheckOut(time(17, 0));
      expect(result.pulangCepat).toBe(false);
      expect(result.halfDay).toBe(false);
    });
  });
});
