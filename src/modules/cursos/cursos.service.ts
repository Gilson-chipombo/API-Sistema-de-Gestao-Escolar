import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCursoDto, UpdateCursoDto } from './dto/curso.dto';

@Injectable()
export class CursosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCursoDto) {
    const exists = await this.prisma.curso.findUnique({ where: { sigla_curso: dto.sigla_curso } });
    if (exists) throw new ConflictException('Sigla de curso já existe.');
    
    const { disciplinasIds, ...cursoData } = dto;
    
    // Criar curso
    const curso = await this.prisma.curso.create({ 
      data: cursoData,
      include: { disciplinas: { include: { disciplina: true } } }
    });
    
    // Adicionar disciplinas se fornecidas
    if (disciplinasIds && disciplinasIds.length > 0) {
      for (let ordem = 0; ordem < disciplinasIds.length; ordem++) {
        await this.prisma.cursoDisciplina.create({
          data: {
            curso_id: curso.id_curso,
            disciplina_id: disciplinasIds[ordem],
            ordem: ordem
          }
        });
      }
      
      // Recarregar com disciplinas
      return this.prisma.curso.findUnique({
        where: { id_curso: curso.id_curso },
        include: { disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } } }
      });
    }
    
    return curso;
  }

  findAll() {
    return this.prisma.curso.findMany({
      orderBy: { sigla_curso: 'asc' },
      include: { 
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        _count: { select: { turmas: true } } 
      },
    });
  }

  async findOne(id: number) {
    const curso = await this.prisma.curso.findUnique({
      where: { id_curso: id },
      include: { 
        disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } },
        turmas: true 
      },
    });
    if (!curso) throw new NotFoundException(`Curso #${id} não encontrado.`);
    return curso;
  }

  async update(id: number, dto: UpdateCursoDto) {
    await this.findOne(id);
    
    const { disciplinasIds, ...cursoData } = dto;
    
    // Atualizar dados do curso
    const curso = await this.prisma.curso.update({ 
      where: { id_curso: id }, 
      data: cursoData,
      include: { disciplinas: { include: { disciplina: true } } }
    });
    
    // Atualizar disciplinas se fornecidas
    if (disciplinasIds) {
      // Remover disciplinas antigas
      await this.prisma.cursoDisciplina.deleteMany({
        where: { curso_id: id }
      });
      
      // Adicionar novas disciplinas
      if (disciplinasIds.length > 0) {
        for (let ordem = 0; ordem < disciplinasIds.length; ordem++) {
          await this.prisma.cursoDisciplina.create({
            data: {
              curso_id: id,
              disciplina_id: disciplinasIds[ordem],
              ordem: ordem
            }
          });
        }
      }
      
      // Recarregar com novas disciplinas
      return this.prisma.curso.findUnique({
        where: { id_curso: id },
        include: { disciplinas: { include: { disciplina: true }, orderBy: { ordem: 'asc' } } }
      });
    }
    
    return curso;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.curso.delete({ where: { id_curso: id } });
  }
}
