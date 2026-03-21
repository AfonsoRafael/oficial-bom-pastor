import { Module } from '@nestjs/common';
import { CatequistasService } from './catequistas.service';
import { CatequistasController } from './catequistas.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Module({
  imports: [PrismaModule],
  providers: [CatequistasService, S3StorageService],
  controllers: [CatequistasController],
})
export class CatequistasModule {}
