import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Equals, IsBoolean, IsDateString, IsEmail, IsIn, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

function transformSimNao(value: unknown): unknown {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return value;

  const normalized = value.trim().toUpperCase();
  if (normalized === 'SIM' || normalized === 'TRUE') return true;
  if (normalized === 'NAO' || normalized === 'NÃO' || normalized === 'FALSE') return false;
  return value;
}

export class CreateCatequistaDto {
  @ApiProperty()
  @IsString()
  nome: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  senha: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UpdateCatequistaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endereco?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}

export class CreateCatequistaInscricaoDto {
  @ApiPropertyOptional({ description: 'Relato pessoal sobre trajetória, experiência e motivação para servir' })
  @IsOptional()
  @IsString()
  sobreVoce?: string;

  @ApiProperty({ description: 'Confirmação do termo de compromisso da missão de catequista', example: true })
  @Transform(({ value }) => transformSimNao(value))
  @IsBoolean()
  @Equals(true, { message: 'É necessário aceitar o termo de compromisso para enviar a inscrição.' })
  aceiteTermoMissao: boolean;

  @ApiProperty({
    description: 'Nome completo do candidato a catequista',
    example: 'Maria de Souza',
  })
  @IsString()
  nome: string;

  @ApiProperty({
    description: 'Data de nascimento do candidato',
    example: '1990-05-12',
  })
  @IsDateString()
  dataNascimento: string;

  @ApiPropertyOptional({
    description: 'Data de batismo do candidato',
    example: '2001-08-20',
  })
  @IsOptional()
  @IsDateString()
  dataBatismo?: string;

  @ApiProperty({
    description: 'E-mail para contato',
    example: 'maria@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Celular para contato',
    example: '(11) 99999-9999',
  })
  @IsString()
  telefone: string;

  @ApiProperty({
    description: 'Se a pessoa e casada',
    example: 'SIM',
  })
  @Transform(({ value }) => transformSimNao(value))
  @IsBoolean()
  casado: boolean;

  @ApiPropertyOptional({
    description: 'Se a pessoa e casada na Igreja Catolica (informar quando casado = SIM)',
    example: 'SIM',
  })
  @Transform(({ value }) => transformSimNao(value))
  @IsOptional()
  @IsBoolean()
  casadaIgrejaCatolica?: boolean;

  @ApiPropertyOptional({
    description: 'Sacramentos recebidos pelo candidato',
    example: 'Batismo, Eucaristia e Crisma',
  })
  @IsOptional()
  @IsString()
  sacramentos?: string;

  @ApiPropertyOptional({
    description: 'Alergias ou observações de saúde',
    example: 'Alergia a poeira',
  })
  @IsOptional()
  @IsString()
  alergias?: string;

  @ApiPropertyOptional({
    description: 'Comprovante de residência em Base64 (data URL)',
    example: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
  })
  @IsOptional()
  @IsString()
  comprovanteResidenciaBase64?: string;

  @ApiPropertyOptional({
    description: 'Documento de CPF em Base64 (data URL)',
    example: 'data:application/pdf;base64,JVBERi0xLjQKJ...',
  })
  @IsOptional()
  @IsString()
  documentoCpfBase64?: string;

  @ApiPropertyOptional({ description: 'Comprovante de batismo em Base64 (data URL)' })
  @IsOptional()
  @IsString()
  comprovanteSacramentoBatismoBase64?: string;

  @ApiPropertyOptional({ description: 'Comprovante de eucaristia em Base64 (data URL)' })
  @IsOptional()
  @IsString()
  comprovanteSacramentoEucaristiaBase64?: string;

  @ApiPropertyOptional({ description: 'Comprovante de crisma em Base64 (data URL)' })
  @IsOptional()
  @IsString()
  comprovanteSacramentoCrismaBase64?: string;

  @ApiPropertyOptional({ description: 'Comprovante de matrimônio em Base64 (data URL)' })
  @IsOptional()
  @IsString()
  comprovanteSacramentoMatrimonioBase64?: string;
}

export class ApproveCatequistaInscricaoDto {
  @ApiPropertyOptional({
    description: 'Observações administrativas da aprovação',
    example: 'Documentação conferida e aprovada.',
  })
  @IsOptional()
  @IsString()
  observacoesAdmin?: string;

  @ApiPropertyOptional({
    description: 'ID da turma para alocar o catequista no momento da aprovação',
    example: 'clx123abc456turma',
  })
  @IsOptional()
  @IsString()
  turmaId?: string;

  @ApiPropertyOptional({
    description: 'Categoria do vínculo na turma: catequista ou auxiliar',
    example: 'auxiliar',
  })
  @IsOptional()
  @IsString()
  @IsIn(['catequista', 'auxiliar'])
  categoriaTurma?: 'catequista' | 'auxiliar';
}

export class RejectCatequistaInscricaoDto {
  @ApiPropertyOptional({
    description: 'Motivo ou observações administrativas da reprovação',
    example: 'Necessário reenviar comprovante de residência legível.',
  })
  @IsOptional()
  @IsString()
  observacoesAdmin?: string;
}
