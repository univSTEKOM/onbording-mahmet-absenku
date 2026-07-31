import type { Request, Response, NextFunction } from 'express';

type JsonFn = (body?: unknown) => Response;

type AttemptRecord = { count: number; blockedAt?: number; duration?: number };

const attempts = new Map<string, AttemptRecord>();
const MAX_LOGIN_ATTEMPTS = 3;
const MAX_REGISTER_ATTEMPTS = 5;
const BASE_BLOCK = 30000;
const MAX_BLOCK = 120000;
const REGISTER_WINDOW = 60000;

function isBlocked(key: string, maxAttempts: number): number {
  const r = attempts.get(key);
  if (!r || r.count < maxAttempts) return 0;
  const now = Date.now();
  const elapsed = now - (r.blockedAt || 0);
  if (elapsed < (r.duration || 0)) return (r.duration || 0) - elapsed;
  attempts.delete(key);
  return 0;
}

function recordAttempt(key: string, maxAttempts: number) {
  let r = attempts.get(key);
  if (!r) {
    r = { count: 0 };
    attempts.set(key, r);
  }
  r.count++;
  if (r.count >= maxAttempts) {
    r.blockedAt = Date.now();
    r.duration = Math.min(
      BASE_BLOCK + (r.count - maxAttempts) * 15000,
      MAX_BLOCK,
    );
  }
}

function clearAttempts(key: string, ipKey: string) {
  attempts.delete(key);
  attempts.delete(ipKey);
}

function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const email = (req.body as Record<string, unknown>)?.email as
    string | undefined;
  if (!email) return next();

  const emailKey = email.toLowerCase();
  const ipKey = `${req.ip}:login`;
  const remaining = Math.max(
    isBlocked(emailKey, MAX_LOGIN_ATTEMPTS),
    isBlocked(ipKey, MAX_LOGIN_ATTEMPTS),
  );
  if (remaining > 0) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message: `Terlalu banyak percobaan. Coba lagi ${Math.ceil(remaining / 1000)} detik lagi.`,
      },
    });
    return;
  }

  const origJson = res.json.bind(res) as JsonFn;
  res.json = function (data: Record<string, unknown>) {
    if (data?.token || data?.user) {
      clearAttempts(emailKey, ipKey);
    } else {
      recordAttempt(emailKey, MAX_LOGIN_ATTEMPTS);
      recordAttempt(ipKey, MAX_LOGIN_ATTEMPTS);
    }
    return origJson(data);
  };
  next();
}

function registerRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ipKey = `${req.ip}:register`;
  const now = Date.now();
  const r = attempts.get(ipKey);
  if (
    r &&
    r.count >= MAX_REGISTER_ATTEMPTS &&
    now - (r.blockedAt || now) < REGISTER_WINDOW
  ) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT',
        message:
          'Terlalu banyak percobaan pendaftaran. Coba lagi dalam 1 menit.',
      },
    });
    return;
  }
  if (r && now - (r.blockedAt || now) >= REGISTER_WINDOW) {
    attempts.delete(ipKey);
  }

  const origJson = res.json.bind(res) as JsonFn;
  res.json = function (data: Record<string, unknown>) {
    if (data?.success === true) {
      attempts.delete(ipKey);
    } else {
      recordAttempt(ipKey, MAX_REGISTER_ATTEMPTS);
    }
    return origJson(data);
  };
  next();
}

export { loginRateLimiter, registerRateLimiter };
