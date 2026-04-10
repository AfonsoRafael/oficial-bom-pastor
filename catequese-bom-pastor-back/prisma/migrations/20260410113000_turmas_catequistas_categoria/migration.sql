-- Permite múltiplos catequistas por turma com categoria (catequista/auxiliar)
CREATE TYPE "CategoriaCatequistaTurma" AS ENUM ('CATEQUISTA', 'AUXILIAR');

CREATE TABLE "turmas_catequistas" (
  "id" TEXT NOT NULL,
  "turmaId" TEXT NOT NULL,
  "catequistaId" TEXT NOT NULL,
  "categoria" "CategoriaCatequistaTurma" NOT NULL DEFAULT 'CATEQUISTA',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "turmas_catequistas_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "turmas_catequistas_turmaId_catequistaId_key" ON "turmas_catequistas"("turmaId", "catequistaId");
CREATE INDEX "turmas_catequistas_turmaId_idx" ON "turmas_catequistas"("turmaId");
CREATE INDEX "turmas_catequistas_catequistaId_idx" ON "turmas_catequistas"("catequistaId");

ALTER TABLE "turmas_catequistas"
  ADD CONSTRAINT "turmas_catequistas_turmaId_fkey"
  FOREIGN KEY ("turmaId") REFERENCES "turmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "turmas_catequistas"
  ADD CONSTRAINT "turmas_catequistas_catequistaId_fkey"
  FOREIGN KEY ("catequistaId") REFERENCES "catequistas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill da estrutura antiga (1 catequista por turma) para a nova tabela N:N
INSERT INTO "turmas_catequistas" ("id", "turmaId", "catequistaId", "categoria", "createdAt", "updatedAt")
SELECT
  md5(random()::text || clock_timestamp()::text || t."id"),
  t."id",
  t."catequistaId",
  'CATEQUISTA'::"CategoriaCatequistaTurma",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "turmas" t
WHERE t."catequistaId" IS NOT NULL;

ALTER TABLE "turmas" DROP CONSTRAINT IF EXISTS "turmas_catequistaId_fkey";
ALTER TABLE "turmas" DROP COLUMN IF EXISTS "catequistaId";
