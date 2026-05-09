import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCursoDto, UpdateCursoDto } from './dto/curso.dto';

/**
 * @deprecated Use ClassesService instead. This service is maintained for backward compatibility only.
 * It simply delegates to the Classe model which now handles both secondary school (classes) and 
 * secondary school with courses (media education).
 */
@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCursoDto) {
    const exists = await this.prisma.classe.findFirst({ 
      where: { sigla_classe: dto.sigla_curso }
    });
    if (exists) throw new ConflictException('Sigla de classe já existe.');
    
    const { disciplinasIds, ...classeData } = dto;
    
    // Criar classe com os dados do DTO
    const classe = await this.prisma.classe.create({ 
      data: {
        sigla_classe: dto.sigla_curso,
        descricao_classe: dto.descricao_curso,
        duracao_semestres: dto.duracao_semestres,
        tipoEnsino: 'MEDIO' as any, // Padrão para compatibilidade
      },
      include: { disciplinas: { include: { disciplina: true } } }
    });
    
    // Adicionar disciplinas se fornecidas
    if (disciplinasIds && disciplinasIds.length > 0) {
      for (let ordem = 0; ordem < disciplinasIds.length; ordem++) {
        await this.prisma.classeDisciplina.create({
          data: {
            classe_id: classe.id_classe,
            disciplina_id: disciplinasIds[ordem],
            ordem: ordem
          }
        });
      }
      
      // Recarregar com disciplinas
      return this.prisma.classe.findUnique({
        where: { id_classe: classe.id_classe },
        include: { disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } } }
      });
    }
    
    return classe;
  }

  findAll() {
    return this.prisma.classe.findMany({
      where: { tipoEnsino: 'MEDIO' },
      orderBy: { sigla_classe: 'asc' },
      include: { 
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        _count: { select: { turmas: true } } 
      },
    });
  }

  async findOne(id: number) {
    const classe = await this.prisma.classe.findUnique({
      where: { id_classe: id },
      include: { 
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        turmas: true 
      },
    });
    if (!classe) throw new NotFoundException(`Classe #${id} não encontrada.`);
    return classe;
  }

  async update(id: number, dto: UpdateCursoDto) {
    await this.findOne(id);
    
    const { disciplinasIds, ...classeData } = dto;
    
    // Atualizar dados da classe
    const classe = await this.prisma.classe.update({ 
      where: { id_classe: id }, 
      data: {
        ...(dto.sigla_curso && { sigla_classe: dto.sigla_curso }),
        ...(dto.descricao_curso && { descricao_classe: dto.descricao_curso }),
        ...(dto.duracao_semestres !== undefined && { duracao_semestres: dto.duracao_semestres }),
      },
      include: { disciplinas: { include: { disciplina: true } } }
    });
    
    // Atualizar disciplinas se fornecidas
    if (disciplinasIds) {
      // Remover disciplinas antigas
      await this.prisma.classeDisciplina.deleteMany({
        where: { classe_id: id }
      });
      
      // Adicionar novas disciplinas
      if (disciplinasIds.length > 0) {
        for (let ordem = 0; ordem < disciplinasIds.length; ordem++) {
          await this.prisma.classeDisciplina.create({
            data: {
              classe_id: id,
              disciplina_id: disciplinasIds[ordem],
              ordem: ordem
            }
          });
        }
      }
      
      // Recarregar com novas disciplinas
      return this.prisma.classe.findUnique({
        where: { id_classe: id },
        include: { disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } } }
      });
    }
    
    return classe;
  }

  /**
   * Buscar todas as disciplinas de uma classe
   */
  async getDisciplinas(classeId: number) {
    const classe = await this.prisma.classe.findUnique({
      where: { id_classe: classeId },
      include: {
        disciplinas: {
          include: {
            disciplina: {
              select: {
                id_disc: true,
                sigla_disc: true,
                descricao_disc: true
              }
            }
          },
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!classe) throw new NotFoundException(`Classe #${classeId} não encontrada.`);

    // Retornar só as disciplinas (formato simplificado)
    return classe.disciplinas.map(cd => ({
      ...cd.disciplina,
      ordem: cd.ordem
    }));
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.classe.delete({ where: { id_classe: id } });
  }
}

