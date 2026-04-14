import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FaltasService } from './faltas.service';
import { CreateFaltaDto, UpdateFaltaDto } from './dto/falta.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Faltas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('faltas')
export class FaltasController {
  constructor(private readonly service: FaltasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROFESSOR', 'SECRETARIA')
  @ApiOperation({ summary: 'Registar falta' })
  create(@Body() dto: CreateFaltaDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar faltas com filtros' })
  @ApiQuery({ name: 'estudanteId', required: false, type: Number })
  @ApiQuery({ name: 'disciplinaId', required: false, type: Number })
  @ApiQuery({ name: 'turmaId', required: false, type: Number })
  @ApiQuery({ name: 'tipo', required: false, enum: ['JUSTIFICADA', 'INJUSTIFICADA'] })
  findAll(
    @Query('estudanteId') eId?: string,
    @Query('disciplinaId') dId?: string,
    @Query('turmaId') tId?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.service.findAll(
      eId ? +eId : undefined,
      dId ? +dId : undefined,
      tId ? +tId : undefined,
      tipo,
    );
  }

  @Get('resumo/:estudanteId')
  @ApiOperation({ summary: 'Resumo de faltas agrupadas por disciplina' })
  @ApiQuery({ name: 'turmaId', required: true, type: Number })
  resumo(
    @Param('estudanteId', ParseIntPipe) estudanteId: number,
    @Query('turmaId', ParseIntPipe) turmaId: number,
  ) {
    return this.service.resumoPorEstudante(estudanteId, turmaId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROFESSOR', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar falta' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFaltaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover falta' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
