import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePhotoDto {
  @ApiProperty({ description: 'Titulo da foto', example: 'Missa de Abertura da Catequese 2026' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Descricao da foto', example: 'Momento de bênção com as famílias.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Define se a foto aparece na home', example: 'true' })
  @IsOptional()
  @IsString()
  isActive?: string;
}

export class UpdatePhotoDto {
  @ApiPropertyOptional({ description: 'Titulo da foto', example: 'Missa de Abertura da Catequese 2026' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descricao da foto', example: 'Momento de bênção com as famílias.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Define se a foto aparece na home', example: 'true' })
  @IsOptional()
  @IsString()
  isActive?: string;
}