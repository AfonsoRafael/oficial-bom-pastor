import { Module } from '@nestjs/common';
import { ItensLojaController } from './loja.controller';
import { ItensLojaService } from './loja.service';
import { MailerModule } from '../../common/mailer/mailer.module';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Module({
    imports: [MailerModule],
    controllers: [ItensLojaController],
    providers: [ItensLojaService, S3StorageService],
})
export class ItensLojaModule {}
