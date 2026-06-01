-- CreateTable
CREATE TABLE "ProfessorTurmaDisciplina" (
    "id" SERIAL NOT NULL,
    "professor_id" INTEGER NOT NULL,
    "turma_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessorTurmaDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessorTurmaDisciplina_professor_id_turma_id_disciplina_i_key" ON "ProfessorTurmaDisciplina"("professor_id", "turma_id", "disciplina_id");

-- AddForeignKey
ALTER TABLE "ProfessorTurmaDisciplina" ADD CONSTRAINT "ProfessorTurmaDisciplina_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Professor"("id_prof") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorTurmaDisciplina" ADD CONSTRAINT "ProfessorTurmaDisciplina_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessorTurmaDisciplina" ADD CONSTRAINT "ProfessorTurmaDisciplina_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id_disc") ON DELETE CASCADE ON UPDATE CASCADE;
