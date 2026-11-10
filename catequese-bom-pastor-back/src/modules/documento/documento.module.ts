import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { DocumentoController } from './documento.controller';
import { DocumentoService } from './documento.service';

@Module({
  imports: [PrismaModule],
  controllers: [DocumentoController],
  providers: [DocumentoService],
})
export class DocumentoModule {}
