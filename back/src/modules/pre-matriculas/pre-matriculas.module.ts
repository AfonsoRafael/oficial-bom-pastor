import { Module } from '@nestjs/common';
import { PreMatriculasService } from './pre-matriculas.service';
import { PreMatriculasController } from './pre-matriculas.controller';
import { MailerModule } from '../../common/mailer/mailer.module';
import { S3StorageService } from '../../common/storage/s3-storage.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MailerModule, AuthModule],
  controllers: [PreMatriculasController],
  providers: [PreMatriculasService, S3StorageService],
})
export class PreMatriculasModule {}
