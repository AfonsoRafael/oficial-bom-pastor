import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsUrl, MinLength, IsPositive } from 'class-validator';

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