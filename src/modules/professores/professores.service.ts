import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfessorDto, UpdateProfessorDto, CreateProfessorWithUserDto } from './dto/professor.dto';
import * as bcrypto from 'bcryptjs';

@Injectable()
export class ProfessoresService {
  private readonly logger = new Logger(ProfessoresService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProfessorDto) {
    this.logger.debug(`[SERVICE-CREATE] Iniciando criação de professor: ${dto.nome_prof}`);
    
    const exists = await this.prisma.professor.findUnique({
      where: { numero_bi_prof: dto.numero_bi_prof },
    });
    if (exists) throw new ConflictException('Número de BI já registado.');

    // Extrair disciplinas e turmas do DTO
    const { disciplinas, turmas, ...createData } = dto;
    
    const professor = await this.prisma.professor.create({ data: createData as any });

    // Criar associações com disciplinas, se houver
    if (disciplinas && disciplinas.length > 0) {
      this.logger.debug(`[SERVICE-CREATE] Criando ${disciplinas.length} associações com disciplinas`);
      try {
        await this.prisma.professorDisciplina.createMany({
          data: disciplinas.map(disciplina_id => ({
            professor_id: professor.id_prof,
            disciplina_id,
          })),
          skipDuplicates: true,
        });
      } catch (error: any) {
        this.logger.warn(`[SERVICE-CREATE] Aviso ao associar disciplinas: ${error?.message}`);
      }
    }

    // Criar associações com turmas, se houver
    if (turmas && turmas.length > 0) {
      this.logger.debug(`[SERVICE-CREATE] Criando ${turmas.length} associações com turmas`);
      try {
        await this.prisma.professorTurma.createMany({
          data: turmas.map(turma_id => ({
            professor_id: professor.id_prof,
            turma_id,
          })),
          skipDuplicates: true,
        });
      } catch (error: any) {
        this.logger.warn(`[SERVICE-CREATE] Aviso ao associar turmas: ${error?.message}`);
      }
    }

    return professor;
  }

