import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { USER_ROLES } from '../../common/constants/user-roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ItensLojaService } from './loja.service'; // Ajuste o caminho se necessário
import { CreateItemLojaDto } from './dto/loja.dto'; // Importando o DTO que criamos

@ApiTags('itens-loja')
@Controller('loja/itens')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ItensLojaController {
  constructor(private readonly itensLojaService: ItensLojaService) {}

  @Post()
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Criar um novo item na loja (ADMIN only)' })
  create(@Body() dto: CreateItemLojaDto) {
    return this.itensLojaService.create(dto);
  }

  @Get()
  @Public() 
  @ApiOperation({ summary: 'Listar todos os itens da loja' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.itensLojaService.findAll(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get(':id')
  @Public() 
  @ApiOperation({ summary: 'Buscar um item da loja pelo ID' })
  findOne(@Param('id') id: string) {
    return this.itensLojaService.findOne(id);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualizar um item da loja (ADMIN only)' })
  update(
    @Param('id') id: string, 
    @Body() dto: Partial<CreateItemLojaDto> 
  ) {
    return this.itensLojaService.update(id, dto);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Deletar um item da loja (ADMIN only)' })
  remove(@Param('id') id: string) {
    return this.itensLojaService.remove(id);
  }
}