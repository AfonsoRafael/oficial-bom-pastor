import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTurmaDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(3)
  ano: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sala?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  catequistaId?: string;

}

export class UpdateTurmaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  ano?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  horario?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sala?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  catequistaId?: string;
}

