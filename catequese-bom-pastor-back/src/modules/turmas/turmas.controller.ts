import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TurmasService } from './turmas.service';
import { CreateTurmaDto, UpdateTurmaDto } from './dto/turma.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';

@ApiTags('turmas')
@Controller('turmas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TurmasController {
  constructor(private readonly turmasService: TurmasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar turmas' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.turmasService.findAll(
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Post()
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Criar turma' })
  create(@Body() dto: CreateTurmaDto, @GetUser('id') userId: string, @GetUser('role') role: UserRole) {
    return this.turmasService.create(dto, userId, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar turma por ID' })
  findOne(@Param('id') id: string) {
    return this.turmasService.findOne(id);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualizar turma' })
  update(@Param('id') id: string, @Body() dto: UpdateTurmaDto, @GetUser('role') role: UserRole) {
    return this.turmasService.update(id, dto, role);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Deletar turma (ADMIN only)' })
  remove(@Param('id') id: string, @GetUser('role') role: UserRole) {
    return this.turmasService.remove(id, role);
  }

  @Get(':id/catequizandos')
  @ApiOperation({ summary: 'Listar catequizandos da turma' })
  getCatequizandos(@Param('id') id: string) {
    return this.turmasService.getCatequizandos(id);
  }
}
