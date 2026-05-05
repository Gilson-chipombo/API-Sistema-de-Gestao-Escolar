import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards, Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EstudantesService } from './estudantes.service';
import { CreateEstudanteDto, CreateEstudanteWithUserDto, UpdateEstudanteDto } from './dto/estudante.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Estudantes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('estudantes')
export class EstudantesController {
  private readonly logger = new Logger(EstudantesController.name);

  constructor(private readonly service: EstudantesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Registar estudante com ou sem usuário' })
  async create(@Body() dto: CreateEstudanteDto | CreateEstudanteWithUserDto) {
    this.logger.log(`[CREATE] Registando estudante: ${dto.nome_estudante}`);
    try {
      // Se vier com password, é CreateEstudanteWithUserDto
      if ((dto as CreateEstudanteWithUserDto).password) {
        const result = await this.service.createWithUser(dto as CreateEstudanteWithUserDto);
        this.logger.log(`[CREATE] Estudante criado com usuário - ID: ${result.id_estudante}`);
        return result;
      } else {
        // Senão, é CreateEstudanteDto normal
        const result = await this.service.create(dto as CreateEstudanteDto);
        this.logger.log(`[CREATE] Estudante criado - ID: ${result.id_estudante}`);
        return result;
      }
    } catch (error: any) {
      this.logger.error(`[CREATE] Erro ao registar estudante: ${error?.message}`, error?.stack);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Listar estudantes' })
  @ApiQuery({ name: 'turmaId', required: false, type: Number })
  @ApiQuery({ name: 'classe', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @Query('turmaId') turmaId?: string,
    @Query('classe') classe?: string,
    @Query('status') status?: string,
  ) {
    this.logger.log(`[FINDALL] Listando estudantes - TurmaId: ${turmaId}, Classe: ${classe}, Status: ${status}`);
    return this.service.findAll(turmaId ? +turmaId : undefined, classe, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do estudante' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[FINDONE] Buscando estudante ID: ${id}`);
    return this.service.findOne(id);
  }

  @Get('usuario/:usuarioId')
  @ApiOperation({ summary: 'Obter estudante pelo ID do usuário' })
  async findByUsuario(@Param('usuarioId', ParseIntPipe) usuarioId: number) {
    this.logger.log(`[FINDBYUSUARIO] Buscando estudante para usuarioId: ${usuarioId}`);
    return this.service.findByUsuarioId(usuarioId);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar estudante' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEstudanteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desactivar estudante' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
