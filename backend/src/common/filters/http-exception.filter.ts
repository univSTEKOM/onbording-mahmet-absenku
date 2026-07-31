import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let code = 'INTERNAL_ERROR';
    if (status === 400) code = 'VALIDATION_ERROR';
    else if (status === 401) code = 'UNAUTHORIZED';
    else if (status === 403) code = 'FORBIDDEN';
    else if (status === 404) code = 'NOT_FOUND';
    else if (status === 409) code = 'CONFLICT';
    else if (status === 429) code = 'RATE_LIMIT';
    else if (status === 422) code = 'UNPROCESSABLE';

    let message = exception.message;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else {
      const res = exceptionResponse as Record<string, unknown>;
      /* Support nested format: { success, error: { message } } */
      if (
        res.error &&
        typeof res.error === 'object' &&
        typeof (res.error as Record<string, unknown>).message === 'string'
      ) {
        message = (res.error as Record<string, unknown>).message as string;
      } else if (typeof res.message === 'string') {
        message = res.message;
      }
    }

    response.status(status).json({
      success: false,
      error: {
        code,
        message,
      },
    });
  }
}
