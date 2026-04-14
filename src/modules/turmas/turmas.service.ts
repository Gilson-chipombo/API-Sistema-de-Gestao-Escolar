import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTurmaDto, UpdateTurmaDto } from './dto/turma.dto';

@Injectable()
export class TurmasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTurmaDto) {
    return this.prisma.turma.create({ data: dto });
  }

  findAll(anoLetivo?: number, classe?: string) {
    return this.prisma.turma.findMany({
      where: {
        ...(anoLetivo && { ano_lectivo_turma: anoLetivo }),
        ...(classe && { classe_turma: classe }),
      },
      include: {
        curso: { select: { sigla_curso: true } },
        diretor: { select: { nome_prof: true } },
        _count: { select: { estudantes: true } },
      },
      orderBy: [{ classe_turma: 'asc' }, { sigla_turma: 'asc' }],
    });
  }

  async findOne(id: number) {
    const turma = await this.prisma.turma.findUnique({
      where: { id_turma: id },
      include: {
        curso: true,
        diretor: true,
        estudantes: { orderBy: { nome_estudante: 'asc' } },
      },
    });
    if (!turma) throw new NotFoundException(`Turma #${id} não encontrada.`);
    return turma;
  }

  async update(id: number, dto: UpdateTurmaDto) {
    await this.findOne(id);
    return this.prisma.turma.update({ where: { id_turma: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.turma.delete({ where: { id_turma: id } });
  }
}
