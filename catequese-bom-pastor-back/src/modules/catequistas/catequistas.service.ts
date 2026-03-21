import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCatequistaDto, CreateCatequistaInscricaoDto, UpdateCatequistaDto } from './dto/catequista.dto';
import { S3StorageService } from '../../common/storage/s3-storage.service';

@Injectable()
export class CatequistasService {
  constructor(
    private prisma: PrismaService,
    private s3StorageService: S3StorageService,
  ) {}

  async findAll() {
    const catequistas = await this.prisma.catequista.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { catequistas };
  }

  async findOne(id: string) {
    const catequista = await this.prisma.catequista.findUnique({ where: { id } });

    if (!catequista) {
      throw new NotFoundException('Catequista not found');
    }

    return catequista;
  }

  async create(dto: CreateCatequistaDto) {
    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    return this.prisma.catequista.create({
      data: {
        ...dto,
        senha: hashedPassword,
      },
    });
  }

  async createInscricao(dto: CreateCatequistaInscricaoDto) {
    const comprovanteResidenciaUrl = await this.resolveDocumentLocation(
      dto.comprovanteResidenciaBase64,
      'comprovante-residencia',
    );

    const documentoCpfUrl = await this.resolveDocumentLocation(
      dto.documentoCpfBase64,
      'documento-cpf',
    );

    const createdRows = await this.prisma.$queryRaw<any[]>(Prisma.sql`
      INSERT INTO "inscricoes_catequistas"
      (
        "id",
        "status",
        "nome",
        "dataNascimento",
        "dataBatismo",
        "email",
        "telefone",
        "casado",
        "casadaIgrejaCatolica",
        "sacramentos",
        "alergias",
        "ComprovanteResidencia",
        "DocumentoCpf",
        "createdAt",
        "updatedAt"
      )
      VALUES
      (
        ${randomUUID()},
        'PENDING'::"InscricaoCatequistaStatus",
        ${dto.nome},
        ${new Date(dto.dataNascimento)},
        ${dto.dataBatismo ? new Date(dto.dataBatismo) : null},
        ${dto.email},
        ${dto.telefone},
        ${dto.casado},
        ${dto.casadaIgrejaCatolica ?? null},
        ${dto.sacramentos ?? null},
        ${dto.alergias ?? null},
        ${comprovanteResidenciaUrl ?? null},
        ${documentoCpfUrl ?? null},
        NOW(),
        NOW()
      )
      RETURNING *
    `);

    return createdRows[0];
  }

  async findAllInscricoes(status?: string, limit: number = 20, offset: number = 0) {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);
    const statusFilter = status
      ? Prisma.sql`WHERE "status" = ${status}::"InscricaoCatequistaStatus"`
      : Prisma.empty;

    const [inscricoes, totalRows] = await Promise.all([
      this.prisma.$queryRaw<any[]>(Prisma.sql`
        SELECT *
        FROM "inscricoes_catequistas"
        ${statusFilter}
        ORDER BY "createdAt" DESC
        LIMIT ${safeLimit}
        OFFSET ${safeOffset}
      `),
      this.prisma.$queryRaw<Array<{ total: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS total
        FROM "inscricoes_catequistas"
        ${statusFilter}
      `),
    ]);

    return {
      total: Number(totalRows[0]?.total || 0),
      inscricoes,
    };
  }

  async update(id: string, dto: UpdateCatequistaDto) {
    const catequista = await this.prisma.catequista.findUnique({ where: { id } });

    if (!catequista) {
      throw new NotFoundException('Catequista not found');
    }

    return this.prisma.catequista.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const catequista = await this.prisma.catequista.findUnique({ where: { id } });

    if (!catequista) {
      throw new NotFoundException('Catequista not found');
    }

    await this.prisma.catequista.delete({ where: { id } });

    return { message: 'Catequista deleted successfully' };
  }

  private async resolveDocumentLocation(value: string | undefined, documentLabel: string) {
    if (!value) {
      return undefined;
    }

    const mimeType = this.extractMimeTypeFromDataUrl(value);
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Formato de documento invalido. Envie PDF ou imagem (JPG, PNG, WEBP).');
    }

    return this.s3StorageService.uploadBase64Document(value, 'inscricoes-catequistas', documentLabel);
  }

  private extractMimeTypeFromDataUrl(value: string): string {
    const dataUrlMatch = value.match(/^data:([^;]+);base64,/i);

    if (!dataUrlMatch) {
      throw new BadRequestException('Documento invalido. Envie arquivo em formato data URL base64.');
    }

    return String(dataUrlMatch[1] || '').toLowerCase().trim();
  }
}
