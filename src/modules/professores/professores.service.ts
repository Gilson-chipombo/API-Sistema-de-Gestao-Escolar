import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessorDto, UpdateProfessorDto } from './dto/professor.dto';

@Injectable()
export class ProfessoresService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfessorDto) {
    const exists = await this.prisma.professor.findUnique({
      where: { numero_bi_prof: dto.numero_bi_prof },
    });
    if (exists) throw new ConflictException('Número de BI já registado.');
    return this.prisma.professor.create({ data: dto });
  }

  async findAll(status?: string) {
    return this.prisma.professor.findMany({
      where: { ...(status && { status: status as any }) },
      orderBy: { nome_prof: 'asc' },
    });
  }

  async findOne(id: number) {
    const prof = await this.prisma.professor.findUnique({
      where: { id_prof: id },
      include: { turmas_dirigidas: true },
    });
    if (!prof) throw new NotFoundException(`Professor #${id} não encontrado.`);
    return prof;
  }

  async update(id: number, dto: UpdateProfessorDto) {
    await this.findOne(id);
    return this.prisma.professor.update({ where: { id_prof: id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.professor.update({
      where: { id_prof: id },
      data: { status: 'INATIVO' },
    });
  }
}
