import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';

function mimeExt(mime: string): string {
  if (mime === 'image/svg+xml') return 'svg';
  return mime.split('/')[1] || 'jpg';
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    this.publicUrl = process.env.MINIO_PUBLIC_URL || endpoint;
    this.s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    });
    this.bucket = process.env.MINIO_BUCKET_FOTO || 'absenku-foto';
  }

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
    } catch {
      try {
        await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
      } catch (e) {
        console.warn(
          `MinIO tidak tersedia (${(e as Error).message}). Upload akan gagal sampai MinIO jalan.`,
        );
      }
    }
  }

  async upload(buffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeExt(mimeType);
    const key = `foto/${randomUUID()}.${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
    } catch (e) {
      throw new InternalServerErrorException({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: `Gagal upload file: ${(e as Error).message}`,
        },
      });
    }

    return `${this.publicUrl}/${this.bucket}/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.split(`/${this.bucket}/`)[1];
    if (!key) return;

    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }
}
