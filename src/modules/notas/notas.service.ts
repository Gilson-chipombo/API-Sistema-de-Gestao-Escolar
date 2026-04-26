import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AvisosService } from '../avisos/avisos.service';
import { CreateNotaDto, UpdateNotaDto } from './dto/nota.dto';

@Injectable()
export class NotasService {
  constructor(
    private prisma: PrismaService,
    private avisosService: AvisosService,
  ) {}

  async create(dto: CreateNotaDto) {
    const nota = await this.prisma.nota.create({
      data: dto,
      include: { estudante: true, disciplina: true, turma: true },
    });

    // Criar aviso para ADMIN quando nota é lançada
    try {
      await this.criarAvisoNota(nota);
    } catch (erro) {
      console.error('[NOTAS-SERVICE] Erro ao criar aviso de nota:', erro);
      // Não interromper a criação da nota se o aviso falhar
    }

    return nota;
  }

  async findAll(estudanteId?: number, disciplinaId?: number, turmaId?: number, anoLetivo?: number) {
    const notas = await this.prisma.nota.findMany({
      where: {
        ...(estudanteId && { estudante_id: estudanteId }),
        ...(disciplinaId && { disciplina_id: disciplinaId }),
        ...(turmaId && { turma_id: turmaId }),
        ...(anoLetivo && { ano_letivo: anoLetivo }),
      },
      include: {
        estudante: { select: { nome_estudante: true, id_estudante: true } },
        disciplina: { select: { sigla_disc: true, descricao_disc: true, id_disc: true } },
        turma: { select: { sigla_turma: true, classe_turma: true, id_turma: true } },
      },
      orderBy: [{ estudante: { nome_estudante: 'asc' } }, { trimestre_nota: 'asc' }],
    });

    // Para cada nota, buscar o professor que leciona essa disciplina nessa turma
    const notasComProfessor = await Promise.all(
      notas.map(async (nota) => {
        const professor = await this.prisma.professor.findFirst({
          where: {
            disciplinas: { some: { disciplina_id: nota.disciplina_id } },
            turmas: { some: { turma_id: nota.turma_id } },
          },
          select: { id_prof: true, nome_prof: true },
        });

        return {
          ...nota,
          professor: professor ? { id_prof: professor.id_prof, nome_prof: professor.nome_prof } : null,
        };
      }),
    );

    return notasComProfessor;
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
      select: { nome_estudante: true, id_estudante: true, turma: { select: { sigla_turma: true } } },
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

  // ========== UPSERT NOTA ==========
  // Atualiza nota se já existe, ou cria nova nota
  async upsertNota(dto: CreateNotaDto) {
    // Procurar nota existente com mesma estudante, disciplina, trimestre e ano letivo
    const notaExistente = await this.prisma.nota.findFirst({
      where: {
        estudante_id: dto.estudante_id,
        disciplina_id: dto.disciplina_id,
        trimestre_nota: dto.trimestre_nota,
        ano_letivo: dto.ano_letivo,
      },
    });

    if (notaExistente) {
      // Atualizar nota existente (sem criar aviso)
      return this.prisma.nota.update({
        where: { id_nota: notaExistente.id_nota },
        data: {
          mac_notas: dto.mac_notas,
          pp_notas: dto.pp_notas,
          pt_notas: dto.pt_notas,
          data_nota: dto.data_nota,
          turma_id: dto.turma_id,
          updated_at: new Date(),
        },
        include: { estudante: true, disciplina: true, turma: true },
      });
    } else {
      // Criar nova nota
      const nota = await this.prisma.nota.create({
        data: dto,
        include: { estudante: true, disciplina: true, turma: true },
      });

      // Criar aviso para ADMIN quando nota é lançada
      try {
        await this.criarAvisoNota(nota);
      } catch (erro) {
        console.error('[NOTAS-SERVICE] Erro ao criar aviso de nota:', erro);
        // Não interromper a criação da nota se o aviso falhar
      }

      return nota;
    }
  }

  // ========== CRIAR AVISO DE NOTA ==========
  private async criarAvisoNota(nota: any) {
    const disciplina = nota.disciplina?.descricao_disc || nota.disciplina?.sigla_disc || 'Disciplina';
    const estudante = nota.estudante?.nome_estudante || 'Aluno';
    const turma = nota.turma?.sigla_turma || 'Turma';
    
    const titulo = `Nova Nota Lançada: ${disciplina}`;
    const conteudo = `Uma nova nota foi lançada para ${estudante} em ${disciplina} na turma ${turma}.\n\nNotas: MAC: ${nota.mac_notas || '-'}, PP: ${nota.pp_notas || '-'}, PT: ${nota.pt_notas || '-'}`;

    await this.avisosService.create({
      titulo,
      conteudo,
      destinatarios: 'TODOS',
      data_publicacao: new Date(),
      prioridade: 'ALTA',
      professor_id: undefined,
    } as any);
  }

  // ========== AVISOS DE NOTAS LANÇADAS ==========
  async avisosNotasLancadas() {
    return this.prisma.aviso.findMany({
      where: {
        titulo: { contains: 'Nova Nota Lançada' },
      },
      include: { professor: { select: { user_name: true } } },
      orderBy: { data_publicacao: 'desc' },
    });
  }
}
