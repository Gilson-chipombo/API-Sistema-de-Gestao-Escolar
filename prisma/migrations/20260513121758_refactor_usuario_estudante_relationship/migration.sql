/*
  Warnings:

  - You are about to drop the column `usuario_id` on the `Estudante` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[estudanteId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Estudante" DROP CONSTRAINT "Estudante_usuario_id_fkey";

-- DropIndex
DROP INDEX "Estudante_usuario_id_key";

-- AlterTable
ALTER TABLE "Estudante" DROP COLUMN "usuario_id";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "estudanteId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_estudanteId_key" ON "Usuario"("estudanteId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_estudanteId_fkey" FOREIGN KEY ("estudanteId") REFERENCES "Estudante"("id_estudante") ON DELETE SET NULL ON UPDATE CASCADE;
