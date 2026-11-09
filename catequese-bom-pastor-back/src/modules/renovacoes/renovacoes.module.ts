import { Module } from '@nestjs/common';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { RenovacoesController } from './renovacoes.controller';
import { RenovacoesService } from './renovacoes.service';

@Module({
  controllers: [RenovacoesController],
  providers: [RenovacoesService, S3StorageService],
})
export class RenovacoesModule {}
