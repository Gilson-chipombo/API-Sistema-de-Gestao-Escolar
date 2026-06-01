import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessorDto, UpdateProfessorDto, CreateProfessorWithUserDto } from './dto/professor.dto';
import * as bcrypto from 'bcryptjs';

@Injectable()
export class ProfessoresService {
  private readonly logger = new Logger(ProfessoresService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfessorDto) {
    this.logger.debug(`[SERVICE-CREATE] Iniciando criação de professor: ${dto.nome_prof}`);
    
    const exists = await this.prisma.professor.findUnique({
      where: { numero_bi_prof: dto.numero_bi_prof },
    });
    if (exists) throw new ConflictException('Número de BI já registado.');

    // Extrair disciplinas, turmas e turmasDisciplinas do DTO
    const { disciplinas, turmas, turmasDisciplinas, ...createData } = dto;
    
    // Validar se há turmasDisciplinas
    if (turmasDisciplinas && turmasDisciplinas.length > 0) {
      // Extrair turma e disciplina IDs únicos
      const turmaIds = [...new Set(turmasDisciplinas.map(td => td.turma_id))];
      const disciplinaIds = [...new Set(turmasDisciplinas.map(td => td.disciplina_id))];
      
      // Validar se já existe conflito
      await this.validateNoOverlapForTurmaDisciplina(null, turmasDisciplinas);
    } else if (disciplinas && disciplinas.length > 0 && turmas && turmas.length > 0) {
      // Fallback para estrutura antiga (compatibilidade)
      await this.validateNoOverlap(null, disciplinas, turmas);
    }
    
    const professor = await this.prisma.professor.create({ data: createData as any });

    // Processar turmasDisciplinas se fornecido
    if (turmasDisciplinas && turmasDisciplinas.length > 0) {
      this.logger.debug(`[SERVICE-CREATE] Criando ${turmasDisciplinas.length} associações turma-disciplina`);
      try {
        await this.prisma.professorTurmaDisciplina.createMany({
          data: turmasDisciplinas.map(td => ({
            professor_id: professor.id_prof,
            turma_id: td.turma_id,
            disciplina_id: td.disciplina_id,
          })),
          skipDuplicates: true,
        });
      } catch (error: any) {
        this.logger.warn(`[SERVICE-CREATE] Aviso ao associar turma-disciplina: ${error?.message}`);
      }
    } else {
      // Criar associações com disciplinas, se houver (compatibilidade)
      if (disciplinas && disciplinas.length > 0) {
        this.logger.debug(`[SERVICE-CREATE] Criando ${disciplinas.length} associações com disciplinas`);
        try {
          await this.prisma.professorDisciplina.createMany({
            data: disciplinas.map(disciplina_id => ({
              professor_id: professor.id_prof,
              disciplina_id,
            })),
            skipDuplicates: true,
          });
        } catch (error: any) {
          this.logger.warn(`[SERVICE-CREATE] Aviso ao associar disciplinas: ${error?.message}`);
        }
      }

      // Criar associações com turmas, se houver (compatibilidade)
      if (turmas && turmas.length > 0) {
        this.logger.debug(`[SERVICE-CREATE] Criando ${turmas.length} associações com turmas`);
        try {
          await this.prisma.professorTurma.createMany({
            data: turmas.map(turma_id => ({
              professor_id: professor.id_prof,
              turma_id,
            })),
            skipDuplicates: true,
          });
        } catch (error: any) {
          this.logger.warn(`[SERVICE-CREATE] Aviso ao associar turmas: ${error?.message}`);
        }
      }
    }

    return professor;
  }

  async createWithUser(dto: CreateProfessorWithUserDto) {
    this.logger.debug(`[SERVICE-CREATE-WITH-USER] Criando professor com usuário: ${dto.nome_prof}`);
    
    // Verificar se BI já existe
    const existsBi = await this.prisma.professor.findUnique({
      where: { numero_bi_prof: dto.numero_bi_prof },
    });
    if (existsBi) throw new ConflictException('Número de BI já registado.');

    // Verificar se email já existe
    const existsEmail = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existsEmail) throw new ConflictException('Email já registado.');

    // Validar se há turmasDisciplinas
    if (dto.turmasDisciplinas && dto.turmasDisciplinas.length > 0) {
      await this.validateNoOverlapForTurmaDisciplina(null, dto.turmasDisciplinas);
    } else if (dto.disciplinas && dto.disciplinas.length > 0 && dto.turmas && dto.turmas.length > 0) {
      // Fallback para estrutura antiga
      await this.validateNoOverlap(null, dto.disciplinas, dto.turmas);
    }

