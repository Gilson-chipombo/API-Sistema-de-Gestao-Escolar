/*
  Warnings:

  - A unique constraint covering the columns `[usuario_id]` on the table `Estudante` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Estudante" ADD COLUMN     "usuario_id" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Estudante_usuario_id_key" ON "Estudante"("usuario_id");

-- AddForeignKey
ALTER TABLE "Estudante" ADD CONSTRAINT "Estudante_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
