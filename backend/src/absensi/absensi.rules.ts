export const CHECK_IN_END = '09:00';
export const CHECK_OUT_MIN = '16:00';
export const MAX_CHECK_IN = '23:59';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function nowMinutes(now?: Date): number {
  const n = now ?? new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export type CheckInResult =
  | { allowed: false; status: 'tidak_bisa' }
  | {
      allowed: true;
      status: 'hadir';
      mainCategory: string;
      subCategory: string;
    }
  | {
      allowed: true;
      status: 'terlambat';
      mainCategory: string;
      subCategory: string;
    };

/**
 * @param checkInTime — waktu check-in dari frontend (ISO string yang sudah di-parse).
 *                      Default: new Date() (server time)
 */
export function evaluateCheckIn(checkInTime?: Date): CheckInResult {
  const current = nowMinutes(checkInTime);
  const end = toMinutes(CHECK_IN_END);
  const max = toMinutes(MAX_CHECK_IN);

  if (current > max) return { allowed: false, status: 'tidak_bisa' };
  if (current <= end)
    return {
      allowed: true,
      status: 'hadir',
      mainCategory: 'physical_present',
      subCategory: 'physical_standard',
    };
  return {
    allowed: true,
    status: 'terlambat',
    mainCategory: 'physical_present',
    subCategory: 'physical_violation',
  };
}

export function evaluateCheckOut(now?: Date): {
  pulangCepat: boolean;
  halfDay: boolean;
  subCategory: string;
} {
  const current = nowMinutes(now);
  if (current < toMinutes('14:00')) {
    return {
      pulangCepat: true,
      halfDay: true,
      subCategory: 'physical_violation',
    };
  }
  if (current < toMinutes(CHECK_OUT_MIN)) {
    return {
      pulangCepat: true,
      halfDay: false,
      subCategory: 'physical_violation',
    };
  }
  return {
    pulangCepat: false,
    halfDay: false,
    subCategory: 'physical_standard',
  };
}
