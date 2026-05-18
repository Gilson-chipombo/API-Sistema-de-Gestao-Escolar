/*
  Warnings:

  - You are about to drop the column `duracao_semestres` on the `Classe` table. All the data in the column will be lost.
  - You are about to drop the column `nomeCurso` on the `Classe` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sigla_classe,tipoEnsino]` on the table `Classe` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Classe_sigla_classe_nomeCurso_tipoEnsino_key";

-- AlterTable
ALTER TABLE "Classe" DROP COLUMN "duracao_semestres",
DROP COLUMN "nomeCurso",
ADD COLUMN     "curso_id" INTEGER;

-- CreateTable
CREATE TABLE "Curso" (
    "id_curso" SERIAL NOT NULL,
    "sigla_curso" TEXT NOT NULL,
    "descricao_curso" TEXT NOT NULL,
    "duracao_semestres" INTEGER,
    "objetivo_curso" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id_curso")
);

-- Remove duplicate entries (keep only the first id_classe for each combination)
DELETE FROM "Classe" c1
WHERE c1."id_classe" NOT IN (
  SELECT MIN("id_classe")
  FROM "Classe" c2
  WHERE c2."sigla_classe" = c1."sigla_classe"
    AND c2."tipoEnsino" = c1."tipoEnsino"
  GROUP BY "sigla_classe", "tipoEnsino"
);

-- CreateIndex
CREATE UNIQUE INDEX "Classe_sigla_classe_tipoEnsino_key" ON "Classe"("sigla_classe", "tipoEnsino");

-- AddForeignKey
ALTER TABLE "Classe" ADD CONSTRAINT "Classe_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "Curso"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE;
