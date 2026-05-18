import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClasseDto, UpdateClasseDto } from './dto/classe.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClasseDto) {
    // Validar unicidade: (sigla_classe, tipoEnsino)
    const exists = await this.prisma.classe.findFirst({
      where: {
        sigla_classe: dto.sigla_classe,
        tipoEnsino: dto.tipoEnsino,
      },
    });

    if (exists) {
      throw new ConflictException('Classe com essa sigla e tipo de ensino já existe.');
    }

    // Se curso_id foi fornecido, validar se existe
    if (dto.curso_id) {
      const cursoExists = await this.prisma.curso.findUnique({
        where: { id_curso: dto.curso_id },
      });
      if (!cursoExists) {
        throw new NotFoundException(`Curso #${dto.curso_id} não encontrado.`);
      }
    }

    const { disciplinasIds, ...classeData } = dto;

    // Criar classe - garantir que tipoEnsino é obrigatório
    const classe = await this.prisma.classe.create({
      data: {
        sigla_classe: classeData.sigla_classe,
        descricao_classe: classeData.descricao_classe,
        tipoEnsino: classeData.tipoEnsino || 'SECUNDARIO',
        ...(classeData.curso_id && { curso_id: classeData.curso_id }),
      },
      include: {
        curso: true,
        disciplinas: { include: { disciplina: true } },
      },
    });

    // Adicionar disciplinas se fornecidas
    if (disciplinasIds && disciplinasIds.length > 0) {
      for (let ordem = 0; ordem < disciplinasIds.length; ordem++) {
        await this.prisma.classeDisciplina.create({
          data: {
            classe_id: classe.id_classe,
            disciplina_id: disciplinasIds[ordem],
            ordem: ordem,
          },
        });
      }

      // Recarregar com disciplinas
      return this.prisma.classe.findUnique({
        where: { id_classe: classe.id_classe },
        include: {
          curso: true,
          disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        },
      });
    }

    return classe;
  }

  findAll() {
    return this.prisma.classe.findMany({
      orderBy: [{ tipoEnsino: 'asc' }, { sigla_classe: 'asc' }],
      include: {
        curso: true,
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        _count: { select: { turmas: true } },
      },
    });
  }

  async findOne(id: number) {
    const classe = await this.prisma.classe.findUnique({
      where: { id_classe: id },
      include: {
        curso: true,
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        turmas: true,
      },
    });
    if (!classe) throw new NotFoundException(`Classe #${id} não encontrada.`);
    return classe;
  }

  async update(id: number, dto: UpdateClasseDto) {
    await this.findOne(id);

    // Se curso_id foi fornecido, validar se existe
    if (dto.curso_id) {
      const cursoExists = await this.prisma.curso.findUnique({
        where: { id_curso: dto.curso_id },
      });
      if (!cursoExists) {
        throw new NotFoundException(`Curso #${dto.curso_id} não encontrado.`);
      }
    }

    const { disciplinasIds, ...classeData } = dto;

    // Atualizar dados da classe - apenas campos definidos
    const classe = await this.prisma.classe.update({
      where: { id_classe: id },
      data: {
        ...(classeData.sigla_classe && { sigla_classe: classeData.sigla_classe }),
        ...(classeData.descricao_classe && { descricao_classe: classeData.descricao_classe }),
        ...(classeData.tipoEnsino && { tipoEnsino: classeData.tipoEnsino }),
        ...(classeData.curso_id !== undefined && { curso_id: classeData.curso_id }),
      },
      include: {
        curso: true,
        disciplinas: { include: { disciplina: true } },
      },
    });

    // Atualizar disciplinas se fornecidas
    if (disciplinasIds !== undefined) {
      // Remover disciplinas antigas
      await this.prisma.classeDisciplina.deleteMany({
        where: { classe_id: id },
      });

      // Adicionar novas disciplinas
      if (disciplinasIds.length > 0) {
        for (let ordem = 0; ordem < disciplinasIds.length; ordem++) {
          await this.prisma.classeDisciplina.create({
            data: {
              classe_id: id,
              disciplina_id: disciplinasIds[ordem],
              ordem: ordem,
            },
          });
        }
      }

      // Recarregar com novas disciplinas
      return this.prisma.classe.findUnique({
        where: { id_classe: id },
        include: {
          curso: true,
          disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        },
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
                descricao_disc: true,
              },
            },
          },
          orderBy: { ordem: 'asc' },
        },
      },
    });

    if (!classe) throw new NotFoundException(`Classe #${classeId} não encontrada.`);

    // Retornar só as disciplinas (formato simplificado)
    return classe.disciplinas.map((cd) => ({
      ...cd.disciplina,
      ordem: cd.ordem,
    }));
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.classe.delete({ where: { id_classe: id } });
  }
}
