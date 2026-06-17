/*
  Warnings:

  - You are about to drop the column `dsc_senha` on the `catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `dsc_cpf` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `dsc_casada_igreja_catolica` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `dsc_casado` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - Added the required column `pws_senha` to the `catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `flg_casado` to the `inscricoes_catequistas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "catequistas" DROP COLUMN "dsc_senha",
ADD COLUMN     "pws_senha" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "catequizandos" DROP COLUMN "dsc_cpf",
ADD COLUMN     "nr_cpf" TEXT;

-- AlterTable
ALTER TABLE "inscricoes_catequistas" DROP COLUMN "dsc_casada_igreja_catolica",
DROP COLUMN "dsc_casado",
ADD COLUMN     "flg_casada_igreja_catolica" BOOLEAN,
ADD COLUMN     "flg_casado" BOOLEAN NOT NULL;
