-- DropForeignKey
ALTER TABLE "Estudante" DROP CONSTRAINT "Estudante_turma_id_fkey";

-- AlterTable
ALTER TABLE "Estudante" ALTER COLUMN "turma_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Estudante" ADD CONSTRAINT "Estudante_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE SET NULL ON UPDATE CASCADE;
