import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisciplinasService } from './disciplinas.service';
import { CreateDisciplinaDto, UpdateDisciplinaDto } from './dto/disciplina.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Disciplinas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disciplinas')
export class DisciplinasController {
  constructor(private readonly service: DisciplinasService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Criar disciplina' })
  create(@Body() dto: CreateDisciplinaDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Listar disciplinas' })
  findAll() { return this.service.findAll(); }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDisciplinaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
