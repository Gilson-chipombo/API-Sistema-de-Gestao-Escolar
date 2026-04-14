import { Module } from '@nestjs/common';
import { ProfessoresService } from './professores.service';
import { ProfessoresController } from './professores.controller';

@Module({
  controllers: [ProfessoresController],
  providers: [ProfessoresService],
  exports: [ProfessoresService],
})
export class ProfessoresModule {}
