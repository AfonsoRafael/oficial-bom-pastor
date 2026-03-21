import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCatequistaDto, UpdateCatequistaDto } from './dto/catequista.dto';

@Injectable()
export class CatequistasService {
  constructor(private prisma: PrismaService) {}

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
}
