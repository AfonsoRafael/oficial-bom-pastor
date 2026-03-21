import { Module } from '@nestjs/common';
import { PreMatriculasService } from './pre-matriculas.service';
import { PreMatriculasController } from './pre-matriculas.controller';
import { MailerModule } from '../../common/mailer/mailer.module';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Module({
  imports: [MailerModule],
  controllers: [PreMatriculasController],
  providers: [PreMatriculasService, S3StorageService],
})
export class PreMatriculasModule {}
