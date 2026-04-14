import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { EstudantesModule } from './modules/estudantes/estudantes.module';
import { ProfessoresModule } from './modules/professores/professores.module';
import { TurmasModule } from './modules/turmas/turmas.module';
import { DisciplinasModule } from './modules/disciplinas/disciplinas.module';
import { CursosModule } from './modules/cursos/cursos.module';
import { NotasModule } from './modules/notas/notas.module';
import { FaltasModule } from './modules/faltas/faltas.module';
import { AvisosModule } from './modules/avisos/avisos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsuariosModule,
    EstudantesModule,
    ProfessoresModule,
    TurmasModule,
    DisciplinasModule,
    CursosModule,
    NotasModule,
    FaltasModule,
    AvisosModule,
  ],
})
export class AppModule {}
