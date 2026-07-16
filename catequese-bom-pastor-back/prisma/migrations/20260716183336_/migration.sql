/*
  Warnings:

  - You are about to drop the column `criadoEm` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `eventos` table. All the data in the column will be lost.
  - Added the required column `dat_atualizado_em` to the `eventos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "eventos" DROP COLUMN "criadoEm",
DROP COLUMN "updatedAt",
ADD COLUMN     "dat_atualizado_em" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dat_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dat_fim" TIMESTAMP(3),
ADD COLUMN     "dsc_categoria" TEXT NOT NULL DEFAULT 'ENCONTRO',
ADD COLUMN     "dsc_cor" TEXT,
ADD COLUMN     "dsc_local" TEXT,
ADD COLUMN     "dsc_recorrencia" TEXT,
ADD COLUMN     "hor_fim" TEXT,
ADD COLUMN     "hor_inicio" TEXT,
ALTER COLUMN "tipo" SET DEFAULT 'GERAL';
