import { Module } from '@nestjs/common';
import { CatequistasService } from './catequistas.service';
import { CatequistasController } from './catequistas.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CatequistasService],
  controllers: [CatequistasController],
})
export class CatequistasModule {}
