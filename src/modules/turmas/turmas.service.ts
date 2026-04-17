import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTurmaDto, UpdateTurmaDto } from './dto/turma.dto';

@Injectable()
export class TurmasService {
  private readonly logger = new Logger(TurmasService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTurmaDto) {
    this.logger.debug(`[SERVICE-CREATE] Iniciando criação com dados: ${JSON.stringify(dto)}`);
    try {
      const result = await this.prisma.turma.create({ data: dto });
      this.logger.debug(`[SERVICE-CREATE] Turma criada - ID: ${result.id_turma}`);
      return result;
    } catch (error) {
      this.logger.error(`[SERVICE-CREATE] Erro na criação: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(anoLetivo?: number, classe?: string) {
    this.logger.debug(`[SERVICE-FINDALL] Buscando com filtros - Ano: ${anoLetivo}, Classe: ${classe}`);
    try {
      const result = await this.prisma.turma.findMany({
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
      this.logger.debug(`[SERVICE-FINDALL] ${result.length} turmas encontradas`);
      return result;
    } catch (error) {
      this.logger.error(`[SERVICE-FINDALL] Erro na busca: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: number) {
    this.logger.debug(`[SERVICE-FINDONE] Buscando turma ID: ${id}`);
    try {
      const turma = await this.prisma.turma.findUnique({
        where: { id_turma: id },
        include: {
          curso: true,
          diretor: true,
          estudantes: { orderBy: { nome_estudante: 'asc' } },
        },
      });
      if (!turma) {
        this.logger.warn(`[SERVICE-FINDONE] Turma ${id} não encontrada`);
        throw new NotFoundException(`Turma #${id} não encontrada.`);
      }
      this.logger.debug(`[SERVICE-FINDONE] Turma encontrada: ${turma.sigla_turma}`);
      return turma;
    } catch (error) {
      this.logger.error(`[SERVICE-FINDONE] Erro ao buscar ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, dto: UpdateTurmaDto) {
    this.logger.debug(`[SERVICE-UPDATE] Atualizando turma ${id} com dados: ${JSON.stringify(dto)}`);
    try {
      await this.findOne(id);
      const result = await this.prisma.turma.update({ where: { id_turma: id }, data: dto });
      this.logger.debug(`[SERVICE-UPDATE] Turma ${id} atualizada com sucesso`);
      return result;
    } catch (error) {
      this.logger.error(`[SERVICE-UPDATE] Erro ao atualizar ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async remove(id: number) {
    this.logger.debug(`[SERVICE-REMOVE] Deletando turma ${id}`);
    try {
      await this.findOne(id);
      const result = await this.prisma.turma.delete({ where: { id_turma: id } });
      this.logger.debug(`[SERVICE-REMOVE] Turma ${id} deletada com sucesso`);
      return result;
    } catch (error) {
      this.logger.error(`[SERVICE-REMOVE] Erro ao deletar ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
