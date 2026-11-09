import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PreMatriculasService } from './pre-matriculas.service';
import { ApprovePreMatriculaDto, CreatePreMatriculaDto, RejectPreMatriculaDto } from './dto/pre-matricula.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { USER_ROLES } from '../../common/constants/user-roles';
import { Public } from '../auth/decorators/public.decorator';

type UploadedDocumentFile = {
  buffer: Buffer;
  mimetype?: string;
};

@ApiTags('pre-matriculas')
@Controller('pre-matriculas')
export class PreMatriculasController {
  constructor(private readonly preMatriculasService: PreMatriculasService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pre-matriculas' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.preMatriculasService.findAll(
      status,
      limit ? parseInt(limit) : 20,
      offset ? parseInt(offset) : 0,
    );
  }

  @Post()
  @Public()
  @ApiOperation({ summary: 'Criar pre-matricula' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['nomeCatequizando', 'dataNascimento', 'email', 'telefone', 'aceiteTermos', 'certificadoBatismo', 'comprovanteEndereco', 'certidaoDeNascimento'],
      properties: {
        aceiteTermos: { type: 'string', example: 'true' },
        nomeCatequizando: { type: 'string', example: 'Joao da Silva' },
        alergiasProblemasSaude: { type: 'string', example: 'Alergia a amendoim' },
        dataNascimento: { type: 'string', format: 'date', example: '2015-05-12' },
        nomePai: { type: 'string', example: 'Jose da Silva' },
        nomeMae: { type: 'string', example: 'Maria da Silva' },
        sacramentosPai: { type: 'string', example: 'BATISMO,CRISMA' },
        sacramentosMae: { type: 'string', example: 'BATISMO,EUCARISTIA' },
        email: { type: 'string', format: 'email', example: 'familia@email.com' },
        telefone: { type: 'string', example: '(11) 99999-9999' },
        certificadoBatismo: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo do certificado de batismo (PDF ou imagem)',
        },
        comprovanteEndereco: {
          type: 'string',
          format: 'binary',
          description: 'Comprovante de endereco (PDF ou imagem)',
        },
        certidaoDeNascimento: {
          type: 'string',
          format: 'binary',
          description: 'Certidao de nascimento (PDF ou imagem)',
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'certificadoBatismo', maxCount: 1 },
      { name: 'comprovanteEndereco', maxCount: 1 },
      { name: 'certidaoDeNascimento', maxCount: 1 },
    ], { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  create(
    @Body() dto: CreatePreMatriculaDto,
    @UploadedFiles()
    files: {
      certificadoBatismo?: UploadedDocumentFile[];
      comprovanteEndereco?: UploadedDocumentFile[];
      certidaoDeNascimento?: UploadedDocumentFile[];
    },
  ) {
    const payload: CreatePreMatriculaDto = {
      ...dto,
      certificadoBatismoBase64:
        this.fileToDataUrl(files?.certificadoBatismo?.[0]) ?? dto.certificadoBatismoBase64,
      comprovanteEnderecoBase64:
        this.fileToDataUrl(files?.comprovanteEndereco?.[0]) ?? dto.comprovanteEnderecoBase64,
      certidaoDeNascimentoBase64:
        this.fileToDataUrl(files?.certidaoDeNascimento?.[0]) ?? dto.certidaoDeNascimentoBase64,
    };

    return this.preMatriculasService.create(payload);
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

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar pre-matricula por ID' })
  findOne(@Param('id') id: string) {
    return this.preMatriculasService.findOne(id);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Aprovar pre-matricula (ADMIN only)' })
  approve(@Param('id') id: string, @Body() dto: ApprovePreMatriculaDto, @GetUser('id') adminId: string) {
    return this.preMatriculasService.approve(id, adminId, dto.observacoesAdmin);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reprovar pre-matricula (ADMIN only)' })
  reject(@Param('id') id: string, @Body() dto: RejectPreMatriculaDto, @GetUser('id') adminId: string) {
    return this.preMatriculasService.reject(id, adminId, dto.observacoesAdmin);
  }

  @Post(':id/password-setup-invite')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Reenviar convite para definir senha do responsável (ADMIN only)' })
  resendPasswordSetupInvite(@Param('id') id: string) {
    return this.preMatriculasService.resendPasswordSetupInvite(id);
  }
}
