import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AvisosService } from './avisos.service';
import { CreateAvisoDto, UpdateAvisoDto } from './dto/aviso.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Avisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('avisos')
export class AvisosController {
  constructor(private readonly service: AvisosService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROFESSOR', 'SECRETARIA')
  @ApiOperation({ summary: 'Publicar aviso' })
  create(@Body() dto: CreateAvisoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar avisos' })
  @ApiQuery({ name: 'destinatarios', required: false, enum: ['TODOS', 'PROFESSORES', 'ESTUDANTES', 'PAIS'] })
  @ApiQuery({ name: 'prioridade', required: false, enum: ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'] })
  @ApiQuery({ name: 'apenasAtivos', required: false, type: Boolean })
  findAll(
    @Query('destinatarios') destinatarios?: string,
    @Query('prioridade') prioridade?: string,
    @Query('apenasAtivos') apenasAtivos?: string,
  ) {
    return this.service.findAll(destinatarios, prioridade, apenasAtivos === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do aviso' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROFESSOR', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar aviso' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAvisoDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover aviso' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
