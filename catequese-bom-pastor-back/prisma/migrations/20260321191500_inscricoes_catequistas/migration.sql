-- CreateEnum
CREATE TYPE "InscricaoCatequistaStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "inscricoes_catequistas" (
    "id" TEXT NOT NULL,
    "status" "InscricaoCatequistaStatus" NOT NULL DEFAULT 'PENDING',
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "dataBatismo" TIMESTAMP(3),
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "casado" TEXT NOT NULL,
    "casadaIgrejaCatolica" TEXT,
    "sacramentos" TEXT,
    "alergias" TEXT,
    "ComprovanteResidencia" TEXT,
    "DocumentoCpf" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_catequistas_pkey" PRIMARY KEY ("id")
);
