import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { USER_ROLES } from '../../common/constants/user-roles';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { DocumentoService, UsuarioAutenticado } from './documento.service';

@ApiTags('documentos')
@ApiBearerAuth()
@Controller('matriculas/:id/documentos')
export class DocumentoController {
  constructor(private readonly documentos: DocumentoService) {}

  @Post()
  @Roles(USER_ROLES.ADMINISTRADOR, USER_ROLES.COORDENADOR, USER_ROLES.SECRETARIA)
  @ApiOperation({ summary: 'Registrar metadados de documento' })
  criar(@Param('id') id: string, @Body() dto: CreateDocumentoDto) {
    return this.documentos.criar(id, dto);
  }

  @Get()
  @Roles(USER_ROLES.ADMINISTRADOR, USER_ROLES.COORDENADOR, USER_ROLES.SECRETARIA, USER_ROLES.RESPONSAVEL)
  @ApiOperation({ summary: 'Listar documentos da matrícula' })
  listar(@Param('id') id: string, @GetUser() usuario: UsuarioAutenticado) {
    return this.documentos.listar(id, usuario);
  }

  @Get(':documentoId')
  @Roles(USER_ROLES.ADMINISTRADOR, USER_ROLES.COORDENADOR, USER_ROLES.SECRETARIA, USER_ROLES.RESPONSAVEL)
  @ApiOperation({ summary: 'Consultar documento da matrícula' })
  buscar(@Param('id') id: string, @Param('documentoId') documentoId: string, @GetUser() usuario: UsuarioAutenticado) {
    return this.documentos.buscar(id, documentoId, usuario);
  }
}
