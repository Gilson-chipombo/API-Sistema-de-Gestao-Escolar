import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFaltaDto, UpdateFaltaDto } from './dto/falta.dto';

@Injectable()
export class FaltasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateFaltaDto) {
    return this.prisma.falta.create({
      data: dto,
      include: { estudante: true, disciplina: true },
    });
  }

  findAll(estudanteId?: number, disciplinaId?: number, turmaId?: number, tipo?: string) {
    return this.prisma.falta.findMany({
      where: {
        ...(estudanteId && { estudante_id: estudanteId }),
        ...(disciplinaId && { disciplina_id: disciplinaId }),
        ...(turmaId && { turma_id: turmaId }),
        ...(tipo && { tipo_falta: tipo as any }),
      },
      include: {
        estudante: { select: { nome_estudante: true, id_estudante: true } },
        disciplina: { select: { sigla_disc: true, descricao_disc: true } },
        turma: { select: { sigla_turma: true, classe_turma: true } },
      },
      orderBy: [{ data_falta: 'desc' }],
    });
  }

  async findOne(id: number) {
    const falta = await this.prisma.falta.findUnique({
      where: { id_falta: id },
      include: { estudante: true, disciplina: true, turma: true },
    });
    if (!falta) throw new NotFoundException(`Falta #${id} não encontrada.`);
    return falta;
  }

  // Resumo de faltas por estudante numa disciplina
  async resumoPorEstudante(estudanteId: number, turmaId: number) {
    const estudante = await this.prisma.estudante.findUnique({
      where: { id_estudante: estudanteId },
      select: { nome_estudante: true, id_estudante: true },
    });
    if (!estudante) throw new NotFoundException(`Estudante #${estudanteId} não encontrado.`);

    const faltas = await this.prisma.falta.groupBy({
      by: ['disciplina_id', 'tipo_falta'],
      where: { estudante_id: estudanteId, turma_id: turmaId },
      _count: { id_falta: true },
    });

    // Enriquecer com nome da disciplina
    const disciplinas = await this.prisma.disciplina.findMany({
      where: { id_disc: { in: faltas.map((f) => f.disciplina_id) } },
      select: { id_disc: true, sigla_disc: true, descricao_disc: true },
    });

    const resultado = faltas.map((f) => ({
      disciplina: disciplinas.find((d) => d.id_disc === f.disciplina_id),
      tipo: f.tipo_falta,
      total: f._count.id_falta,
    }));

    return { estudante, turma_id: turmaId, faltas: resultado };
  }

  async update(id: number, dto: UpdateFaltaDto) {
    await this.findOne(id);
    return this.prisma.falta.update({ where: { id_falta: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.falta.delete({ where: { id_falta: id } });
  }
}
