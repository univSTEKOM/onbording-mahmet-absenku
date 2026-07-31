import { NestFactory } from '@nestjs/core';
import type { Request, Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AUTH_INSTANCE } from './auth/auth.module';
import {
  loginRateLimiter,
  registerRateLimiter,
} from './auth/auth.rate-limiter';
import type { Auth } from './auth/auth.instance';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  const auth = app.get<Auth>(AUTH_INSTANCE);
  const { toNodeHandler } = await import('better-auth/node');

  app.use('/api/auth/sign-in/email', loginRateLimiter);
  app.use('/api/register', registerRateLimiter);
  app.use('/api/auth/*', (req: Request, res: Response) => {
    toNodeHandler(auth)(req, res).catch((err) => {
      console.error('Better Auth error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
        });
      }
    });
  });

  await app.listen(process.env.PORT ?? 9090);
}
bootstrap().catch((e) => {
  console.error('Failed to start:', e);
  process.exit(1);
});