  async createWithUser(dto: CreateProfessorWithUserDto) {
    this.logger.debug(`[SERVICE-CREATE-WITH-USER] Criando professor com usuário: ${dto.nome_prof}`);
    
    // Verificar se BI já existe
    const existsBi = await this.prisma.professor.findUnique({
      where: { numero_bi_prof: dto.numero_bi_prof },
    });
    if (existsBi) throw new ConflictException('Número de BI já registado.');

    // Verificar se email já existe
    const existsEmail = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (existsEmail) throw new ConflictException('Email já registado.');

    try {
      // Hash da password
      const hashedPassword = await bcrypto.hash(dto.password, 10);

      // Criar usuário
      const usuario = await this.prisma.usuario.create({
        data: {
          user_name: dto.user_name || dto.nome_prof,
          email: dto.email,
          password: hashedPassword,
          perfil: 'PROFESSOR',
          status: 'ATIVO',
        },
      });

      this.logger.debug(`[SERVICE-CREATE-WITH-USER] Usuário criado - ID: ${usuario.id_usuario}`);

      // Criar professor associado ao usuário
      const professor = await this.prisma.professor.create({
        data: {
          nome_prof: dto.nome_prof,
          filiacao_prof: dto.filiacao_prof,
          data_nascimento_prof: dto.data_nascimento_prof,
          email_prof: dto.email_prof || dto.email,
          telefone_prof: dto.telefone_prof,
          numero_bi_prof: dto.numero_bi_prof,
          data_emissao_bi_prof: dto.data_emissao_bi_prof,
          nacionalidade_prof: dto.nacionalidade_prof,
          endereco_fisico_prof: dto.endereco_fisico_prof,
          naturalidade_prof: dto.naturalidade_prof,
          nivel_academico: dto.nivel_academico,
          area_formacao_prof: dto.area_formacao_prof,
          ano_conclusao_formacao: dto.ano_conclusao_formacao,
          data_admissao: dto.data_admissao,
          status: dto.status,
          usuario_id: usuario.id_usuario,
        },
        include: { usuario: true },
      });

      this.logger.log(`[SERVICE-CREATE-WITH-USER] Professor criado - ID: ${professor.id_prof}, Usuário: ${usuario.id_usuario}`);

      // Criar associações com disciplinas, se houver
      if (dto.disciplinas && dto.disciplinas.length > 0) {
        this.logger.debug(`[SERVICE-CREATE-WITH-USER] Criando ${dto.disciplinas.length} associações com disciplinas`);
        try {
          await this.prisma.professorDisciplina.createMany({
            data: dto.disciplinas.map(disciplina_id => ({
              professor_id: professor.id_prof,
              disciplina_id,
            })),
            skipDuplicates: true,
          });
          this.logger.debug(`[SERVICE-CREATE-WITH-USER] Disciplinas associadas com sucesso`);
        } catch (error: any) {
          this.logger.warn(`[SERVICE-CREATE-WITH-USER] Aviso ao associar disciplinas: ${error?.message}`);
        }
      }

      // Criar associações com turmas, se houver
      if (dto.turmas && dto.turmas.length > 0) {
        this.logger.debug(`[SERVICE-CREATE-WITH-USER] Criando ${dto.turmas.length} associações com turmas`);
        try {
          await this.prisma.professorTurma.createMany({
            data: dto.turmas.map(turma_id => ({
              professor_id: professor.id_prof,
              turma_id,
            })),
            skipDuplicates: true,
          });
          this.logger.debug(`[SERVICE-CREATE-WITH-USER] Turmas associadas com sucesso`);
        } catch (error: any) {
          this.logger.warn(`[SERVICE-CREATE-WITH-USER] Aviso ao associar turmas: ${error?.message}`);
        }
      }

      return professor;
    } catch (error: any) {
      this.logger.error(`[SERVICE-CREATE-WITH-USER] Erro: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  async findAll(status?: string) {
    this.logger.debug(`[SERVICE-FINDALL] Listando professores - Status: ${status || 'Todos'}`);
    return this.prisma.professor.findMany({
      where: { ...(status && { status: status as any }) },
      orderBy: { nome_prof: 'asc' },
      include: {
        usuario: true,
        turmas_dirigidas: true,
        disciplinas: { include: { disciplina: true } },
        turmas: { include: { turma: true } },
      },
    });
  }

  async findOne(id: number) {
    this.logger.debug(`[SERVICE-FINDONE] Buscando professor ID: ${id}`);
    const prof = await this.prisma.professor.findUnique({
      where: { id_prof: id },
      include: {
        usuario: true,
        turmas_dirigidas: true,
        disciplinas: { include: { disciplina: true } },
        turmas: { include: { turma: true } },
      },
    });
    if (!prof) throw new NotFoundException(`Professor #${id} não encontrado.`);
    return prof;
  }

  async findByUsuario(usuarioId: number) {
    this.logger.debug(`[SERVICE-FINDBYUSER] Buscando professor para usuário ID: ${usuarioId}`);
    const prof = await this.prisma.professor.findUnique({
      where: { usuario_id: usuarioId },
      include: {
        usuario: true,
        turmas_dirigidas: true,
        disciplinas: { include: { disciplina: true } },
        turmas: { include: { turma: true } },
      },
    });
    if (!prof) throw new NotFoundException(`Professor para usuário #${usuarioId} não encontrado.`);
    return prof;
  }

  async update(id: number, dto: UpdateProfessorDto) {
    this.logger.debug(`[SERVICE-UPDATE] Atualizando professor ID: ${id}`);
    await this.findOne(id);

    // Extrair disciplinas e turmas do DTO
    const { disciplinas, turmas, ...updateData } = dto;

    const updated = await this.prisma.professor.update({
      where: { id_prof: id },
      data: updateData,
      include: { usuario: true, turmas_dirigidas: true },
    });

    // Atualizar disciplinas se fornecidas
    if (disciplinas !== undefined) {
      await this.updateDisciplinas(id, disciplinas);
    }

    // Atualizar turmas se fornecidas
    if (turmas !== undefined) {
      await this.updateTurmas(id, turmas);
    }

    this.logger.log(`[SERVICE-UPDATE] Professor ${id} atualizado com sucesso`);
    return updated;
  }

  private async updateDisciplinas(professorId: number, disciplinaIds: number[]) {
    this.logger.debug(`[SERVICE-UPDATE-DISCIPLINAS] Atualizando disciplinas para professor ${professorId}`);
    
    try {
      // Remover todas as associações existentes
      await this.prisma.professorDisciplina.deleteMany({
        where: { professor_id: professorId },
      });

      // Criar novas associações
      if (disciplinaIds.length > 0) {
        await this.prisma.professorDisciplina.createMany({
          data: disciplinaIds.map(disciplina_id => ({
            professor_id: professorId,
            disciplina_id,
          })),
        });
      }

      this.logger.debug(`[SERVICE-UPDATE-DISCIPLINAS] ${disciplinaIds.length} disciplinas associadas`);
    } catch (error: any) {
      this.logger.warn(`[SERVICE-UPDATE-DISCIPLINAS] Erro ao atualizar disciplinas: ${error?.message}`);
    }
  }

  private async updateTurmas(professorId: number, turmaIds: number[]) {
    this.logger.debug(`[SERVICE-UPDATE-TURMAS] Atualizando turmas para professor ${professorId}`);
    
    try {
      // Remover todas as associações existentes
      await this.prisma.professorTurma.deleteMany({
        where: { professor_id: professorId },
      });

      // Criar novas associações
      if (turmaIds.length > 0) {
        await this.prisma.professorTurma.createMany({
          data: turmaIds.map(turma_id => ({
            professor_id: professorId,
            turma_id,
          })),
        });
      }

      this.logger.debug(`[SERVICE-UPDATE-TURMAS] ${turmaIds.length} turmas associadas`);
    } catch (error: any) {
      this.logger.warn(`[SERVICE-UPDATE-TURMAS] Erro ao atualizar turmas: ${error?.message}`);
    }
  }

  async remove(id: number) {
    this.logger.debug(`[SERVICE-REMOVE] Removendo (inativando) professor ID: ${id}`);
    await this.findOne(id);
    
    const removed = await this.prisma.professor.update({
      where: { id_prof: id },
      data: { status: 'INATIVO' },
      include: { usuario: true },
    });
    
    this.logger.log(`[SERVICE-REMOVE] Professor ${id} inativado com sucesso`);
    return removed;
  }
}