    try {
      // Hash da password
      const hashedPassword = await bcrypto.hash(dto.password, 10);

      // Criar usuário
      const usuario = await this.prisma.usuario.create({
        data: {
          user_name: dto.user_name || dto.nome_prof,
          email: dto.email,
          password: hashedPassword,
          perfil: 'PROFESSOR',
          status: 'ATIVO',
        },
      });

      this.logger.debug(`[SERVICE-CREATE-WITH-USER] Usuário criado - ID: ${usuario.id_usuario}`);

      // Criar professor associado ao usuário
      const professor = await this.prisma.professor.create({
        data: {
          nome_prof: dto.nome_prof,
          filiacao_prof: dto.filiacao_prof,
          data_nascimento_prof: dto.data_nascimento_prof,
          email_prof: dto.email_prof || dto.email,
          telefone_prof: dto.telefone_prof,
          numero_bi_prof: dto.numero_bi_prof,
          data_emissao_bi_prof: dto.data_emissao_bi_prof,
          nacionalidade_prof: dto.nacionalidade_prof,
          endereco_fisico_prof: dto.endereco_fisico_prof,
          naturalidade_prof: dto.naturalidade_prof,
          nivel_academico: dto.nivel_academico,
          area_formacao_prof: dto.area_formacao_prof,
          ano_conclusao_formacao: dto.ano_conclusao_formacao,
          data_admissao: dto.data_admissao,
          status: dto.status,
          usuario_id: usuario.id_usuario,
        },
        include: { usuario: true },
      });

      this.logger.log(`[SERVICE-CREATE-WITH-USER] Professor criado - ID: ${professor.id_prof}, Usuário: ${usuario.id_usuario}`);

      // Processar turmasDisciplinas se fornecido
      if (dto.turmasDisciplinas && dto.turmasDisciplinas.length > 0) {
        this.logger.debug(`[SERVICE-CREATE-WITH-USER] Criando ${dto.turmasDisciplinas.length} associações turma-disciplina`);
        try {
          await this.prisma.professorTurmaDisciplina.createMany({
            data: dto.turmasDisciplinas.map(td => ({
              professor_id: professor.id_prof,
              turma_id: td.turma_id,
              disciplina_id: td.disciplina_id,
            })),
            skipDuplicates: true,
          });
        } catch (error: any) {
          this.logger.warn(`[SERVICE-CREATE-WITH-USER] Aviso ao associar turma-disciplina: ${error?.message}`);
        }
      } else {
        // Criar associações com disciplinas, se houver (compatibilidade)
        if (dto.disciplinas && dto.disciplinas.length > 0) {
          this.logger.debug(`[SERVICE-CREATE-WITH-USER] Criando ${dto.disciplinas.length} associações com disciplinas`);
          try {
            await this.prisma.professorDisciplina.createMany({
              data: dto.disciplinas.map(disciplina_id => ({
                professor_id: professor.id_prof,
                disciplina_id,
              })),
              skipDuplicates: true,
            });
            this.logger.debug(`[SERVICE-CREATE-WITH-USER] Disciplinas associadas com sucesso`);
          } catch (error: any) {
            this.logger.warn(`[SERVICE-CREATE-WITH-USER] Aviso ao associar disciplinas: ${error?.message}`);
          }
        }

        // Criar associações com turmas, se houver (compatibilidade)
        if (dto.turmas && dto.turmas.length > 0) {
          this.logger.debug(`[SERVICE-CREATE-WITH-USER] Criando ${dto.turmas.length} associações com turmas`);
          try {
            await this.prisma.professorTurma.createMany({
              data: dto.turmas.map(turma_id => ({
                professor_id: professor.id_prof,
                turma_id,
              })),
              skipDuplicates: true,
            });
            this.logger.debug(`[SERVICE-CREATE-WITH-USER] Turmas associadas com sucesso`);
          } catch (error: any) {
            this.logger.warn(`[SERVICE-CREATE-WITH-USER] Aviso ao associar turmas: ${error?.message}`);
          }
        }
      }

      return professor;
    } catch (error: any) {
      this.logger.error(`[SERVICE-CREATE-WITH-USER] Erro: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  async findAll(status?: string) {
    this.logger.debug(`[SERVICE-FINDALL] Listando professores - Status: ${status || 'Todos'}`);
    return this.prisma.professor.findMany({
      where: { ...(status && { status: status as any }) },
      orderBy: { nome_prof: 'asc' },
      include: {
        usuario: true,
        turmas_dirigidas: true,
        disciplinas: { include: { disciplina: true } },
        turmas: { include: { turma: true } },
        turmasDisciplinas: { include: { turma: true, disciplina: true } },
      },
    });
  }

  async findOne(id: number) {
    this.logger.debug(`[SERVICE-FINDONE] Buscando professor ID: ${id}`);
    const prof = await this.prisma.professor.findUnique({
      where: { id_prof: id },
      include: {
        usuario: true,
        turmas_dirigidas: true,
        disciplinas: { include: { disciplina: true } },
        turmas: { include: { turma: true } },
        turmasDisciplinas: { include: { turma: true, disciplina: true } },
      },
    });
    if (!prof) throw new NotFoundException(`Professor #${id} não encontrado.`);

    // Filtrar turmas que não existem mais (limpeza automática)
    if (prof.turmas && prof.turmas.length > 0) {
      const turmasValidas = prof.turmas.filter(pt => pt.turma !== null);
      const turmasInvalidas = prof.turmas.filter(pt => pt.turma === null);
      
      if (turmasInvalidas.length > 0) {
        this.logger.warn(
          `[SERVICE-FINDONE] Professor ${prof.id_prof} tem ${turmasInvalidas.length} turma(s) deletada(s). Limpando...`,
        );
        
        // Deletar referências de turmas que não existem
        await Promise.all(
          turmasInvalidas.map(pt =>
            this.prisma.professorTurma.delete({
              where: { id: pt.id },
            }).catch(err => 
              this.logger.warn(`[SERVICE-FINDONE] Erro ao deletar referência de turma: ${err.message}`)
            ),
          ),
        );
      }

      prof.turmas = turmasValidas;
    }

    return prof;
  }

  async findByUsuario(usuarioId: number) {
    this.logger.debug(`[SERVICE-FINDBYUSER] Buscando professor para usuário ID: ${usuarioId}`);
    const prof = await this.prisma.professor.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        usuario: true,
        turmas_dirigidas: true,
        disciplinas: { include: { disciplina: true } },
        turmas: { include: { turma: true } },
        turmasDisciplinas: { include: { turma: true, disciplina: true } },
      },
    });
    if (!prof) throw new NotFoundException(`Professor para usuário #${usuarioId} não encontrado.`);

    // Filtrar turmas que não existem mais (limpeza automática)
    if (prof.turmas && prof.turmas.length > 0) {
      const turmasValidas = prof.turmas.filter(pt => pt.turma !== null);
      const turmasInvalidas = prof.turmas.filter(pt => pt.turma === null);
      
      if (turmasInvalidas.length > 0) {
        this.logger.warn(
          `[SERVICE-FINDBYUSER] Professor ${prof.id_prof} tem ${turmasInvalidas.length} turma(s) deletada(s). Limpando...`,
        );
        
        // Deletar referências de turmas que não existem
        await Promise.all(
          turmasInvalidas.map(pt =>
            this.prisma.professorTurma.delete({
              where: { id: pt.id },
            }).catch(err => 
              this.logger.warn(`[SERVICE-FINDBYUSER] Erro ao deletar referência de turma: ${err.message}`)
            ),
          ),
        );
      }

      prof.turmas = turmasValidas;
    }

    return prof;
  }

  async findByEmail(email: string) {
    this.logger.debug(`[SERVICE-FINDBYEMAIL] Buscando professor com email: ${email}`);
    const prof = await this.prisma.professor.findFirst({
      where: { email_prof: email },
      include: {
        usuario: true,
        turmas_dirigidas: true,
        disciplinas: { include: { disciplina: true } },
        turmas: { include: { turma: true } },
        turmasDisciplinas: { include: { turma: true, disciplina: true } },
      },
    });
    if (!prof) throw new NotFoundException(`Professor com email "${email}" não encontrado.`);

    // Filtrar turmas que não existem mais (limpeza automática)
    if (prof.turmas && prof.turmas.length > 0) {
      const turmasValidas = prof.turmas.filter(pt => pt.turma !== null);
      const turmasInvalidas = prof.turmas.filter(pt => pt.turma === null);
      
      if (turmasInvalidas.length > 0) {
        this.logger.warn(
          `[SERVICE-FINDBYEMAIL] Professor ${prof.id_prof} tem ${turmasInvalidas.length} turma(s) deletada(s). Limpando...`,
        );
        
        // Deletar referências de turmas que não existem
        await Promise.all(
          turmasInvalidas.map(pt =>
            this.prisma.professorTurma.delete({
              where: { id: pt.id },
            }).catch(err => 
              this.logger.warn(`[SERVICE-FINDBYEMAIL] Erro ao deletar referência de turma: ${err.message}`)
            ),
          ),
        );
      }

      prof.turmas = turmasValidas;
    }

    return prof;
  }

  async update(id: number, dto: UpdateProfessorDto) {
    this.logger.debug(`[SERVICE-UPDATE] Atualizando professor ID: ${id}`);
    const existingProf = await this.findOne(id);

    // Extrair disciplinas, turmas e turmasDisciplinas do DTO
    const { disciplinas, turmas, turmasDisciplinas, ...updateData } = dto;

    // Processar turmasDisciplinas se fornecido
    if (turmasDisciplinas !== undefined) {
      await this.updateTurmaDisciplinas(id, turmasDisciplinas);
    } else if (disciplinas !== undefined || turmas !== undefined) {
      // Fallback para estrutura antiga (compatibilidade)
      // Validar se há conflito nas novas atribuições
      let finalDisciplinas = disciplinas;
      let finalTurmas = turmas;

      if (finalDisciplinas === undefined) {
        finalDisciplinas = existingProf.disciplinas.map(d => d.disciplina_id);
      }
      if (finalTurmas === undefined) {
        finalTurmas = existingProf.turmas.map(t => t.turma_id);
      }

      if (finalDisciplinas.length > 0 && finalTurmas.length > 0) {
        await this.validateNoOverlap(id, finalDisciplinas, finalTurmas);
      }

      // Atualizar disciplinas se fornecidas
      if (disciplinas !== undefined) {
        await this.updateDisciplinas(id, disciplinas);
      }

      // Atualizar turmas se fornecidas
      if (turmas !== undefined) {
        await this.updateTurmas(id, turmas);
      }
    }

    const updated = await this.prisma.professor.update({
      where: { id_prof: id },
      data: updateData,
      include: { usuario: true, turmas_dirigidas: true },
    });

    this.logger.log(`[SERVICE-UPDATE] Professor ${id} atualizado com sucesso`);
    return updated;
  }

  private async updateDisciplinas(professorId: number, disciplinaIds: number[]) {
    this.logger.debug(`[SERVICE-UPDATE-DISCIPLINAS] Atualizando disciplinas para professor ${professorId}`);
    
    try {
      // Remover todas as associações existentes
      await this.prisma.professorDisciplina.deleteMany({
        where: { professor_id: professorId },
      });

      // Criar novas associações
      if (disciplinaIds.length > 0) {
        await this.prisma.professorDisciplina.createMany({
          data: disciplinaIds.map(disciplina_id => ({
            professor_id: professorId,
            disciplina_id,
          })),
        });
      }

      this.logger.debug(`[SERVICE-UPDATE-DISCIPLINAS] ${disciplinaIds.length} disciplinas associadas`);
    } catch (error: any) {
      this.logger.warn(`[SERVICE-UPDATE-DISCIPLINAS] Erro ao atualizar disciplinas: ${error?.message}`);
    }
  }

  private async updateTurmas(professorId: number, turmaIds: number[]) {
    this.logger.debug(`[SERVICE-UPDATE-TURMAS] Atualizando turmas para professor ${professorId}`);
    
    try {
      // Remover todas as associações existentes
      await this.prisma.professorTurma.deleteMany({
        where: { professor_id: professorId },
      });

      // Criar novas associações
      if (turmaIds.length > 0) {
        await this.prisma.professorTurma.createMany({
          data: turmaIds.map(turma_id => ({
            professor_id: professorId,
            turma_id,
          })),
        });
      }

      this.logger.debug(`[SERVICE-UPDATE-TURMAS] ${turmaIds.length} turmas associadas`);
    } catch (error: any) {
      this.logger.warn(`[SERVICE-UPDATE-TURMAS] Erro ao atualizar turmas: ${error?.message}`);
    }
  }

  private async updateTurmaDisciplinas(professorId: number, turmasDisciplinas: any[]) {
    this.logger.debug(`[SERVICE-UPDATE-TURMA-DISCIPLINAS] Atualizando turma-disciplinas para professor ${professorId}`);
    
    try {
      // Remover todas as associações turma-disciplina existentes
      await this.prisma.professorTurmaDisciplina.deleteMany({
        where: { professor_id: professorId },
      });

      // Criar novas associações
      if (turmasDisciplinas.length > 0) {
        await this.prisma.professorTurmaDisciplina.createMany({
          data: turmasDisciplinas.map(td => ({
            professor_id: professorId,
            turma_id: td.turma_id,
            disciplina_id: td.disciplina_id,
          })),
        });
      }

      this.logger.debug(`[SERVICE-UPDATE-TURMA-DISCIPLINAS] ${turmasDisciplinas.length} turma-disciplinas associadas`);
    } catch (error: any) {
      this.logger.warn(`[SERVICE-UPDATE-TURMA-DISCIPLINAS] Erro ao atualizar turma-disciplinas: ${error?.message}`);
    }
  }

  private async validateNoOverlapForTurmaDisciplina(professorId: number | null, turmasDisciplinas: any[]) {
    this.logger.debug(`[SERVICE-VALIDATE-OVERLAP-TD] Validando turma-disciplinas para professor ID: ${professorId}`);
    
    // Para cada turma-disciplina, verificar se outro professor já está ensinando a mesma disciplina naquela turma
    for (const td of turmasDisciplinas) {
      const conflict = await this.prisma.professorTurmaDisciplina.findFirst({
        where: {
          turma_id: td.turma_id,
          disciplina_id: td.disciplina_id,
          professor: {
            status: { not: 'INATIVO' },
            ...(professorId && { id_prof: { not: professorId } }),
          },
        },
        include: {
          professor: true,
          turma: true,
          disciplina: true,
        },
      });

      if (conflict) {
        const turmaName = conflict.turma ? (conflict.turma.sigla_turma || `ID ${conflict.turma.id_turma}`) : 'Turma';
        const discName = conflict.disciplina ? (conflict.disciplina.sigla_disc || conflict.disciplina.descricao_disc) : 'Disciplina';
        
        throw new ConflictException(
          `Conflito: O professor "${conflict.professor.nome_prof}" já leciona "${discName}" na turma "${turmaName}".`
        );
      }
    }
  }

  async remove(id: number) {
    this.logger.debug(`[SERVICE-REMOVE] Removendo (inativando) professor ID: ${id}`);
    await this.findOne(id);
    
    const removed = await this.prisma.professor.update({
      where: { id_prof: id },
      data: { status: 'INATIVO' },
      include: { usuario: true },
    });
    
    this.logger.log(`[SERVICE-REMOVE] Professor ${id} inativado com sucesso`);
    return removed;
  }

  private async validateNoOverlap(professorId: number | null, disciplinaIds: number[], turmaIds: number[]) {
    this.logger.debug(`[SERVICE-VALIDATE-OVERLAP] Validando disciplinas/turmas para professor ID: ${professorId}`);
    
    const conflict = await this.prisma.professor.findFirst({
      where: {
        status: { not: 'INATIVO' },
        ...(professorId && { id_prof: { not: professorId } }),
        disciplinas: {
          some: {
            disciplina_id: { in: disciplinaIds },
          },
        },
        turmas: {
          some: {
            turma_id: { in: turmaIds },
          },
        },
      },
      include: {
        disciplinas: {
          include: {
            disciplina: true,
          },
        },
        turmas: {
          include: {
            turma: true,
          },
        },
      },
    });

    if (conflict) {
      const conflictingDisc = conflict.disciplinas.find(d => disciplinaIds.includes(d.disciplina_id))?.disciplina;
      const conflictingTurma = conflict.turmas.find(t => turmaIds.includes(t.turma_id))?.turma;
      
      const discName = conflictingDisc ? (conflictingDisc.sigla_disc || conflictingDisc.descricao_disc) : 'Disciplina';
      const turmaName = conflictingTurma ? (conflictingTurma.sigla_turma || `ID ${conflictingTurma.id_turma}`) : 'Turma';
      
      throw new ConflictException(
        `Conflito de atribuição: O professor "${conflict.nome_prof}" já está associado à disciplina "${discName}" na turma "${turmaName}".`
      );
    }
  }
}
