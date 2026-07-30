import { evaluateCheckIn, evaluateCheckOut, CHECK_IN_START, CHECK_IN_END, CHECK_OUT_MIN } from './absensi.rules';

function time(h: number, m: number): Date {
  const d = new Date('2026-07-30');
  d.setHours(h, m, 0, 0);
  return d;
}

describe('absensi.rules', () => {
  describe('evaluateCheckIn', () => {
    it('should return too_early before CHECK_IN_START', () => {
      const [h] = CHECK_IN_START.split(':').map(Number);
      const result = evaluateCheckIn(time(h - 1, 0));
      expect(result.allowed).toBe(false);
      expect(result.status).toBe('too_early');
    });

    it('should return hadir at CHECK_IN_START', () => {
      const [h, m] = CHECK_IN_START.split(':').map(Number);
      const result = evaluateCheckIn(time(h, m));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('hadir');
    });

    it('should return hadir at CHECK_IN_END', () => {
      const [h, m] = CHECK_IN_END.split(':').map(Number);
      const result = evaluateCheckIn(time(h, m));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('hadir');
    });

    it('should return terlambat after CHECK_IN_END', () => {
      const [h] = CHECK_IN_END.split(':').map(Number);
      const result = evaluateCheckIn(time(h + 1, 0));
      expect(result.allowed).toBe(true);
      expect(result.status).toBe('terlambat');
    });
  });

  describe('evaluateCheckOut', () => {
    it('should return pulang_cepat before CHECK_OUT_MIN', () => {
      const [h] = CHECK_OUT_MIN.split(':').map(Number);
      const result = evaluateCheckOut(time(h - 1, 0));
      expect(result.pulangCepat).toBe(true);
    });

    it('should return normal at CHECK_OUT_MIN', () => {
      const [h, m] = CHECK_OUT_MIN.split(':').map(Number);
      const result = evaluateCheckOut(time(h, m));
      expect(result.pulangCepat).toBe(false);
    });

    it('should return normal after CHECK_OUT_MIN', () => {
      const [h] = CHECK_OUT_MIN.split(':').map(Number);
      const result = evaluateCheckOut(time(h + 1, 0));
      expect(result.pulangCepat).toBe(false);
    });
  });
});
