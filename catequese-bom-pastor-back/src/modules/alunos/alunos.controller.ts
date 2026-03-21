import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CatequizandosService } from './alunos.service';
import { CreateCatequizandoDto, UpdateCatequizandoDto } from './dto/aluno.dto';
import { UpdateCatequizandoDocumentoDto } from './dto/aluno-documento.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';

@ApiTags('catequizandos')
@Controller('catequizandos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CatequizandosController {
  constructor(private readonly catequizandosService: CatequizandosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar catequizandos' })
  @ApiQuery({ name: 'turmaId', required: false })
  @ApiQuery({ name: 'responsavelId', required: false })
  @ApiQuery({ name: 'semTurma', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('turmaId') turmaId?: string,
    @Query('responsavelId') responsavelId?: string,
    @Query('semTurma') semTurma?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @GetUser('id') userId?: string,
    @GetUser('role') role?: UserRole,
  ) {
    return this.catequizandosService.findAll(
      turmaId,
      responsavelId,
      userId,
      role,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
      semTurma === 'true',
    );
  }

  @Post()
  @ApiOperation({ summary: 'Criar catequizando' })
  create(@Body() dto: CreateCatequizandoDto, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    return this.catequizandosService.create(dto, userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar catequizando por ID' })
  findOne(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    return this.catequizandosService.findOne(id, userId, role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar catequizando' })
  update(@Param('id') id: string, @Body() dto: UpdateCatequizandoDto, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    return this.catequizandosService.update(id, dto, userId, role);
  }

  @Put(':id/turma')
  @ApiOperation({ summary: 'Atualizar turma do catequizando' })
  updateTurma(@Param('id') id: string, @Body('turmaId') turmaId: string, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    return this.catequizandosService.updateTurma(id, turmaId ?? null, userId, role);
  }

  @Put(':id/documentos')
  @ApiOperation({ summary: 'Atualizar documentos do catequizando' })
  updateDocumentos(
    @Param('id') id: string,
    @Body() dto: UpdateCatequizandoDocumentoDto,
    @GetUser('id') userId: string,
    @GetUser('role') role: UserRole,
  ) {
    return this.catequizandosService.upsertDocumento(id, dto, userId, role);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Deletar catequizando (ADMIN only)' })
  remove(@Param('id') id: string, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    return this.catequizandosService.remove(id, userId, role);
  }
}
