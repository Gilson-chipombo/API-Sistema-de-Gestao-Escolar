import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { NotasService } from './notas.service';
import { CreateNotaDto, UpdateNotaDto } from './dto/nota.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Notas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notas')
export class NotasController {
  constructor(private readonly service: NotasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROFESSOR', 'SECRETARIA')
  @ApiOperation({ summary: 'Lançar nota' })
  create(@Body() dto: CreateNotaDto) {
    return this.service.create(dto);
  }

  @Post('upsert')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROFESSOR', 'SECRETARIA')
  @ApiOperation({ summary: 'Lançar ou atualizar nota (UPSERT)' })
  upsert(@Body() dto: CreateNotaDto) {
    return this.service.upsertNota(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notas com filtros' })
  @ApiQuery({ name: 'estudanteId', required: false, type: Number })
  @ApiQuery({ name: 'disciplinaId', required: false, type: Number })
  @ApiQuery({ name: 'turmaId', required: false, type: Number })
  @ApiQuery({ name: 'anoLetivo', required: false, type: Number })
  findAll(
    @Query('estudanteId') eId?: string,
    @Query('disciplinaId') dId?: string,
    @Query('turmaId') tId?: string,
    @Query('anoLetivo') ano?: string,
  ) {
    return this.service.findAll(
      eId ? +eId : undefined,
      dId ? +dId : undefined,
      tId ? +tId : undefined,
      ano ? +ano : undefined,
    );
  }

  @Get('boletim/:estudanteId')
  @ApiOperation({ summary: 'Boletim completo de um estudante' })
  @ApiQuery({ name: 'anoLetivo', required: true, type: Number })
  boletim(
    @Param('estudanteId', ParseIntPipe) estudanteId: number,
    @Query('anoLetivo', ParseIntPipe) anoLetivo: number,
  ) {
    return this.service.boletim(estudanteId, anoLetivo);
  }

  @Get('avisos/notas-lancadas')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Avisos de notas lançadas (somente ADMIN)' })
  avisosNotasLancadas() {
    return this.service.avisosNotasLancadas();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'PROFESSOR', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar nota' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNotaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Remover nota' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
