import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProfessoresService } from './professores.service';
import { CreateProfessorDto, UpdateProfessorDto, CreateProfessorWithUserDto } from './dto/professor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Professores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('professores')
export class ProfessoresController {
  private readonly logger = new Logger(ProfessoresController.name);

  constructor(private readonly service: ProfessoresService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Registar professor com usuário' })
  async create(@Body() dto: CreateProfessorWithUserDto) {
    this.logger.log(`[CREATE] Registando professor com usuário: ${dto.nome_prof}`);
    try {
      // Se vier com password, é CreateProfessorWithUserDto
      if ((dto as CreateProfessorWithUserDto).password) {
        const result = await this.service.createWithUser(dto as CreateProfessorWithUserDto);
        this.logger.log(`[CREATE] Professor criado com usuário - ID: ${result.id_prof}`);
        return result;
      } else {
        // Senão, é CreateProfessorDto normal
        const result = await this.service.create(dto as CreateProfessorDto);
        this.logger.log(`[CREATE] Professor criado - ID: ${result.id_prof}`);
        return result;
      }
    } catch (error: any) {
      this.logger.error(`[CREATE] Erro ao registar professor: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar professores' })
  @ApiQuery({ name: 'status', required: false })
  async findAll(@Query('status') status?: string) {
    this.logger.log(`[FINDALL] Listando professores - Status: ${status || 'Todos'}`);
    try {
      const result = await this.service.findAll(status);
      this.logger.log(`[FINDALL] ${result.length} professores encontrados`);
      return result;
    } catch (error: any) {
      this.logger.error(`[FINDALL] Erro ao listar: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do professor' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[FINDONE] Buscando professor ID: ${id}`);
    try {
      const result = await this.service.findOne(id);
      this.logger.log(`[FINDONE] Professor encontrado: ${result.nome_prof}`);
      return result;
    } catch (error: any) {
      this.logger.error(`[FINDONE] Erro: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar professor' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfessorDto) {
    this.logger.log(`[UPDATE] Atualizando professor ${id}`);
    try {
      const result = await this.service.update(id, dto);
      this.logger.log(`[UPDATE] Professor ${id} atualizado com sucesso`);
      return result;
    } catch (error: any) {
      this.logger.error(`[UPDATE] Erro: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desactivar professor' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[DELETE] Desativando professor ${id}`);
    try {
      const result = await this.service.remove(id);
      this.logger.log(`[DELETE] Professor ${id} desativado`);
      return result;
    } catch (error: any) {
      this.logger.error(`[DELETE] Erro: ${error?.message}`, error?.stack);
      throw error;
    }
  }
}
