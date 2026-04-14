import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCursoDto, UpdateCursoDto } from './dto/curso.dto';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCursoDto) {
    const exists = await this.prisma.curso.findUnique({ where: { sigla_curso: dto.sigla_curso } });
    if (exists) throw new ConflictException('Sigla de curso já existe.');
    return this.prisma.curso.create({ data: dto });
  }

  findAll() {
    return this.prisma.curso.findMany({
      orderBy: { sigla_curso: 'asc' },
      include: { _count: { select: { turmas: true } } },
    });
  }

  async findOne(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      include: { turmas: true },
    });
    if (!curso) throw new NotFoundException(`Curso #${id} não encontrado.`);
    return curso;
  }

  async update(id: number, dto: UpdateCursoDto) {
    await this.findOne(id);
    return this.prisma.curso.update({ where: { id_curso: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.curso.delete({ where: { id_curso: id } });
  }
}
