import { Module } from '@nestjs/common';
import { CatequizandosService } from './alunos.service';
import { CatequizandosController } from './alunos.controller';

@Module({
  controllers: [CatequizandosController],
  providers: [CatequizandosService],
  exports: [CatequizandosService],
})
export class CatequizandosModule {}
