import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { USER_ROLES, UserRole } from '../../common/constants/user-roles';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';

export interface UsuarioAutenticado {
  id: string;
  perfis: UserRole[];
}

const documentoSelect = {
  id: true,
  matriculaId: true,
  nomeArquivo: true,
  tipoDocumento: true,
  status: true,
  parecer: true,
  dataEnvio: true,
} satisfies Prisma.DocumentoSelect;

type DocumentoSelecionado = Prisma.DocumentoGetPayload<{ select: typeof documentoSelect }>;

@Injectable()
export class DocumentoService {
  constructor(private readonly prisma: PrismaService) {}

  async criar(matriculaId: string, dto: CreateDocumentoDto) {
    const id = this.parseId(matriculaId);
    return this.prisma.$transaction(async (tx) => {
      const matricula = await tx.matricula.findUnique({ where: { id }, select: { id: true } });
      if (!matricula) throw new NotFoundException('Matrícula não encontrada.');
      const documento = await tx.documento.create({
        data: { matriculaId: id, nomeArquivo: dto.nomeArquivo, tipoDocumento: dto.tipoDocumento, status: 'PENDENTE', parecer: null },
        select: documentoSelect,
      });
      return this.serializar(documento);
    });
  }

  async listar(matriculaId: string, usuario: UsuarioAutenticado) {
    const id = this.parseId(matriculaId);
    await this.validarAcesso(id, usuario);
    const documentos = await this.prisma.documento.findMany({
      where: { matriculaId: id },
      select: documentoSelect,
      orderBy: { id: 'asc' },
    });
    return documentos.map((documento) => this.serializar(documento));
  }

  async buscar(matriculaId: string, documentoId: string, usuario: UsuarioAutenticado) {
    const id = this.parseId(matriculaId);
    const idDocumento = this.parseId(documentoId);
    await this.validarAcesso(id, usuario);
    const documento = await this.prisma.documento.findFirst({
      where: { id: idDocumento, matriculaId: id },
      select: documentoSelect,
    });
    if (!documento) throw new NotFoundException('Documento não encontrado.');
    return this.serializar(documento);
  }

  private async validarAcesso(id: bigint, usuario: UsuarioAutenticado) {
    const equipe = [USER_ROLES.ADMINISTRADOR, USER_ROLES.COORDENADOR, USER_ROLES.SECRETARIA]
      .some((perfil) => usuario.perfis.includes(perfil));
    const where: Prisma.MatriculaWhereInput = equipe
      ? { id }
      : { id, status: 'APROVADA', responsavel: { usuarioId: this.parseId(usuario.id) } };
    const matricula = await this.prisma.matricula.findFirst({ where, select: { id: true } });
    if (!matricula) throw new NotFoundException('Matrícula não encontrada.');
  }

  private parseId(value: string) {
    if (!/^[1-9]\d{0,18}$/.test(value) || BigInt(value) > 9223372036854775807n) {
      throw new BadRequestException('Identificador inválido.');
    }
    return BigInt(value);
  }

  private serializar(documento: DocumentoSelecionado) {
    return { ...documento, id: documento.id.toString(), matriculaId: documento.matriculaId.toString() };
  }
}
