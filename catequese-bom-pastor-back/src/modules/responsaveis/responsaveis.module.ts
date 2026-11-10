import { Module } from '@nestjs/common';
import { ResponsaveisService } from './responsaveis.service';
import { ResponsaveisController } from './responsaveis.controller';

@Module({
  controllers: [ResponsaveisController],
  providers: [ResponsaveisService],
  exports: [ResponsaveisService],
})
export class ResponsaveisModule {}
