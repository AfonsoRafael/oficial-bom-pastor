import { IsEmail, IsString, MinLength, IsStrongPassword, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({ example: 'admin@catequese.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123' })
  @IsString()
  senha: string;
}

export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'joao@example.com' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de definição enviado por e-mail' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Senha com 12+ caracteres, maiúscula, minúscula, número e símbolo' })
  @IsString()
  @IsStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  novaSenha: string;
}

export class CompletePasswordSetupDto {
  @ApiProperty({ description: 'Token de definição enviado por e-mail' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Senha com 12+ caracteres, maiúscula, minúscula, número e símbolo' })
  @IsString()
  @IsStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  senha: string;

  @ApiProperty()
  @IsString()
  @MinLength(12)
  confirmacao: string;
}

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ example: 'Maria de Souza' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nome?: string;

  @ApiPropertyOptional({ example: '(11) 99999-9999' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  telefone?: string;

  @ApiPropertyOptional({ description: 'Remover a foto de perfil atual' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  removerFoto?: boolean;

  @ApiPropertyOptional({ description: 'Senha atual, obrigatória para alterar senha' })
  @IsOptional()
  @IsString()
  senhaAtual?: string;

  @ApiPropertyOptional({ description: 'Nova senha forte' })
  @IsOptional()
  @IsString()
  @IsStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
  novaSenha?: string;

  @ApiPropertyOptional({ description: 'Confirmação da nova senha' })
  @IsOptional()
  @IsString()
  confirmacaoNovaSenha?: string;
}
