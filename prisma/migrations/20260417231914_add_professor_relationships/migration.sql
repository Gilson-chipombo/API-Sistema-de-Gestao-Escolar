-- CreateTable
CREATE TABLE "ProfessorDisciplina" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessorDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessorTurma" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "turma_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessorTurma_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorDisciplina_professor_id_disciplina_id_key" ON "ProfessorDisciplina"("professor_id", "disciplina_id");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorTurma_professor_id_turma_id_key" ON "ProfessorTurma"("professor_id", "turma_id");

-- AddForeignKey
ALTER TABLE "ProfessorDisciplina" ADD CONSTRAINT "ProfessorDisciplina_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Professor"("id_prof") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorDisciplina" ADD CONSTRAINT "ProfessorDisciplina_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id_disc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorTurma" ADD CONSTRAINT "ProfessorTurma_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Professor"("id_prof") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorTurma" ADD CONSTRAINT "ProfessorTurma_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE CASCADE ON UPDATE CASCADE;
