import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePreMatriculaDto {
  @ApiProperty({
    description: 'Nome completo da criança',
    example: 'João da Silva',
  })
  @IsString()
  nomeCatequizando: string;

  @ApiPropertyOptional({
    description: 'Alergias, condições médicas ou observações de saúde da criança',
    example: 'Alergia a amendoim',
  })
  @IsOptional()
  @IsString()
  alergiasProblemasSaude?: string;

  @ApiProperty({
    description: 'Data de nascimento da criança',
    example: '2015-05-12',
  })
  @IsDateString()
  dataNascimento: string;

  @ApiPropertyOptional({
    description: 'Nome do pai (informe ao menos o pai ou a mãe)',
    example: 'José da Silva',
  })
  @IsOptional()
  @IsString()
  nomePai?: string;

  @ApiPropertyOptional({
    description: 'Nome da mãe (informe ao menos o pai ou a mãe)',
    example: 'Maria da Silva',
  })
  @IsOptional()
  @IsString()
  nomeMae?: string;

  @ApiPropertyOptional({
    description: 'Sacramentos do pai, separados por vírgula (BATISMO, EUCARISTIA, CRISMA, MATRIMONIO)',
    example: 'BATISMO,CRISMA',
  })
  @IsOptional()
  @IsString()
  sacramentosPai?: string;

  @ApiPropertyOptional({
    description: 'Sacramentos da mãe, separados por vírgula (BATISMO, EUCARISTIA, CRISMA, MATRIMONIO)',
    example: 'BATISMO,EUCARISTIA',
  })
  @IsOptional()
  @IsString()
  sacramentosMae?: string;

  @ApiProperty({
    description: 'E-mail para contato',
    example: 'familia@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Telefone para contato',
    example: '(11) 99999-9999',
  })
  @IsString()
  telefone: string;

  @ApiPropertyOptional({
    description: 'Certificado de batismo em Base64 (data URL)',
    example: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
  })
  @IsOptional()
  @IsString()
  certificadoBatismoBase64?: string;

  @ApiPropertyOptional({
    description: 'Comprovante de endereco em Base64 (data URL)',
    example: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
  })
  @IsOptional()
  @IsString()
  comprovanteEnderecoBase64?: string;

  @ApiPropertyOptional({
    description: 'Certidao de nascimento em Base64 (data URL)',
    example: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
  })
  @IsOptional()
  @IsString()
  certidaoDeNascimentoBase64?: string;
}

export class ApprovePreMatriculaDto {
  @ApiPropertyOptional({
    description: 'Observações administrativas da aprovação',
    example: 'Documentação conferida e aprovada.',
  })
  @IsOptional()
  @IsString()
  observacoesAdmin?: string;
}

export class RejectPreMatriculaDto {
  @ApiPropertyOptional({
    description: 'Motivo ou observações administrativas da reprovação',
    example: 'Necessário reenviar comprovante de endereço legível.',
  })
  @IsOptional()
  @IsString()
  observacoesAdmin?: string;
}
