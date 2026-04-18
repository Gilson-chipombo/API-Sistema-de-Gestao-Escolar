import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstudanteDto, CreateEstudanteWithUserDto, UpdateEstudanteDto } from './dto/estudante.dto';

@Injectable()
export class EstudantesService {
  private readonly logger = new Logger(EstudantesService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEstudanteDto) {
    this.logger.debug(`[SERVICE-CREATE] Registando estudante: ${dto.nome_estudante}`);
    
    const matriculaExists = await this.prisma.estudante.findUnique({
      where: { numero_bi_estudante: dto.numero_bi_estudante }
    });
    if (matriculaExists) throw new ConflictException('Número de BI já registado.');

    // Preparar dados, removendo undefined
    const data = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined)
    );

    return this.prisma.estudante.create({ 
      data: data as any,
      include: {
        turma: { include: { curso: true } }
      }
    });
  }

  async createWithUser(dto: CreateEstudanteWithUserDto) {
    this.logger.debug(`[SERVICE-CREATEWITHUSER] Registando estudante com usuário: ${dto.nome_estudante}`);
    
    // Verificar se email existe
    const emailExists = await this.prisma.usuario.findUnique({
      where: { email: dto.email }
    });
    if (emailExists) throw new ConflictException('Email já registado.');

    // Verificar BI
    const biExists = await this.prisma.estudante.findUnique({
      where: { numero_bi_estudante: dto.numero_bi_estudante }
    });
    if (biExists) throw new ConflictException('Número de BI já registado.');

    // Hash da senha
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Criar usuário
    const usuario = await this.prisma.usuario.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        user_name: dto.user_name || dto.nome_estudante,
        perfil: 'ESTUDANTE',
        status: 'ATIVO',
      }
    });

    this.logger.log(`[SERVICE-CREATEWITHUSER] Usuário criado: ${usuario.id_usuario}`);

    // Preparar dados do estudante, removendo campos de usuário e valores undefined
    const estudanteData = Object.fromEntries(
      Object.entries(dto)
        .filter(([key, value]) => 
          !['email', 'password', 'user_name'].includes(key) && value !== undefined
        )
    );

    // Criar estudante
    const estudante = await this.prisma.estudante.create({
      data: estudanteData as any,
      include: {
        turma: { include: { curso: true } }
      }
    });

    this.logger.log(`[SERVICE-CREATEWITHUSER] Estudante criado: ${estudante.id_estudante}`);
    return estudante;
  }

  async findAll(turmaId?: number, classe?: string, status?: string) {
    this.logger.debug(`[SERVICE-FINDALL] Listando estudantes - Turma: ${turmaId}, Classe: ${classe}, Status: ${status}`);
    return this.prisma.estudante.findMany({
      where: {
        ...(turmaId && { turma_id: turmaId }),
        ...(classe && { classe_estudante: classe }),
        ...(status && { status: status as any }),
      },
      include: { 
        turma: { 
          include: { curso: true }
        } 
      },
      orderBy: { nome_estudante: 'asc' },
    });
  }

  async findOne(id: number) {
    this.logger.debug(`[SERVICE-FINDONE] Buscando estudante ID: ${id}`);
    const est = await this.prisma.estudante.findUnique({
      where: { id_estudante: id },
      include: {
        turma: { include: { curso: true } },
        notas: { include: { disciplina: true } },
        faltas: { include: { disciplina: true } },
      },
    });
    if (!est) throw new NotFoundException(`Estudante #${id} não encontrado.`);
    return est;
  }

  async update(id: number, dto: UpdateEstudanteDto) {
    this.logger.debug(`[SERVICE-UPDATE] Atualizando estudante ID: ${id}`);
    await this.findOne(id);
    return this.prisma.estudante.update({ 
      where: { id_estudante: id }, 
      data: dto,
      include: {
        turma: { include: { curso: true } }
      }
    });
  }

  async remove(id: number) {
    this.logger.debug(`[SERVICE-REMOVE] Marcando estudante como inativo ID: ${id}`);
    await this.findOne(id);
    return this.prisma.estudante.update({
      where: { id_estudante: id },
      data: { status: 'INATIVO' },
      include: {
        turma: { include: { curso: true } }
      }
    });
  }
}
