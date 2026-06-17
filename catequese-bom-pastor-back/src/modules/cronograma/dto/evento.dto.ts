import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEventoDto {
  @ApiProperty({ example: 'Encontro de Catequese' })
  @IsString()
  @MinLength(3)
  titulo: string;

  @ApiPropertyOptional({ example: 'Tema: Parábola do Bom Pastor' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: '2026-05-10T09:00:00.000Z' })
  @IsDateString()
  data: string;

  @ApiPropertyOptional({ example: 'GERAL', default: 'GERAL' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ example: 'clx123...' })
  @IsOptional()
  @IsString()
  turmaId?: string;
}
