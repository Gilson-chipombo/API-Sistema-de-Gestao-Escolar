/*
  Warnings:

  - Changed the type of `tipoEnsino` on the `Classe` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TipoEnsino" AS ENUM ('SECUNDARIO', 'MEDIO');

-- DropIndex
DROP INDEX "Curso_sigla_curso_key";

-- AlterTable
ALTER TABLE "Classe" DROP COLUMN "tipoEnsino",
ADD COLUMN     "tipoEnsino" "TipoEnsino" NOT NULL;

-- AlterTable
ALTER TABLE "ClasseDisciplina" RENAME CONSTRAINT "CursoDisciplina_pkey" TO "ClasseDisciplina_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "Classe_sigla_classe_nomeCurso_tipoEnsino_key" ON "Classe"("sigla_classe", "nomeCurso", "tipoEnsino");

-- RenameForeignKey
ALTER TABLE "ClasseDisciplina" RENAME CONSTRAINT "CursoDisciplina_disciplina_id_fkey" TO "ClasseDisciplina_disciplina_id_fkey";

-- RenameIndex
ALTER INDEX "CursoDisciplina_curso_id_disciplina_id_key" RENAME TO "ClasseDisciplina_classe_id_disciplina_id_key";
