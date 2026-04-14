import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAvisoDto, UpdateAvisoDto } from './dto/aviso.dto';

@Injectable()
export class AvisosService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateAvisoDto) {
    return this.prisma.aviso.create({
      data: dto,
      include: { professor: { select: { user_name: true } } },
    });
  }

  findAll(destinatarios?: string, prioridade?: string, apenasAtivos = false) {
    const hoje = new Date();
    return this.prisma.aviso.findMany({
      where: {
        ...(destinatarios && { destinatarios: destinatarios as any }),
        ...(prioridade && { prioridade: prioridade as any }),
        ...(apenasAtivos && {
          data_publicacao: { lte: hoje },
          OR: [{ data_expiracao: null }, { data_expiracao: { gte: hoje } }],
        }),
      },
      include: { professor: { select: { user_name: true } } },
      orderBy: [{ prioridade: 'desc' }, { data_publicacao: 'desc' }],
    });
  }

  async findOne(id: number) {
    const aviso = await this.prisma.aviso.findUnique({
      where: { id },
      include: { professor: { select: { user_name: true } } },
    });
    if (!aviso) throw new NotFoundException(`Aviso #${id} não encontrado.`);
    return aviso;
  }

  async update(id: number, dto: UpdateAvisoDto) {
    await this.findOne(id);
    return this.prisma.aviso.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.aviso.delete({ where: { id } });
  }
}
