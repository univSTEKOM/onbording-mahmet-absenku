import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common'
import { z } from 'zod'

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: z.ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value)
    if (!result.success) {
      const message = result.error.issues[0]?.message || 'Validasi gagal'
      throw new BadRequestException({ success: false, error: { code: 'VALIDATION_ERROR', message } })
    }
    return result.data
  }
}
