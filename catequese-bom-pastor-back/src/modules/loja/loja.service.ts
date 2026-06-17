import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateItemLojaDto } from './dto/loja.dto';

@Injectable()
export class ItensLojaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateItemLojaDto) {
    return this.prisma.lojaItem.create({
      data: {
        nome: dto.nome,
        descricao: dto.descricao ?? null,
        preco: dto.preco,
        estoque: dto.estoque,
        imagemUrl: dto.imagemUrl ?? null,
      },
    });
  }

  async findAll(limit: number = 20, offset: number = 0) {
    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const [itens, total] = await Promise.all([
      this.prisma.lojaItem.findMany({
        orderBy: { criadoEm: 'desc' }, 
        take: safeLimit,
        skip: safeOffset,
      }),
      this.prisma.lojaItem.count(),
    ]);

    return {
      total,
      itens,
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.lojaItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundException(`Item com ID "${id}" não foi encontrado.`);
    }

    return item;
  }

  async update(id: string, dto: Partial<CreateItemLojaDto>) {
    await this.findOne(id);

    return this.prisma.lojaItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.lojaItem.delete({
      where: { id },
    });
  }
}