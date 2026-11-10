import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InscricoesService } from './inscricoes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('inscricoes')
@Controller('inscricoes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InscricoesController {
  constructor(private readonly inscricoesService: InscricoesService) {}

  @Get()
  findAll(
    @Query('turmaId') turmaId?: string,
    @Query('status') status?: string,
    @Query('responsavelId') responsavelId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.inscricoesService.findAll(turmaId, status, responsavelId, parseInt(limit) || 20, parseInt(offset) || 0);
  }

  @Post()
  create(@Body() data: any) {
    return this.inscricoesService.create(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscricoesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.inscricoesService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscricoesService.remove(id);
  }
}
