import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const EVENTO_CATEGORIAS = [
  'ENCONTRO',
  'FERIADO',
  'EVENTO',
  'REUNIAO',
  'RETIRO',
  'CELEBRACAO',
  'OUTRO',
] as const;

export const RECORRENCIA_OPCOES = ['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL'] as const;

export type EventoCategoria = (typeof EVENTO_CATEGORIAS)[number];
export type RecorrenciaOpcao = (typeof RECORRENCIA_OPCOES)[number];

export class CreateEventoDto {
  @ApiProperty({ example: 'Encontro de Catequese - Nível I' })
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

  @ApiPropertyOptional({ example: '2026-05-10T11:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional()
  @IsString()
  horaFim?: string;

  @ApiPropertyOptional({ example: 'Salão Paroquial' })
  @IsOptional()
  @IsString()
  local?: string;

  @ApiPropertyOptional({ example: 'ENCONTRO', default: 'ENCONTRO' })
  @IsOptional()
  @IsEnum(EVENTO_CATEGORIAS)
  categoria?: EventoCategoria;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  cor?: string;

  @ApiPropertyOptional({ example: 'SEMANAL' })
  @IsOptional()
  @IsEnum(RECORRENCIA_OPCOES)
  recorrencia?: RecorrenciaOpcao;

  @ApiPropertyOptional({ example: 'GERAL', default: 'GERAL' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ example: 'clx123...' })
  @IsOptional()
  @IsString()
  turmaId?: string;
}

export class UpdateEventoDto {
  @ApiPropertyOptional({ example: 'Encontro de Catequese - Nível I' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  titulo?: string;

  @ApiPropertyOptional({ example: 'Tema: Parábola do Bom Pastor' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiPropertyOptional({ example: '2026-05-10T09:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  data?: string;

  @ApiPropertyOptional({ example: '2026-05-10T11:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  dataFim?: string;

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  horaInicio?: string;

  @ApiPropertyOptional({ example: '11:00' })
  @IsOptional()
  @IsString()
  horaFim?: string;

  @ApiPropertyOptional({ example: 'Salão Paroquial' })
  @IsOptional()
  @IsString()
  local?: string;

  @ApiPropertyOptional({ example: 'ENCONTRO' })
  @IsOptional()
  @IsEnum(EVENTO_CATEGORIAS)
  categoria?: EventoCategoria;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsHexColor()
  cor?: string;

  @ApiPropertyOptional({ example: 'SEMANAL' })
  @IsOptional()
  @IsEnum(RECORRENCIA_OPCOES)
  recorrencia?: RecorrenciaOpcao;

  @ApiPropertyOptional({ example: 'GERAL' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ example: 'clx123...' })
  @IsOptional()
  @IsString()
  turmaId?: string;
}