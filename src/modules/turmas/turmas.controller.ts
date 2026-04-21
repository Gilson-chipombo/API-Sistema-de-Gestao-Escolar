import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TurmasService } from './turmas.service';
import { CreateTurmaDto, UpdateTurmaDto } from './dto/turma.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Turmas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('turmas')
export class TurmasController {
  private readonly logger = new Logger(TurmasController.name);

  constructor(private readonly service: TurmasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Criar turma' })
  async create(@Body() dto: CreateTurmaDto) {
    this.logger.log(`[CREATE] Iniciando criação de turma: ${JSON.stringify(dto)}`);
    try {
      const result = await this.service.create(dto);
      this.logger.log(`[CREATE] Turma criada com sucesso - ID: ${result.id_turma}`);
      return result;
    } catch (error) {
      this.logger.error(`[CREATE] Erro ao criar turma: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar turmas' })
  @ApiQuery({ name: 'anoLetivo', required: false, type: Number })
  @ApiQuery({ name: 'classe', required: false })
  async findAll(@Query('anoLetivo') ano?: string, @Query('classe') classe?: string) {
    this.logger.log(`[FINDALL] Buscando turmas - Ano: ${ano}, Classe: ${classe}`);
    try {
      const result = await this.service.findAll(ano ? +ano : undefined, classe);
      this.logger.log(`[FINDALL] ${result.length} turmas encontradas`);
      return result;
    } catch (error) {
      this.logger.error(`[FINDALL] Erro ao listar turmas: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('professor/:professorId')
  @ApiOperation({ summary: 'Turmas de um professor (como diretor ou lente)' })
  async findByProfessor(@Param('professorId', ParseIntPipe) professorId: number) {
    this.logger.log(`[FINDBYPROF] Buscando turmas do professor ${professorId}`);
    try {
      const result = await this.service.findByProfessor(professorId);
      this.logger.log(`[FINDBYPROF] ${result.length} turmas encontradas`);
      return result;
    } catch (error) {
      this.logger.error(`[FINDBYPROF] Erro ao buscar turmas: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id/disciplinas-count')
  @ApiOperation({ summary: 'Contar disciplinas de uma turma' })
  async countDisciplinas(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[COUNT-DISC] Contando disciplinas da turma ${id}`);
    try {
      const result = await this.service.countDisciplinas(id);
      this.logger.log(`[COUNT-DISC] Turma ${id} tem ${result} disciplinas`);
      return { turma_id: id, total_disciplinas: result };
    } catch (error) {
      this.logger.error(`[COUNT-DISC] Erro ao contar disciplinas: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da turma (com estudantes)' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[FINDONE] Buscando turma com ID: ${id}`);
    try {
      const result = await this.service.findOne(id);
      this.logger.log(`[FINDONE] Turma encontrada: ${result.sigla_turma}`);
      return result;
    } catch (error) {
      this.logger.error(`[FINDONE] Erro ao buscar turma ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTurmaDto) {
    this.logger.log(`[UPDATE] Atualizando turma ${id}: ${JSON.stringify(dto)}`);
    try {
      const result = await this.service.update(id, dto);
      this.logger.log(`[UPDATE] Turma ${id} atualizada com sucesso`);
      return result;
    } catch (error) {
      this.logger.error(`[UPDATE] Erro ao atualizar turma ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[DELETE] Deletando turma ${id}`);
    try {
      const result = await this.service.remove(id);
      this.logger.log(`[DELETE] Turma ${id} deletada com sucesso`);
      return result;
    } catch (error) {
      this.logger.error(`[DELETE] Erro ao deletar turma ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
