import { IsString, IsNotEmpty, IsOptional, IsArray, IsIn, IsUUID } from 'class-validator';

const TIPOS_DESTINATARIO = ['ADMINISTRADOR', 'CATEQUISTA', 'RESPONSAVEL', 'TURMA'] as const;

export class SendMensagemDto {
  @IsArray()
  @IsNotEmpty({ each: true })
  @IsUUID('4', { each: true })
  destinatariosIds: string[];

  @IsString()
  @IsNotEmpty()
  @IsIn(TIPOS_DESTINATARIO)
  destinatarioTipo: string;

  @IsString()
  @IsNotEmpty()
  assunto: string;

  @IsString()
  @IsNotEmpty()
  conteudo: string;

  @IsOptional()
  @IsUUID('4')
  turmaId?: string;
}

export class ListMensagensQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}

export class MarkAsReadDto {
  @IsArray()
  @IsUUID('4', { each: true })
  ids: string[];
}