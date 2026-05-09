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
