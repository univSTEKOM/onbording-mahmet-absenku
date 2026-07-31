export const CHECK_IN_START = '06:45';
export const CHECK_IN_END = '07:45';
export const CHECK_OUT_MIN = '16:00';

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function nowMinutes(now?: Date): number {
  const n = now ?? new Date();
  return n.getHours() * 60 + n.getMinutes();
}

export type CheckInResult =
  | { allowed: false; status: 'too_early' }
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

/** @param now — optional Date untuk testing. default: new Date() */
export function evaluateCheckIn(now?: Date): CheckInResult {
  const current = nowMinutes(now);
  const start = toMinutes(CHECK_IN_START);
  const end = toMinutes(CHECK_IN_END);

  if (current < start) return { allowed: false, status: 'too_early' };
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

/** @param now — optional Date untuk testing. default: new Date() */
export function evaluateCheckOut(now?: Date): {
  pulangCepat: boolean;
  subCategory: string;
} {
  const current = nowMinutes(now);
  if (current < toMinutes(CHECK_OUT_MIN)) {
    return { pulangCepat: true, subCategory: 'physical_violation' };
  }
  return { pulangCepat: false, subCategory: 'physical_standard' };
}
