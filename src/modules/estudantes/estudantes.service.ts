import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstudanteDto, UpdateEstudanteDto } from './dto/estudante.dto';

@Injectable()
export class EstudantesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEstudanteDto) {
    const exists = await this.prisma.estudante.findUnique({
      where: { numero_bi_estudante: dto.numero_bi_estudante },
    });
    if (exists) throw new ConflictException('Número de BI já registado.');

    const matriculaExists = await this.prisma.estudante.findUnique({
      where: { numero_matricula: dto.numero_matricula },
    });
    if (matriculaExists) throw new ConflictException('Número de matrícula já existe.');

    return this.prisma.estudante.create({ data: dto });
  }

  async findAll(turmaId?: number, classe?: string, status?: string) {
    return this.prisma.estudante.findMany({
      where: {
        ...(turmaId && { turma_id: turmaId }),
        ...(classe && { classe_estudante: classe }),
        ...(status && { status: status as any }),
      },
      include: { turma: { select: { sigla_turma: true, classe_turma: true } } },
      orderBy: { nome_estudante: 'asc' },
    });
  }

  async findOne(id: number) {
    const est = await this.prisma.estudante.findUnique({
      where: { id_estudante: id },
      include: {
        turma: true,
        notas: { include: { disciplina: true } },
        faltas: { include: { disciplina: true } },
      },
    });
    if (!est) throw new NotFoundException(`Estudante #${id} não encontrado.`);
    return est;
  }

  async update(id: number, dto: UpdateEstudanteDto) {
    await this.findOne(id);
    return this.prisma.estudante.update({ where: { id_estudante: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.estudante.update({
      where: { id_estudante: id },
      data: { status: 'INATIVO' },
    });
  }
}
