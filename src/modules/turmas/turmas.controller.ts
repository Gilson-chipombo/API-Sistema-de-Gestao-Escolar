import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
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
  constructor(private readonly service: TurmasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Criar turma' })
  create(@Body() dto: CreateTurmaDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Listar turmas' })
  @ApiQuery({ name: 'anoLetivo', required: false, type: Number })
  @ApiQuery({ name: 'classe', required: false })
  findAll(@Query('anoLetivo') ano?: string, @Query('classe') classe?: string) {
    return this.service.findAll(ano ? +ano : undefined, classe);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da turma (com estudantes)' })
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTurmaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
