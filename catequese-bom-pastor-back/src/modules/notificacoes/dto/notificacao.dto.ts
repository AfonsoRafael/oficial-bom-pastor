import { IsString, IsOptional, IsArray, IsUUID } from 'class-validator';

export class ListNotificacoesQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  apenasNaoLidas?: string;
}

export class MarkNotificacaoReadDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}