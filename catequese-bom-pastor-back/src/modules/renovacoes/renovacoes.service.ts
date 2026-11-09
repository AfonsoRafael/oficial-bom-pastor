import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3StorageService } from '../../common/storage/s3-storage.service';

type Upload = { buffer: Buffer; mimetype: string };
export type RenewalFiles = Partial<Record<'comprovantePix' | 'certificadoBatismo' | 'comprovanteEndereco' | 'certidaoNascimento', Upload[]>>;

const DOCUMENTS = [
  { field: 'certificadoBatismo', tipo: 'CERTIFICADO_BATISMO', legacy: 'CertificadoBatismo' },
  { field: 'comprovanteEndereco', tipo: 'COMPROVANTE_ENDERECO', legacy: 'ComprovanteEndereco' },
  { field: 'certidaoNascimento', tipo: 'CERTIDAO_NASCIMENTO', legacy: 'CertidaoDeNascimento' },
] as const;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

@Injectable()
export class RenovacoesService {
  private readonly logger = new Logger(RenovacoesService.name);

  constructor(private readonly prisma: PrismaService, private readonly storage: S3StorageService) {}

  private async children(userId: string) {
    const children = await this.prisma.catequizando.findMany({
      where: { responsavelId: userId },
      include: { documentos: true, turma: { select: { nome: true } } },
      orderBy: { nome: 'asc' },
    });
    const parent = await this.prisma.responsavel.findUnique({ where: { id: userId }, select: { email: true } });
    if (!parent) throw new NotFoundException('Responsável não encontrado.');
    const applications = await this.prisma.preMatricula.findMany({
      where: { email: parent.email, status: 'APPROVED' },
      orderBy: { criadoEm: 'desc' },
    });
    return children.map((child) => {
      const application = applications.find((item) =>
        item.nomeCatequizando === child.nome && item.dataNascimento.getTime() === child.dataNascimento.getTime(),
      );
      const missing = DOCUMENTS.filter(({ tipo, legacy }) =>
        !child.documentos.some((doc) => doc.tipo === tipo && doc.fileUrl) && !application?.[legacy],
      ).map(({ field }) => field);
      return { id: child.id, nome: child.nome, turma: child.turma?.nome ?? null, documentosFaltantes: missing };
    });
  }

  async mine(userId: string) {
    const [catequizandos, renovacoes] = await Promise.all([
      this.children(userId),
      this.prisma.renovacao.findMany({
        where: { responsavelId: userId },
        select: { id: true, catequizandoId: true, ano: true, status: true, observacoes: true, criadoEm: true },
        orderBy: { criadoEm: 'desc' },
      }),
    ]);
    return { catequizandos, renovacoes };
  }

  async list() {
    const records = await this.prisma.renovacao.findMany({
      include: { catequizando: { select: { nome: true, dataNascimento: true, documentos: true } }, responsavel: { select: { nome: true, email: true, telefone: true } } },
      orderBy: { criadoEm: 'desc' },
    });
    return Promise.all(records.map(async ({ comprovanteKey, catequizando, ...record }) => {
      const application = await this.prisma.preMatricula.findFirst({
        where: { status: 'APPROVED', email: record.responsavel.email, nomeCatequizando: catequizando.nome, dataNascimento: catequizando.dataNascimento },
        orderBy: { criadoEm: 'desc' },
      });
      const documentos = await Promise.all(DOCUMENTS.map(async ({ tipo, legacy }) => {
        const location = catequizando.documentos.find((doc) => doc.tipo === tipo && doc.fileUrl)?.fileUrl || application?.[legacy];
        return { tipo, url: location ? await this.storage.getStoredFileUrl(location) : null };
      }));
      return {
        ...record,
        catequizando: { nome: catequizando.nome },
        documentos,
        comprovanteUrl: await this.storage.getStoredFileUrl(comprovanteKey),
      };
    }));
  }

  async create(userId: string, childId: string, ano: number, files: RenewalFiles = {}) {
    const currentYear = new Date().getFullYear();
    if (ano < currentYear || ano > currentYear + 1) {
      throw new BadRequestException('Selecione o ano atual ou o próximo ano.');
    }
    const child = (await this.children(userId)).find((item) => item.id === childId);
    if (!child) throw new NotFoundException('Catequizando não encontrado.');
    const prior = await this.prisma.renovacao.findUnique({ where: { catequizandoId_ano: { catequizandoId: childId, ano } } });
    if (prior && prior.status !== 'REJECTED') throw new ConflictException('Já existe uma solicitação para este ano.');

    const requiredFields = ['comprovantePix', ...child.documentosFaltantes] as const;
    for (const field of requiredFields) {
      if (!files[field]?.[0]) throw new BadRequestException('Anexe o comprovante de Pix e todos os documentos pendentes.');
    }
    for (const field of ['comprovantePix', ...DOCUMENTS.map((doc) => doc.field)] as const) {
      const file = files[field]?.[0];
      if (!file) continue;
      if (!ALLOWED_TYPES.includes(file.mimetype) || !file.buffer.length || file.buffer.length > 5 * 1024 * 1024) {
        throw new BadRequestException('Envie arquivos PDF, JPG, PNG ou WEBP de até 5 MB.');
      }
    }

    const uploaded: string[] = [];
    try {
      const upload = async (field: keyof RenewalFiles) => {
        const file = files[field][0];
        const result = await this.storage.uploadBufferDocument(file.buffer, file.mimetype, 'renovacoes', field);
        uploaded.push(result.key);
        return result.key;
      };
      const comprovanteKey = await upload('comprovantePix');
      const docs: Array<{ tipo: string; key: string }> = [];
      for (const doc of DOCUMENTS) {
        if (files[doc.field]?.[0]) {
          docs.push({ tipo: doc.tipo, key: await upload(doc.field) });
        }
      }
      return await this.prisma.$transaction(async (tx) => {
        for (const doc of docs) {
          await tx.catequizandoDocumento.upsert({
            where: { catequizandoId_tipo: { catequizandoId: childId, tipo: doc.tipo } },
            create: { catequizandoId: childId, tipo: doc.tipo, fileUrl: doc.key, uploadDate: new Date() },
            update: { fileUrl: doc.key, status: false, uploadDate: new Date() },
          });
        }
        if (prior) {
          const updated = await tx.renovacao.updateMany({
            where: { id: prior.id, status: 'REJECTED' },
            data: { status: 'PENDING', comprovanteKey, observacoes: null },
          });
          if (!updated.count) throw new ConflictException('A solicitação já foi atualizada.');
          return tx.renovacao.findUnique({ where: { id: prior.id } });
        }
        return tx.renovacao.create({ data: { catequizandoId: childId, responsavelId: userId, ano, comprovanteKey } });
      });
    } catch (error) {
      for (const key of uploaded) {
        try { await this.storage.deleteObject(key); } catch (cleanupError) {
          this.logger.error(`Falha ao remover arquivo não utilizado: ${key}`, cleanupError);
        }
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Já existe uma solicitação para este ano.');
      }
      throw error;
    }
  }

  async decide(id: string, status: 'APPROVED' | 'REJECTED', observacoes?: string) {
    if (status === 'REJECTED' && !observacoes?.trim()) {
      throw new BadRequestException('Informe o motivo da recusa.');
    }
    const result = await this.prisma.renovacao.updateMany({
      where: { id, status: 'PENDING' },
      data: { status, observacoes: observacoes?.trim() || null },
    });
    if (!result.count) throw new ConflictException('Solicitação inexistente ou já analisada.');
    return { status };
  }
}
