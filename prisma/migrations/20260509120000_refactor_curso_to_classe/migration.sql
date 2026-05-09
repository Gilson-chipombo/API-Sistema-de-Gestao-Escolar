-- AddColumn nomeCurso e tipoEnsino à tabela curso
ALTER TABLE "Curso" ADD COLUMN "nomeCurso" TEXT,
ADD COLUMN "tipoEnsino" TEXT NOT NULL DEFAULT 'SECUNDARIO';

-- Remover constraint unique antiga de sigla_curso
ALTER TABLE "Curso" DROP CONSTRAINT "Curso_sigla_curso_key";

-- Adicionar nova constraint unique em (sigla_curso, nomeCurso, tipoEnsino)
ALTER TABLE "Curso" ADD CONSTRAINT "Curso_sigla_curso_nomeCurso_tipoEnsino_key" UNIQUE ("sigla_curso", "nomeCurso", "tipoEnsino");

-- Renomear tabela Curso para Classe
ALTER TABLE "Curso" RENAME TO "Classe";

-- Renomear colunas na tabela Classe
ALTER TABLE "Classe" RENAME COLUMN "id_curso" TO "id_classe";
ALTER TABLE "Classe" RENAME COLUMN "sigla_curso" TO "sigla_classe";
ALTER TABLE "Classe" RENAME COLUMN "descricao_curso" TO "descricao_classe";

-- Renomear constraint
ALTER TABLE "Classe" RENAME CONSTRAINT "Curso_pkey" TO "Classe_pkey";
ALTER TABLE "Classe" RENAME CONSTRAINT "Curso_sigla_curso_nomeCurso_tipoEnsino_key" TO "Classe_sigla_classe_nomeCurso_tipoEnsino_key";

-- Renomear tabela CursoDisciplina para ClasseDisciplina
ALTER TABLE "CursoDisciplina" RENAME TO "ClasseDisciplina";

-- Renomear coluna curso_id para classe_id em ClasseDisciplina
ALTER TABLE "ClasseDisciplina" RENAME COLUMN "curso_id" TO "classe_id";

-- Atualizar foreign key em ClasseDisciplina
ALTER TABLE "ClasseDisciplina" RENAME CONSTRAINT "CursoDisciplina_curso_id_fkey" TO "ClasseDisciplina_classe_id_fkey";

-- Renomear coluna curso_id para classe_id em Turma
ALTER TABLE "Turma" RENAME COLUMN "curso_id" TO "classe_id";

-- Atualizar foreign key em Turma
ALTER TABLE "Turma" RENAME CONSTRAINT "Turma_curso_id_fkey" TO "Turma_classe_id_fkey";
