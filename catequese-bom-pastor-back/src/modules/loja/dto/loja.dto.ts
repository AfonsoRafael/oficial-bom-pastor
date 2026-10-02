import { Transform, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  MinLength,
  IsPositive,
  ValidateNested,
} from 'class-validator';

export class CreateItemLojaDto {
  @ApiProperty({ example: 'Livro Práticas de Catequese' })
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiPropertyOptional({ example: 'Manual direcionado para evangelização infantil.' })
  @IsOptional()
  @IsString()
  descricao?: string;

  @ApiProperty({ example: 29.90, description: 'Preço do item' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  preco: number;

  @ApiProperty({ example: 50, description: 'Quantidade em estoque' })
  @IsInt()
  estoque: number;

  @ApiPropertyOptional({ example: 'https://exemplo.com/imagem.png' })
  @IsOptional()
  @IsString()
  @IsUrl()
  imagemUrl?: string;
}

export class ReservaLojaItemDto {
  @ApiProperty({ example: 'b0f7a1a6-2f2d-4b05-bd6f-9c2f7b9c4c91' })
  @IsString()
  itemId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantidade: number;
}

export class CreateReservaLojaDto {
  @ApiProperty({ type: [ReservaLojaItemDto] })
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ReservaLojaItemDto)
  itens: ReservaLojaItemDto[];
}