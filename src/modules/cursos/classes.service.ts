import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClasseDto, UpdateClasseDto } from './dto/classe.dto';
import { calcularTipoEnsino } from '../../common/helpers/tipoEnsino.helper';
import { TipoEnsino } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calcula e valida tipoEnsino baseado na sigla_classe
   */
  private validarECalcularTipoEnsino(sigla_classe: string, tipoEnsino?: TipoEnsino): TipoEnsino {
    const calculado = calcularTipoEnsino(sigla_classe);
    
    // Se foi fornecido um tipoEnsino, validar se é consistente
    if (tipoEnsino && tipoEnsino !== calculado) {
      throw new BadRequestException(
        `tipoEnsino '${tipoEnsino}' é inconsistente com a classe '${sigla_classe}'. Esperado: '${calculado}'`
      );
    }

    return calculado;
  }

  async create(dto: CreateClasseDto) {
    const tipoEnsino = this.validarECalcularTipoEnsino(dto.sigla_classe, dto.tipoEnsino);

    // Validar unicidade: (sigla_classe, nomeCurso, tipoEnsino)
    const exists = await this.prisma.classe.findFirst({
      where: {
        sigla_classe: dto.sigla_classe,
        nomeCurso: dto.nomeCurso || null,
        tipoEnsino: tipoEnsino,
      },
    });

    if (exists) {
      throw new ConflictException('Classe com essa sigla, curso e tipo de ensino já existe.');
    }

    const { disciplinasIds, ...classeData } = dto;

    // Criar classe
    const classe = await this.prisma.classe.create({
      data: {
        ...classeData,
        tipoEnsino,
      },
      include: { disciplinas: { include: { disciplina: true } } },
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
          disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        },
      });
    }

    return classe;
  }

  findAll() {
    return this.prisma.classe.findMany({
      orderBy: [{ tipoEnsino: 'asc' }, { sigla_classe: 'asc' }, { nomeCurso: 'asc' }],
      include: {
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        _count: { select: { turmas: true } },
      },
    });
  }

  async findOne(id: number) {
    const classe = await this.prisma.classe.findUnique({
      where: { id_classe: id },
      include: {
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        turmas: true,
      },
    });
    if (!classe) throw new NotFoundException(`Classe #${id} não encontrada.`);
    return classe;
  }

  async update(id: number, dto: UpdateClasseDto) {
    const classeExistente = await this.findOne(id);

    // Se atualizando sigla_classe, revalidar tipoEnsino
    const sigla = dto.sigla_classe || classeExistente.sigla_classe;
    const tipoEnsino = this.validarECalcularTipoEnsino(sigla, dto.tipoEnsino);

    const { disciplinasIds, ...classeData } = dto;

    // Atualizar dados da classe
    const classe = await this.prisma.classe.update({
      where: { id_classe: id },
      data: {
        ...classeData,
        tipoEnsino,
      },
      include: { disciplinas: { include: { disciplina: true } } },
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
