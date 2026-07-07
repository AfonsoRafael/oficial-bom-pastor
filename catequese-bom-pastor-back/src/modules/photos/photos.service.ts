import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto/photo.dto';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
};

@Injectable()
export class PhotosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3StorageService: S3StorageService,
  ) {}

  async findAllAdmin() {
    const photos = await this.prisma.photo.findMany({
      orderBy: { criadoEm: 'desc' },
    });

    return { photos };
  }

  async findPublic() {
    const photos = await this.prisma.photo.findMany({
      where: { isActive: true },
      orderBy: { criadoEm: 'desc' },
    });

    return { photos };
  }

  async create(dto: CreatePhotoDto, image?: UploadedImageFile) {
    if (!image) {
      throw new BadRequestException('A imagem da foto e obrigatoria');
    }

    const uploaded = await this.uploadImage(image);

    return this.prisma.photo.create({
      data: {
        title: dto.title.trim(),
        description: this.normalizeOptionalString(dto.description),
        imageUrl: uploaded.url,
        storageKey: uploaded.key,
        isActive: this.normalizeBoolean(dto.isActive, true),
      },
    });
  }

  async update(id: string, dto: UpdatePhotoDto, image?: UploadedImageFile) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      throw new NotFoundException('Foto nao encontrada');
    }

    const uploaded = image ? await this.uploadImage(image) : null;

    try {
      const updatedPhoto = await this.prisma.photo.update({
        where: { id },
        data: {
          title: dto.title?.trim() ?? photo.title,
          description: dto.description === undefined ? photo.description : this.normalizeOptionalString(dto.description),
          isActive: dto.isActive === undefined ? photo.isActive : this.normalizeBoolean(dto.isActive, photo.isActive),
          ...(uploaded
            ? {
                imageUrl: uploaded.url,
                storageKey: uploaded.key,
              }
            : {}),
        },
      });

      if (uploaded) {
        await this.deleteStoredFile(photo.storageKey);
      }

      return updatedPhoto;
    } catch (error) {
      if (uploaded) {
        await this.deleteStoredFile(uploaded.key);
      }

      throw error;
    }
  }

  async toggleStatus(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      throw new NotFoundException('Foto nao encontrada');
    }

    return this.prisma.photo.update({
      where: { id },
      data: {
        isActive: !photo.isActive,
      },
    });
  }

  async remove(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });

    if (!photo) {
      throw new NotFoundException('Foto nao encontrada');
    }

    await this.deleteStoredFile(photo.storageKey);

    await this.prisma.photo.delete({ where: { id } });

    return { message: 'Foto removida com sucesso' };
  }

  private async uploadImage(file: UploadedImageFile) {
    const mimeType = (file.mimetype || '').toLowerCase().trim();
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Formato de imagem invalido. Envie JPG, PNG, WEBP ou GIF.');
    }

    return this.s3StorageService.uploadBufferDocument(file.buffer, mimeType, 'photos', 'home-photo');
  }

  private normalizeBoolean(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined) {
      return fallback;
    }

    return ['true', '1', 'yes', 'on'].includes(value.toLowerCase().trim());
  }

  private normalizeOptionalString(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private async deleteStoredFile(storageKey: string) {
    try {
      await this.s3StorageService.deleteObject(storageKey);
    } catch (error) {
      // Falha de storage nao deve impedir o fluxo principal; o backend registra o problema para retry manual.
      console.warn(`Falha ao remover arquivo do storage: ${storageKey}`, error);
    }
  }
}