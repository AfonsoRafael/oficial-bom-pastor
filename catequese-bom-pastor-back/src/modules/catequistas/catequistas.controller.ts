import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatequistasService } from './catequistas.service';
import { CreateCatequistaDto, UpdateCatequistaDto } from './dto/catequista.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../common/constants/user-roles';

@ApiTags('catequistas')
@Controller('catequistas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CatequistasController {
  constructor(private readonly catequistasService: CatequistasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar catequistas' })
  findAll() {
    return this.catequistasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar catequista por ID' })
  findOne(@Param('id') id: string) {
    return this.catequistasService.findOne(id);
  }

  @Post()
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Criar catequista' })
  create(@Body() dto: CreateCatequistaDto) {
    return this.catequistasService.create(dto);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualizar catequista' })
  update(@Param('id') id: string, @Body() dto: UpdateCatequistaDto) {
    return this.catequistasService.update(id, dto);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Remover catequista' })
  remove(@Param('id') id: string) {
    return this.catequistasService.remove(id);
  }
}
