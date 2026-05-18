import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCursoDto, UpdateCursoDto } from './dto/curso.dto';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCursoDto) {
    // Validar unicidade
    const exists = await this.prisma.curso.findFirst({
      where: { sigla_curso: dto.sigla_curso },
    });
    if (exists) {
      throw new ConflictException('Curso com essa sigla já existe.');
    }

    return this.prisma.curso.create({
      data: {
        sigla_curso: dto.sigla_curso,
        descricao_curso: dto.descricao_curso,
        duracao_semestres: dto.duracao_semestres,
        objetivo_curso: dto.objetivo_curso,
      },
      include: { classes: true },
    });
  }

  findAll() {
    return this.prisma.curso.findMany({
      orderBy: { sigla_curso: 'asc' },
      include: {
        classes: true,
        _count: { select: { classes: true } },
      },
    });
  }

  async findOne(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      include: {
        classes: {
          include: {
            disciplinas: { include: { disciplina: true } },
            turmas: true,
          },
        },
      },
    });
    if (!curso) {
      throw new NotFoundException(`Curso #${id} não encontrado.`);
    }
    return curso;
  }

  async update(id: number, dto: UpdateCursoDto) {
    await this.findOne(id);

    return this.prisma.curso.update({
      where: { id_curso: id },
      data: {
        ...(dto.sigla_curso && { sigla_curso: dto.sigla_curso }),
        ...(dto.descricao_curso && { descricao_curso: dto.descricao_curso }),
        ...(dto.duracao_semestres !== undefined && { duracao_semestres: dto.duracao_semestres }),
        ...(dto.objetivo_curso !== undefined && { objetivo_curso: dto.objetivo_curso }),
      },
      include: { classes: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.curso.delete({
      where: { id_curso: id },
    });
  }
}


