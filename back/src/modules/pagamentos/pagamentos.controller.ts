import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PagamentosService } from './pagamentos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('pagamentos')
@Controller('pagamentos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Get()
  findAll(
    @Query('turmaId') turmaId?: string,
    @Query('status') status?: string,
    @Query('responsavelId') responsavelId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.pagamentosService.findAll(turmaId, status, responsavelId, parseInt(limit) || 20, parseInt(offset) || 0);
  }

  @Get('relatorio/resumo')
  getRelatorio(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('turmaId') turmaId?: string,
  ) {
    return this.pagamentosService.getRelatorioResumo(
      dataInicio ? new Date(dataInicio) : undefined,
      dataFim ? new Date(dataFim) : undefined,
      turmaId,
    );
  }

  @Post()
  create(@Body() data: any) {
    return this.pagamentosService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagamentosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.pagamentosService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagamentosService.remove(id);
  }
}
