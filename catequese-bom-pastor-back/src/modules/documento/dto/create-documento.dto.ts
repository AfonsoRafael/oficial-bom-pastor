import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoDocumento {
  CERTIDAO_NASCIMENTO = 'CERTIDAO_NASCIMENTO',
  COMPROVANTE_ENDERECO = 'COMPROVANTE_ENDERECO',
  CERTIFICADO_BATISMO = 'CERTIFICADO_BATISMO',
}

export class CreateDocumentoDto {
  @ApiProperty({ maxLength: 255 })
  @Transform(({ obj, key }) => {
    const value = obj[key];
    return typeof value === 'string' ? value.trim() : value;
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nomeArquivo: string;

  @ApiProperty({ enum: TipoDocumento })
  @Transform(({ obj, key }) => obj[key])
  @IsEnum(TipoDocumento)
  tipoDocumento: TipoDocumento;
}
