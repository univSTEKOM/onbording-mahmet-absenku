import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UnprocessableEntityException,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../common/guards/auth.guard';
import { StorageService } from './storage.service';

@Controller()
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('/api/upload/foto')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFoto(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: 'image' }),
        ],
        errorHttpStatusCode: 422,
        exceptionFactory: (error) =>
          new UnprocessableEntityException({
            success: false,
            error: { code: 'UPLOAD_FAILED', message: error },
          }),
      }),
    )
    file: { buffer: Buffer; mimetype: string } | undefined,
  ) {
    if (!file) {
      throw new BadRequestException({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'File tidak ditemukan' },
      });
    }

    const url = await this.storageService.upload(file.buffer, file.mimetype);
    return { success: true, data: { url } };
  }
}
