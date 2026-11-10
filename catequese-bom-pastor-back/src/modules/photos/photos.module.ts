import { Module } from '@nestjs/common';
import { PhotosController } from './photos.controller';
import { PhotosService } from './photos.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [PhotosController],
  providers: [PhotosService, S3StorageService],
})
export class PhotosModule {}