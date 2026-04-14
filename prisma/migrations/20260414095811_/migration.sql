-- CreateEnum
CREATE TYPE "PerfilUsuario" AS ENUM ('ADMIN', 'PROFESSOR', 'ESTUDANTE', 'SECRETARIA');

-- CreateEnum
CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO');

-- CreateEnum
CREATE TYPE "NivelAcademico" AS ENUM ('LICENCIATURA', 'MESTRADO', 'DOUTORAMENTO', 'BACHARELATO', 'OUTRO');

-- CreateEnum
CREATE TYPE "StatusProfessor" AS ENUM ('ATIVO', 'INATIVO', 'LICENCA');

-- CreateEnum
CREATE TYPE "StatusEstudante" AS ENUM ('ATIVO', 'INATIVO', 'TRANSFERIDO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "TipoFalta" AS ENUM ('JUSTIFICADA', 'INJUSTIFICADA');

-- CreateEnum
CREATE TYPE "DestinatarioAviso" AS ENUM ('TODOS', 'PROFESSORES', 'ESTUDANTES', 'PAIS');

-- CreateEnum
CREATE TYPE "PrioridadeAviso" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateTable
CREATE TABLE "Usuario" (
    "id_usuario" SERIAL NOT NULL,
    "user_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "perfil" "PerfilUsuario" NOT NULL,
    "status" "StatusUsuario" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "Professor" (
    "id_prof" SERIAL NOT NULL,
    "nome_prof" TEXT NOT NULL,
    "filiacao_prof" TEXT,
    "data_nascimento_prof" DATE NOT NULL,
    "email_prof" TEXT,
    "telefone_prof" TEXT NOT NULL,
    "numero_bi_prof" TEXT NOT NULL,
    "data_emissao_bi_prof" DATE NOT NULL,
    "nacionalidade_prof" TEXT,
    "endereco_fisico_prof" TEXT NOT NULL,
    "naturalidade_prof" TEXT NOT NULL,
    "nivel_academico" "NivelAcademico" NOT NULL,
    "area_formacao_prof" TEXT NOT NULL,
    "ano_conclusao_formacao" INTEGER,
    "data_admissao" DATE,
    "status" "StatusProfessor" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "usuario_id" INTEGER,

    CONSTRAINT "Professor_pkey" PRIMARY KEY ("id_prof")
);

-- CreateTable
CREATE TABLE "Curso" (
    "id_curso" SERIAL NOT NULL,
    "sigla_curso" TEXT NOT NULL,
    "descricao_curso" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Curso_pkey" PRIMARY KEY ("id_curso")
);

-- CreateTable
CREATE TABLE "Turma" (
    "id_turma" SERIAL NOT NULL,
    "sigla_turma" TEXT NOT NULL,
    "ano_lectivo_turma" INTEGER NOT NULL,
    "turno_turma" TEXT NOT NULL,
    "classe_turma" TEXT NOT NULL,
    "sala_turma" TEXT NOT NULL,
    "numero_aluno_turma" INTEGER,
    "observacoes_turma" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "curso_id" INTEGER,
    "diretor_turma" INTEGER NOT NULL,

    CONSTRAINT "Turma_pkey" PRIMARY KEY ("id_turma")
);

-- CreateTable
CREATE TABLE "Estudante" (
    "id_estudante" SERIAL NOT NULL,
    "nome_estudante" TEXT NOT NULL,
    "data_nascimento" DATE NOT NULL,
    "nome_pai_estudante" TEXT,
    "nome_mae_estudante" TEXT,
    "naturalidade_estudante" TEXT NOT NULL,
    "numero_bi_estudante" TEXT NOT NULL,
    "telefone_estudante" TEXT,
    "endereco_fisico_estudante" TEXT NOT NULL,
    "numero_matricula" INTEGER NOT NULL,
    "turno_estudante" TEXT NOT NULL,
    "classe_estudante" TEXT NOT NULL,
    "encarregado_estudante" TEXT,
    "data_cadastro" DATE,
    "status" "StatusEstudante" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "turma_id" INTEGER NOT NULL,

    CONSTRAINT "Estudante_pkey" PRIMARY KEY ("id_estudante")
);

-- CreateTable
CREATE TABLE "Disciplina" (
    "id_disc" SERIAL NOT NULL,
    "sigla_disc" TEXT NOT NULL,
    "descricao_disc" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Disciplina_pkey" PRIMARY KEY ("id_disc")
);

-- CreateTable
CREATE TABLE "Nota" (
    "id_nota" SERIAL NOT NULL,
    "trimestre_nota" DECIMAL(5,2),
    "data_nota" DATE,
    "mac_notas" DECIMAL(5,2),
    "pp_notas" DECIMAL(5,2),
    "pt_notas" DECIMAL(5,2),
    "ano_letivo" INTEGER,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "estudante_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "turma_id" INTEGER NOT NULL,

    CONSTRAINT "Nota_pkey" PRIMARY KEY ("id_nota")
);

-- CreateTable
CREATE TABLE "Falta" (
    "id_falta" SERIAL NOT NULL,
    "data_falta" DATE NOT NULL,
    "tipo_falta" "TipoFalta" NOT NULL,
    "observacao" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "estudante_id" INTEGER NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "turma_id" INTEGER NOT NULL,

    CONSTRAINT "Falta_pkey" PRIMARY KEY ("id_falta")
);

-- CreateTable
CREATE TABLE "Aviso" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "destinatarios" "DestinatarioAviso" NOT NULL,
    "data_publicacao" TIMESTAMP(3) NOT NULL,
    "data_expiracao" DATE,
    "prioridade" "PrioridadeAviso" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "professor_id" INTEGER,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_numero_bi_prof_key" ON "Professor"("numero_bi_prof");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_usuario_id_key" ON "Professor"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Curso_sigla_curso_key" ON "Curso"("sigla_curso");

-- CreateIndex
CREATE UNIQUE INDEX "Estudante_numero_bi_estudante_key" ON "Estudante"("numero_bi_estudante");

-- CreateIndex
CREATE UNIQUE INDEX "Estudante_numero_matricula_key" ON "Estudante"("numero_matricula");

-- CreateIndex
CREATE UNIQUE INDEX "Disciplina_sigla_disc_key" ON "Disciplina"("sigla_disc");

-- AddForeignKey
ALTER TABLE "Professor" ADD CONSTRAINT "Professor_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_curso_id_fkey" FOREIGN KEY ("curso_id") REFERENCES "Curso"("id_curso") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turma" ADD CONSTRAINT "Turma_diretor_turma_fkey" FOREIGN KEY ("diretor_turma") REFERENCES "Professor"("id_prof") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estudante" ADD CONSTRAINT "Estudante_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_estudante_id_fkey" FOREIGN KEY ("estudante_id") REFERENCES "Estudante"("id_estudante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id_disc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Falta" ADD CONSTRAINT "Falta_estudante_id_fkey" FOREIGN KEY ("estudante_id") REFERENCES "Estudante"("id_estudante") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Falta" ADD CONSTRAINT "Falta_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "Disciplina"("id_disc") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Falta" ADD CONSTRAINT "Falta_turma_id_fkey" FOREIGN KEY ("turma_id") REFERENCES "Turma"("id_turma") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_professor_id_fkey" FOREIGN KEY ("professor_id") REFERENCES "Usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;
