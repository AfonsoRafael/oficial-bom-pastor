import { Module } from '@nestjs/common';
import { ItensLojaController } from './loja.controller';
import { ItensLojaService } from './loja.service';

@Module({
    controllers: [ItensLojaController],
    providers: [ItensLojaService],
})
export class ItensLojaModule {}
