import { Module } from '@nestjs/common';
import { DisciplinasService } from './disciplinas.service';
import { DisciplinasController } from './disciplinas.controller';

@Module({
  controllers: [DisciplinasController],
  providers: [DisciplinasService],
  exports: [DisciplinasService],
})
export class DisciplinasModule {}
