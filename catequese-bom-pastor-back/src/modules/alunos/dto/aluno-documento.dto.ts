import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export enum TipoDocumentoCatequizando {
  CERTIDAO_NASCIMENTO = 'CERTIDAO_NASCIMENTO',
  CPF = 'CPF',
  CARTEIRA_VACINA = 'CARTEIRA_VACINA',
}

export class UpdateCatequizandoDocumentoDto {
  @ApiProperty({ enum: TipoDocumentoCatequizando })
  @IsEnum(TipoDocumentoCatequizando)
  tipo: TipoDocumentoCatequizando;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  status?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  uploadDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;
}
