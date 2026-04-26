/*
  Warnings:

  - You are about to drop the column `classe_estudante` on the `Estudante` table. All the data in the column will be lost.
  - You are about to drop the column `numero_matricula` on the `Estudante` table. All the data in the column will be lost.
  - You are about to drop the column `turno_estudante` on the `Estudante` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Falta" DROP CONSTRAINT "Falta_disciplina_id_fkey";

-- DropForeignKey
ALTER TABLE "Falta" DROP CONSTRAINT "Falta_estudante_id_fkey";

-- DropForeignKey
ALTER TABLE "Falta" DROP CONSTRAINT "Falta_turma_id_fkey";

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_disciplina_id_fkey";

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_estudante_id_fkey";

-- DropForeignKey
ALTER TABLE "Nota" DROP CONSTRAINT "Nota_turma_id_fkey";

-- DropIndex
DROP INDEX "Estudante_numero_matricula_key";

-- AlterTable
ALTER TABLE "Curso" ADD COLUMN     "duracao_semestres" INTEGER;

-- AlterTable
ALTER TABLE "Estudante" DROP COLUMN "classe_estudante",
DROP COLUMN "numero_matricula",
DROP COLUMN "turno_estudante";

-- CreateTable
CREATE TABLE "CursoDisciplina" (
    "id" SERIAL NOT NULL,
    "curso_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "ordem" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CursoDisciplina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CursoDisciplina_curso_id_disciplina_id_key" ON "CursoDisciplina"("curso_id", "disciplina_id");

-- AddForeignKey
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "Curso"("id_curso") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CursoDisciplina" ADD CONSTRAINT "CursoDisciplina_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id_disc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id_disc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_estudante_id_fkey" FOREIGN KEY ("estudante_id") REFERENCES "Estudante"("id_estudante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Falta" ADD CONSTRAINT "Falta_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id_disc") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Falta" ADD CONSTRAINT "Falta_estudante_id_fkey" FOREIGN KEY ("estudante_id") REFERENCES "Estudante"("id_estudante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Falta" ADD CONSTRAINT "Falta_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE CASCADE ON UPDATE CASCADE;
