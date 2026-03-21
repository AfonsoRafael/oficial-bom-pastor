import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Injectable()
export class S3StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly publicEndpoint?: string;
  private bucketReady = false;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.get<string>('S3_BUCKET') || '';
    this.region = this.configService.get<string>('S3_REGION') || 'us-east-1';
    this.endpoint = this.configService.get<string>('S3_ENDPOINT') || undefined;
    this.publicEndpoint = this.configService.get<string>('S3_PUBLIC_ENDPOINT') || undefined;

    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID') || '';
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY') || '';

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: Boolean(this.endpoint),
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadBase64Document(base64OrDataUrl: string, folder: string, documentLabel: string): Promise<string> {
    this.ensureS3Config();
    await this.ensureBucketExists();

    const parsed = this.parseBase64(base64OrDataUrl);
    const extension = this.extensionFromMime(parsed.mimeType);
    const datePrefix = new Date().toISOString().slice(0, 10);
    const key = `${folder}/${datePrefix}/${randomUUID()}-${documentLabel}.${extension}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: parsed.buffer,
          ContentType: parsed.mimeType,
        }),
      );
    } catch {
      throw new InternalServerErrorException('Falha ao enviar arquivo para o storage');
    }

    return this.buildFileUrl(key);
  }

  private ensureS3Config() {
    if (!this.bucket) {
      throw new InternalServerErrorException('S3_BUCKET nao configurado');
    }
  }

  private async ensureBucketExists() {
    if (this.bucketReady) {
      return;
    }

    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.bucketReady = true;
      return;
    } catch {
      // Bucket nao existe ainda
    }

    try {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.bucketReady = true;
    } catch {
      throw new InternalServerErrorException('Falha ao preparar bucket no storage');
    }
  }

  private parseBase64(base64OrDataUrl: string): { buffer: Buffer; mimeType: string } {
    const dataUrlMatch = base64OrDataUrl.match(/^data:([^;]+);base64,(.+)$/);

    if (dataUrlMatch) {
      const mimeType = dataUrlMatch[1];
      const base64Payload = dataUrlMatch[2];
      return {
        buffer: Buffer.from(base64Payload, 'base64'),
        mimeType,
      };
    }

    return {
      buffer: Buffer.from(base64OrDataUrl, 'base64'),
      mimeType: 'application/octet-stream',
    };
  }

  private extensionFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };

    return map[mimeType] || 'bin';
  }

  private buildFileUrl(key: string): string {
    const endpoint = this.publicEndpoint || this.endpoint;

    if (endpoint) {
      const normalized = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
      return `${normalized}/${this.bucket}/${key}`;
    }

    return `s3://${this.bucket}/${key}`;
  }
}
