import { Module } from '@nestjs/common';
import { FaltasService } from './faltas.service';
import { FaltasController } from './faltas.controller';

@Module({
  controllers: [FaltasController],
  providers: [FaltasService],
  exports: [FaltasService],
})
export class FaltasModule {}
