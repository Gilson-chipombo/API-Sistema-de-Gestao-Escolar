import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProfessoresService } from './professores.service';
import { CreateProfessorDto, UpdateProfessorDto } from './dto/professor.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Professores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('professores')
export class ProfessoresController {
  constructor(private readonly service: ProfessoresService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Registar professor' })
  create(@Body() dto: CreateProfessorDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar professores' })
  @ApiQuery({ name: 'status', required: false })
  findAll(@Query('status') status?: string) {
    return this.service.findAll(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe do professor' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SECRETARIA')
  @ApiOperation({ summary: 'Actualizar professor' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProfessorDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Desactivar professor' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
