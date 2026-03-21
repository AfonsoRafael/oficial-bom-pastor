import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @ApiProperty({ example: 'admin@catequese.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @Transform(({ value }) => String(value).trim())
  @ApiProperty({ example: 'João Silva' })
  @IsString({ message: 'Nome deve ser um texto' })
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  nome: string;

  @Transform(({ value }) => String(value).trim())
  @ApiProperty({ example: '123' })
  @IsString({ message: 'Senha deve ser um texto' })
  @MinLength(6, { message: 'Senha deve ter no mínimo 6 caracteres' })
  senha: string;

  @Transform(({ value }) => String(value).trim())
  @ApiProperty({ example: '123' })
  @IsString({ message: 'Confirmação de senha deve ser um texto' })
  @MinLength(6, { message: 'Confirmação de senha deve ter no mínimo 6 caracteres' })
  confirmSenha: string;

  @Transform(({ value }) => value ? String(value).trim() : undefined)
  @ApiPropertyOptional({ example: '11999999999' })
  @IsOptional()
  @IsString({ message: 'Telefone deve ser um texto' })
  telefone?: string;

  @Transform(({ value }) => value ? String(value).trim() : undefined)
  @ApiPropertyOptional({ example: 'Administrador' })
  @IsOptional()
  @IsString({ message: 'Função deve ser um texto' })
  role?: string;
}

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
  @ApiProperty()
  @IsString()
  token: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  novaSenha: string;
}
