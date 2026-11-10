import { Body, Controller, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { USER_ROLES } from '../../common/constants/user-roles';
import { RenovacoesService, RenewalFiles } from './renovacoes.service';

class CreateRenovacaoDto {
  @IsString()
  catequizandoId: string;

  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  ano: number;
}

class DecisaoDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  observacoes?: string;
}

@Controller('renovacoes')
export class RenovacoesController {
  constructor(private readonly service: RenovacoesService) {}

  @Get('me')
  @Roles(USER_ROLES.RESPONSAVEL)
  mine(@GetUser('id') userId: string) {
    return this.service.mine(userId);
  }

  @Get()
  @Roles(USER_ROLES.ADMINISTRADOR)
  list() {
    return this.service.list();
  }

  @Post()
  @Roles(USER_ROLES.RESPONSAVEL)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'comprovantePix', maxCount: 1 },
    { name: 'certificadoBatismo', maxCount: 1 },
    { name: 'comprovanteEndereco', maxCount: 1 },
    { name: 'certidaoNascimento', maxCount: 1 },
  ], { limits: { fileSize: 5 * 1024 * 1024, files: 4 } }))
  create(@GetUser('id') userId: string, @Body() dto: CreateRenovacaoDto, @UploadedFiles() files: RenewalFiles) {
    return this.service.create(userId, dto.catequizandoId, dto.ano, files);
  }

  @Patch(':id')
  @Roles(USER_ROLES.ADMINISTRADOR)
  decide(@Param('id') id: string, @Body() dto: DecisaoDto) {
    return this.service.decide(id, dto.status, dto.observacoes);
  }
}
