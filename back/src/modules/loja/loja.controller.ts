import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { USER_ROLES } from '../../common/constants/user-roles';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReservaLojaDto } from './dto/loja.dto';
import { ItensLojaService } from './loja.service'; // Ajuste o caminho se necessário
import { CreateItemLojaDto } from './dto/loja.dto'; // Importando o DTO que criamos

@ApiTags('itens-loja')
@Controller('loja/itens')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ItensLojaController {
  constructor(private readonly itensLojaService: ItensLojaService) {}

  @Post('reservas')
  @UseInterceptors(FileInterceptor('comprovantePagamento'))
  @ApiOperation({ summary: 'Criar uma reserva na lojinha' })
  reservar(@Req() request: any, @Body() dto: CreateReservaLojaDto, @UploadedFile() comprovantePagamento?: { buffer: Buffer; mimetype?: string }) {
    if (!comprovantePagamento) {
      throw new BadRequestException('Anexe o comprovante do pagamento.');
    }

    return this.itensLojaService.reservar(dto, request.user, comprovantePagamento);
  }

  @Patch('reservas/:id/confirmar')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Confirmar compra da lojinha (ADMIN only)' })
  confirmarReserva(@Param('id') id: string, @Req() request: any) {
    return this.itensLojaService.confirmarReserva(id, request.user);
  }

  @Get('reservas')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar reservas da lojinha (ADMIN only)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  listarReservas(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.itensLojaService.listarReservas(
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
  }

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