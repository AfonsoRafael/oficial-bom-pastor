import { Module } from '@nestjs/common';
import { CatequizandosService } from './alunos.service';
import { CatequizandosController } from './alunos.controller';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Module({
  controllers: [CatequizandosController],
  providers: [CatequizandosService, S3StorageService],
  exports: [CatequizandosService],
})
export class CatequizandosModule {}
