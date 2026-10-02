-- AlterTable
ALTER TABLE "_ItensOrdem" ADD CONSTRAINT "_ItensOrdem_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ItensOrdem_AB_unique";
