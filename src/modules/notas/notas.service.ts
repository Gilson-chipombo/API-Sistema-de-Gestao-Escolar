import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNotaDto, UpdateNotaDto } from './dto/nota.dto';

@Injectable()
export class NotasService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateNotaDto) {
    return this.prisma.nota.create({
      data: dto,
      include: { estudante: true, disciplina: true, turma: true },
    });
  }

  findAll(estudanteId?: number, disciplinaId?: number, turmaId?: number, anoLetivo?: number) {
    return this.prisma.nota.findMany({
      where: {
        ...(estudanteId && { estudante_id: estudanteId }),
        ...(disciplinaId && { disciplina_id: disciplinaId }),
        ...(turmaId && { turma_id: turmaId }),
        ...(anoLetivo && { ano_letivo: anoLetivo }),
      },
      include: {
        estudante: { select: { nome_estudante: true, numero_matricula: true } },
        disciplina: { select: { sigla_disc: true, descricao_disc: true } },
        turma: { select: { sigla_turma: true, classe_turma: true } },
      },
      orderBy: [{ estudante: { nome_estudante: 'asc' } }, { trimestre_nota: 'asc' }],
    });
  }

  async findOne(id: number) {
    const nota = await this.prisma.nota.findUnique({
      where: { id_nota: id },
      include: { estudante: true, disciplina: true, turma: true },
    });
    if (!nota) throw new NotFoundException(`Nota #${id} não encontrada.`);
    return nota;
  }

  // Boletim completo de um estudante num ano lectivo
  async boletim(estudanteId: number, anoLetivo: number) {
    const estudante = await this.prisma.estudante.findUnique({
      where: { id_estudante: estudanteId },
      select: { nome_estudante: true, numero_matricula: true, classe_estudante: true, turma: { select: { sigla_turma: true } } },
    });
    if (!estudante) throw new NotFoundException(`Estudante #${estudanteId} não encontrado.`);

    const notas = await this.prisma.nota.findMany({
      where: { estudante_id: estudanteId, ano_letivo: anoLetivo },
      include: { disciplina: { select: { sigla_disc: true, descricao_disc: true } } },
      orderBy: [{ disciplina: { sigla_disc: 'asc' } }, { trimestre_nota: 'asc' }],
    });

    return { estudante, ano_letivo: anoLetivo, notas };
  }

  async update(id: number, dto: UpdateNotaDto) {
    await this.findOne(id);
    return this.prisma.nota.update({ where: { id_nota: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.nota.delete({ where: { id_nota: id } });
  }
}
