import { Injectable, InternalServerErrorException, OnModuleInit } from '@nestjs/common'
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

const ENDPOINT = process.env.MINIO_ENDPOINT || 'http://localhost:9000'
const PUBLIC_URL = process.env.MINIO_PUBLIC_URL || ENDPOINT

function mimeExt(mime: string): string {
  if (mime === 'image/svg+xml') return 'svg'
  return mime.split('/')[1] || 'jpg'
}

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly s3: S3Client
  private readonly bucket: string

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: ENDPOINT,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    })
    this.bucket = process.env.MINIO_BUCKET_FOTO || 'absenku-foto'
  }

  async onModuleInit() {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }))
    } catch {
      await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }))
    }
  }

  async upload(buffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeExt(mimeType)
    const key = `foto/${randomUUID()}.${ext}`

    try {
      await this.s3.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }))
    } catch (e) {
      throw new InternalServerErrorException({
        success: false,
        error: { code: 'UPLOAD_FAILED', message: `Gagal upload file: ${(e as Error).message}` },
      })
    }

    return `${PUBLIC_URL}/${this.bucket}/${key}`
  }

  async delete(url: string): Promise<void> {
    const key = url.split(`/${this.bucket}/`)[1]
    if (!key) return

    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
  }
}
