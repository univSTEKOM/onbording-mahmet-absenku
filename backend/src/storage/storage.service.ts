import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'node:crypto'

@Injectable()
export class StorageService {
  private readonly s3: S3Client
  private readonly bucket: string

  constructor() {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'minioadmin',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      },
      forcePathStyle: true,
    })
    this.bucket = process.env.MINIO_BUCKET_FOTO || 'absenku-foto'
  }

  async upload(buffer: Buffer, mimeType: string): Promise<string> {
    const ext = mimeType.split('/')[1] || 'jpg'
    const key = `foto/${randomUUID()}.${ext}`

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    }))

    return `${process.env.MINIO_ENDPOINT || 'http://localhost:9000'}/${this.bucket}/${key}`
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
