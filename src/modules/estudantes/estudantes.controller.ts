import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { EstudantesService } from './estudantes.service';
import { CreateEstudanteDto, UpdateEstudanteDto } from './dto/estudante.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Estudantes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('estudantes')
export class EstudantesController {
  constructor(private readonly service: EstudantesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Registar estudante' })
  create(@Body() dto: CreateEstudanteDto) {
    return this.service.create(dto);
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
    return this.service.findAll(turmaId ? +turmaId : undefined, classe, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do estudante' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
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
