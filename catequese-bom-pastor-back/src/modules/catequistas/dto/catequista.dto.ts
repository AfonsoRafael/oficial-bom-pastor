import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  casado: string;

  @ApiPropertyOptional({
    description: 'Se a pessoa e casada na Igreja Catolica (informar quando casado = SIM)',
    example: 'SIM',
  })
  @IsOptional()
  @IsString()
  casadaIgrejaCatolica?: string;

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
}
