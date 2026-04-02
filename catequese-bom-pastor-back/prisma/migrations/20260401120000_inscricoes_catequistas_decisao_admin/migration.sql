-- AlterTable
ALTER TABLE "inscricoes_catequistas"
ADD COLUMN "decisaoEm" TIMESTAMP(3),
ADD COLUMN "decisaoPorId" TEXT,
ADD COLUMN "observacoesAdmin" TEXT;

-- AddForeignKey
ALTER TABLE "inscricoes_catequistas"
ADD CONSTRAINT "inscricoes_catequistas_decisaoPorId_fkey"
FOREIGN KEY ("decisaoPorId") REFERENCES "administrador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
