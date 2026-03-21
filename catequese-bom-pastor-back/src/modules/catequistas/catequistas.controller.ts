import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CatequistasService } from './catequistas.service';
import { CreateCatequistaDto, CreateCatequistaInscricaoDto, UpdateCatequistaDto } from './dto/catequista.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../common/constants/user-roles';
import { Public } from '../auth/decorators/public.decorator';

type UploadedDocumentFile = {
  buffer: Buffer;
  mimetype?: string;
};

@ApiTags('catequistas')
@Controller('catequistas')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CatequistasController {
  constructor(private readonly catequistasService: CatequistasService) {}

  @Post('inscricao')
  @Public()
  @ApiOperation({ summary: 'Criar inscrição pública de catequista' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nome', 'dataNascimento', 'email', 'telefone', 'casado'],
      properties: {
        nome: { type: 'string', example: 'Maria de Souza' },
        dataNascimento: { type: 'string', format: 'date', example: '1990-05-12' },
        dataBatismo: { type: 'string', format: 'date', example: '2001-08-20' },
        email: { type: 'string', format: 'email', example: 'maria@email.com' },
        telefone: { type: 'string', example: '(11) 99999-9999' },
        casado: { type: 'string', example: 'SIM' },
        casadaIgrejaCatolica: { type: 'string', example: 'SIM', description: 'Preencher apenas quando casado for SIM' },
        sacramentos: { type: 'string', example: 'Batismo, Eucaristia e Crisma' },
        alergias: { type: 'string', example: 'Alergia a poeira' },
        comprovanteResidencia: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo do comprovante de residencia (PDF ou imagem)',
        },
        documentoCpf: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de documento de CPF (PDF ou imagem)',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'comprovanteResidencia', maxCount: 1 },
      { name: 'documentoCpf', maxCount: 1 },
    ]),
  )
  createInscricao(
    @Body() dto: CreateCatequistaInscricaoDto,
    @UploadedFiles()
    files: {
      comprovanteResidencia?: UploadedDocumentFile[];
      documentoCpf?: UploadedDocumentFile[];
    },
  ) {
    const payload: CreateCatequistaInscricaoDto = {
      ...dto,
      comprovanteResidenciaBase64:
        this.fileToDataUrl(files?.comprovanteResidencia?.[0]) ?? dto.comprovanteResidenciaBase64,
      documentoCpfBase64:
        this.fileToDataUrl(files?.documentoCpf?.[0]) ?? dto.documentoCpfBase64,
    };

    return this.catequistasService.createInscricao(payload);
  }

  private fileToDataUrl(file?: UploadedDocumentFile): string | undefined {
    if (!file) {
      return undefined;
    }

    const mimeType = (file.mimetype || '').toLowerCase().trim();
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Formato de documento invalido. Envie PDF ou imagem (JPG, PNG, WEBP).');
    }

    return `data:${mimeType};base64,${file.buffer.toString('base64')}`;
  }

  @Get()
  @ApiOperation({ summary: 'Listar catequistas' })
  findAll() {
    return this.catequistasService.findAll();
  }

  @Get('inscricoes')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar inscrições de catequistas (ADMIN only)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAllInscricoes(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.catequistasService.findAllInscricoes(
      status,
      limit ? parseInt(limit, 10) : 20,
      offset ? parseInt(offset, 10) : 0,
    );
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
