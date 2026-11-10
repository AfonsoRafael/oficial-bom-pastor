ALTER TABLE "ordem_loja"
ADD COLUMN "dsc_comprovante_pagamento_url" TEXT;

ALTER TABLE "ordem_loja"
ALTER COLUMN "status" SET DEFAULT 'aguardando_confirmacao';
