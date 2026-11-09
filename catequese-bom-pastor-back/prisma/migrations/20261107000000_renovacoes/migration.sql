CREATE TABLE "renovacoes" (
    "id" TEXT NOT NULL,
    "catequizandoId" TEXT NOT NULL,
    "responsavelId" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "comprovanteKey" TEXT NOT NULL,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "renovacoes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "renovacoes_catequizandoId_ano_key" ON "renovacoes"("catequizandoId", "ano");
ALTER TABLE "renovacoes" ADD CONSTRAINT "renovacoes_catequizandoId_fkey" FOREIGN KEY ("catequizandoId") REFERENCES "catequizandos"("cod_catequizando") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "renovacoes" ADD CONSTRAINT "renovacoes_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis"("cod_responsavel") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pre_matriculas" ADD COLUMN "dat_aceite_termos" TIMESTAMP(3);
