import { Module } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { CursosService } from './cursos.service';
import { CursosController } from './cursos.controller';

@Module({
  controllers: [ClassesController, CursosController],
  providers: [ClassesService, CursosService], // Manter CursosService para compatibilidade
  exports: [ClassesService, CursosService],
})
export class CursosModule {}
