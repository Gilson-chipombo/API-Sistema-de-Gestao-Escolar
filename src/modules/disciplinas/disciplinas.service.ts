import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDisciplinaDto, UpdateDisciplinaDto } from './dto/disciplina.dto';

@Injectable()
export class DisciplinasService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDisciplinaDto) {
    const exists = await this.prisma.disciplina.findUnique({ where: { sigla_disc: dto.sigla_disc } });
    if (exists) throw new ConflictException('Sigla de disciplina já existe.');
    return this.prisma.disciplina.create({ data: dto });
  }

  findAll() {
    return this.prisma.disciplina.findMany({ orderBy: { sigla_disc: 'asc' } });
  }

  async findOne(id: number) {
    const disc = await this.prisma.disciplina.findUnique({ where: { id_disc: id } });
    if (!disc) throw new NotFoundException(`Disciplina #${id} não encontrada.`);
    return disc;
  }

  async update(id: number, dto: UpdateDisciplinaDto) {
    await this.findOne(id);
    return this.prisma.disciplina.update({ where: { id_disc: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.disciplina.delete({ where: { id_disc: id } });
  }
}
