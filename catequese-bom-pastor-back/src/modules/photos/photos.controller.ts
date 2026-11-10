import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { CreatePhotoDto, UpdatePhotoDto } from './dto/photo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../common/constants/user-roles';
import { Public } from '../auth/decorators/public.decorator';

type UploadedImageFile = {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
};

@ApiTags('photos')
@Controller('photos')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PhotosController {
  constructor(private readonly photosService: PhotosService) {}

  @Get('admin')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Listar todas as fotos cadastradas (admin)' })
  findAllAdmin() {
    return this.photosService.findAllAdmin();
  }

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Listar fotos ativas da home' })
  findPublic() {
    return this.photosService.findPublic();
  }

  @Post()
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Criar foto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'image'],
      properties: {
        title: { type: 'string', example: 'Missa de Abertura da Catequese 2026' },
        description: { type: 'string', example: 'Momento de bênção com as famílias.' },
        isActive: { type: 'string', example: 'true', description: 'true para exibir na home' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo de imagem (JPG, PNG, WEBP ou GIF)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  create(@Body() dto: CreatePhotoDto, @UploadedFile() image?: UploadedImageFile) {
    return this.photosService.create(dto, image);
  }

  @Put(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Atualizar foto' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Missa de Abertura da Catequese 2026' },
        description: { type: 'string', example: 'Momento de bênção com as famílias.' },
        isActive: { type: 'string', example: 'false', description: 'true para exibir na home' },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Novo arquivo de imagem opcional',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() dto: UpdatePhotoDto, @UploadedFile() image?: UploadedImageFile) {
    return this.photosService.update(id, dto, image);
  }

  @Patch(':id/toggle-status')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Alternar visibilidade da foto na home' })
  toggleStatus(@Param('id') id: string) {
    return this.photosService.toggleStatus(id);
  }

  @Delete(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  @ApiOperation({ summary: 'Remover foto' })
  remove(@Param('id') id: string) {
    return this.photosService.remove(id);
  }
}