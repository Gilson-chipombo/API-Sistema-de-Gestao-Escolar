import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AvisosService } from '../avisos/avisos.service';
import { CreateAvisoDto } from '../avisos/dto/aviso.dto';
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
    console.log('[NOTAS-SERVICE] Atualizando nota #' + id);

    // Obter nota antiga (antes de atualizar)
    const notaAntiga = await this.prisma.nota.findUnique({
      where: { id_nota: id },
      include: { estudante: true, disciplina: true, turma: true },
    });

    if (!notaAntiga) throw new NotFoundException(`Nota #${id} não encontrada.`);

    console.log('[NOTAS-SERVICE] Nota antiga encontrada:', notaAntiga.id_nota);

    // Atualizar nota
    const notaNova = await this.prisma.nota.update({
      where: { id_nota: id },
      data: dto,
      include: { estudante: true, disciplina: true, turma: true },
    });

    console.log('[NOTAS-SERVICE] Nota atualizada:', notaNova.id_nota);

    // Criar aviso de atualização (comparando notas antigas e novas)
    try {
      console.log('[NOTAS-SERVICE] Iniciando criação de aviso de atualização...');
      await this.criarAvisoNotaAtualizada(notaAntiga, notaNova);
      console.log('[NOTAS-SERVICE] Aviso de atualização criado com sucesso!');
    } catch (erro) {
      console.error('[NOTAS-SERVICE] Erro ao criar aviso de atualização de nota:', erro);
      // Não interromper a atualização se o aviso falhar
    }

    return notaNova;
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
      include: { estudante: true, disciplina: true, turma: true },
    });

    if (notaExistente) {
      // Nota antiga (antes de atualizar)
      const notaAntiga = notaExistente;

      // Atualizar nota existente
      const notaNova = await this.prisma.nota.update({
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

      // Criar aviso de atualização (comparando notas antigas e novas)
      try {
        console.log('[NOTAS-SERVICE] Iniciando criação de aviso de atualização via UPSERT...');
        await this.criarAvisoNotaAtualizada(notaAntiga, notaNova);
        console.log('[NOTAS-SERVICE] Aviso de atualização criado com sucesso!');
      } catch (erro) {
        console.error('[NOTAS-SERVICE] Erro ao criar aviso de atualização de nota:', erro);
        // Não interromper a atualização se o aviso falhar
      }

      return notaNova;
    } else {
      // Criar nova nota
      const nota = await this.prisma.nota.create({
        data: dto,
        include: { estudante: true, disciplina: true, turma: true },
      });

      // Criar aviso para ADMIN quando nota é lançada
      try {
        console.log('[NOTAS-SERVICE] Iniciando criação de aviso de nova nota via UPSERT...');
        await this.criarAvisoNota(nota);
        console.log('[NOTAS-SERVICE] Aviso de nova nota criado com sucesso!');
      } catch (erro) {
        console.error('[NOTAS-SERVICE] Erro ao criar aviso de nota:', erro);
        // Não interromper a criação da nota se o aviso falhar
      }

      return nota;
    }
  }

  // ========== CRIAR AVISO DE NOTA ==========
  private async criarAvisoNota(nota: any) {
    try {
      const disciplina = nota.disciplina?.descricao_disc || nota.disciplina?.sigla_disc || 'Disciplina';
      const estudante = nota.estudante?.nome_estudante || 'Aluno';
      const turma = nota.turma?.sigla_turma || 'Turma';
      
      const titulo = `Nova Nota Lançada: ${disciplina}`;
      const conteudo = `Uma nova nota foi lançada para ${estudante} em ${disciplina} na turma ${turma}.\n\nNotas: MAC: ${nota.mac_notas || '-'}, PP: ${nota.pp_notas || '-'}, PT: ${nota.pt_notas || '-'}`;

      const avisoDto: CreateAvisoDto = {
        titulo,
        conteudo,
        destinatarios: 'ADMIN' as any,
        data_publicacao: new Date(),
        prioridade: 'ALTA' as any,
      };

      console.log('[NOTAS-SERVICE] Criando aviso de nova nota para ADMIN:', avisoDto);

      const result = await this.avisosService.create(avisoDto);
      console.log('[NOTAS-SERVICE] Aviso de nova nota criado com sucesso! ID:', result.id);
    } catch (erro) {
      console.error('[NOTAS-SERVICE] Erro detalhado ao criar aviso de nota:', {
        message: erro.message,
        stack: erro.stack,
        code: erro.code,
      });
    }
  }

  // ========== CRIAR AVISO DE NOTA ATUALIZADA ==========
  private async criarAvisoNotaAtualizada(notaAntiga: any, notaNova: any) {
    try {
      const disciplina = notaNova.disciplina?.descricao_disc || notaNova.disciplina?.sigla_disc || 'Disciplina';
      const estudante = notaNova.estudante?.nome_estudante || 'Aluno';
      const turma = notaNova.turma?.sigla_turma || 'Turma';

      // Formatar notas antigas e novas para comparação
      const notasAntigasTexto = `MAC: ${notaAntiga.mac_notas ?? '-'}, PP: ${notaAntiga.pp_notas ?? '-'}, PT: ${notaAntiga.pt_notas ?? '-'}`;
      const notasNovasTexto = `MAC: ${notaNova.mac_notas ?? '-'}, PP: ${notaNova.pp_notas ?? '-'}, PT: ${notaNova.pt_notas ?? '-'}`;

      // Calcular médias
      const calcularMedia = (mac, pp, pt) => {
        if (mac && pp && pt) {
          return ((parseFloat(mac) + parseFloat(pp) + parseFloat(pt)) / 3).toFixed(2);
        }
        return '-';
      };

      const mediaAntiga = calcularMedia(notaAntiga.mac_notas, notaAntiga.pp_notas, notaAntiga.pt_notas);
      const mediaNova = calcularMedia(notaNova.mac_notas, notaNova.pp_notas, notaNova.pt_notas);

      const titulo = `Nota Atualizada: ${disciplina}`;
      const conteudo = `A nota de ${estudante} em ${disciplina} na turma ${turma} foi ATUALIZADA.\n\n📊 Notas Anteriores:\n${notasAntigasTexto}\nMédia: ${mediaAntiga}\n\n📊 Notas Atualizadas:\n${notasNovasTexto}\nMédia: ${mediaNova}`;

      const avisoDto: CreateAvisoDto = {
        titulo,
        conteudo,
        destinatarios: 'ADMIN' as any,
        data_publicacao: new Date(),
        prioridade: 'ALTA' as any,
      };

      console.log('[NOTAS-SERVICE] Criando aviso de atualização para ADMIN:', avisoDto);

      const result = await this.avisosService.create(avisoDto);
      console.log('[NOTAS-SERVICE] Aviso de atualização criado com sucesso! ID:', result.id);
    } catch (erro) {
      console.error('[NOTAS-SERVICE] Erro detalhado ao criar aviso de atualização:', {
        message: erro.message,
        stack: erro.stack,
        code: erro.code,
      });
    }
  }

  // ========== AVISOS DE NOTAS LANÇADAS E ATUALIZADAS ==========
  async avisosNotasLancadas() {
    return this.prisma.aviso.findMany({
      where: {
        OR: [
          { titulo: { contains: 'Nova Nota Lançada' } },
          { titulo: { contains: 'Nota Atualizada' } },
        ],
      },
      include: { professor: { select: { user_name: true } } },
      orderBy: { data_publicacao: 'desc' },
    });
  }
}
