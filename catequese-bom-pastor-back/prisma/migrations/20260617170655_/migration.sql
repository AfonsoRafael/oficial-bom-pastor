-- CreateTable
CREATE TABLE "administrador" (
    "cod_administrador" TEXT NOT NULL,
    "dsc_email" TEXT NOT NULL,
    "dsc_nome" TEXT NOT NULL,
    "dsc_telefone" TEXT,
    "dsc_senha" TEXT NOT NULL,
    "ind_primeiro_acesso" BOOLEAN NOT NULL DEFAULT false,
    "dat_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dat_atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "administrador_pkey" PRIMARY KEY ("cod_administrador")
);

-- CreateTable
CREATE TABLE "responsaveis" (
    "cod_responsavel" TEXT NOT NULL,
    "dsc_email" TEXT NOT NULL,
    "dsc_nome" TEXT NOT NULL,
    "dsc_telefone" TEXT,
    "dsc_senha" TEXT NOT NULL,
    "ind_primeiro_acesso" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("cod_responsavel")
);

-- CreateTable
CREATE TABLE "turmas" (
    "cod_turma" TEXT NOT NULL,
    "dsc_nome" TEXT NOT NULL,
    "num_ano" INTEGER NOT NULL,
    "dsc_horario" TEXT,
    "dsc_sala" TEXT,
    "cod_administrador" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_pkey" PRIMARY KEY ("cod_turma")
);

-- CreateTable
CREATE TABLE "catequizandos" (
    "cod_catequizando" TEXT NOT NULL,
    "dsc_nome" TEXT NOT NULL,
    "dat_nascimento" TIMESTAMP(3) NOT NULL,
    "dat_batismo" TIMESTAMP(3),
    "dsc_cpf" TEXT,
    "dsc_email" TEXT,
    "dsc_telefone" TEXT,
    "dsc_endereco" TEXT,
    "cod_turma" TEXT,
    "cod_responsavel" TEXT NOT NULL,
    "dsc_observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catequizandos_pkey" PRIMARY KEY ("cod_catequizando")
);

-- CreateTable
CREATE TABLE "pre_matriculas" (
    "cod_pre_matricula" TEXT NOT NULL,
    "dsc_status" TEXT NOT NULL,
    "dsc_nome_catequizando" TEXT NOT NULL,
    "dsc_alergias_problemas_saude" TEXT,
    "dat_nascimento" TIMESTAMP(3) NOT NULL,
    "dsc_nome_pais" TEXT NOT NULL,
    "dsc_email" TEXT NOT NULL,
    "dsc_telefone" TEXT NOT NULL,
    "dsc_sacramentos_pais" TEXT,
    "dsc_certificado_batismo" TEXT,
    "dsc_comprovante_endereco" TEXT,
    "dsc_certidao_nascimento" TEXT,
    "dat_decisao" TIMESTAMP(3),
    "cod_administrador" TEXT,
    "observacoesAdmin" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pre_matriculas_pkey" PRIMARY KEY ("cod_pre_matricula")
);

-- CreateTable
CREATE TABLE "inscricoes_catequistas" (
    "cod_inscricao_catequista" TEXT NOT NULL,
    "dsc_status" TEXT NOT NULL,
    "dsc_nome" TEXT NOT NULL,
    "dat_nascimento" TIMESTAMP(3) NOT NULL,
    "dat_batismo" TIMESTAMP(3),
    "dsc_email" TEXT NOT NULL,
    "dsc_telefone" TEXT NOT NULL,
    "dsc_casado" TEXT NOT NULL,
    "dsc_casada_igreja_catolica" TEXT,
    "dsc_sacramentos" TEXT,
    "dsc_alergias" TEXT,
    "dsc_comprovante_residencia" TEXT,
    "dsc_documento_cpf" TEXT,
    "dat_decisao" TIMESTAMP(3),
    "cod_administrador" TEXT,
    "dsc_observacoes_admin" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_catequistas_pkey" PRIMARY KEY ("cod_inscricao_catequista")
);

-- CreateTable
CREATE TABLE "catequizando_documentos" (
    "cod_documento" TEXT NOT NULL,
    "cod_catequizando" TEXT NOT NULL,
    "dsc_tipo" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "dat_upload" TIMESTAMP(3),
    "dsc_file_url" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catequizando_documentos_pkey" PRIMARY KEY ("cod_documento")
);

-- CreateTable
CREATE TABLE "inscricoes" (
    "cod_inscricao" TEXT NOT NULL,
    "cod_catequizando" TEXT NOT NULL,
    "cod_turma" TEXT NOT NULL,
    "cod_responsavel" TEXT NOT NULL,
    "dsc_status" TEXT NOT NULL,
    "documentosUrl" TEXT[],
    "dsc_observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inscricoes_pkey" PRIMARY KEY ("cod_inscricao")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "cod_pagamento" TEXT NOT NULL,
    "inscricaoId" TEXT,
    "responsavelId" TEXT,
    "valor" DOUBLE PRECISION NOT NULL,
    "dsc_metodo" TEXT,
    "dsc_status" TEXT,
    "dsc_receipt_url" TEXT,
    "dat_pagamento" TIMESTAMP(3),
    "dsc_descricao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("cod_pagamento")
);

-- CreateTable
CREATE TABLE "materiais" (
    "cod_material" TEXT NOT NULL,
    "dsc_titulo" TEXT NOT NULL,
    "dsc_descricao" TEXT,
    "dsc_file_url" TEXT NOT NULL,
    "cod_turma" TEXT,
    "visibilidade" TEXT NOT NULL DEFAULT 'geral',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiais_pkey" PRIMARY KEY ("cod_material")
);

-- CreateTable
CREATE TABLE "catequistas" (
    "cod_catequista" TEXT NOT NULL,
    "dsc_nome" TEXT NOT NULL,
    "dsc_email" TEXT NOT NULL,
    "dsc_senha" TEXT NOT NULL,
    "dsc_telefone" TEXT,
    "dsc_endereco" TEXT,
    "dsc_bio" TEXT,
    "primeiroAcesso" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catequistas_pkey" PRIMARY KEY ("cod_catequista")
);

-- CreateTable
CREATE TABLE "turmas_catequistas" (
    "cod_turma_catequista" TEXT NOT NULL,
    "cod_turma" TEXT NOT NULL,
    "cod_catequista" TEXT NOT NULL,
    "dsc_categoria" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "turmas_catequistas_pkey" PRIMARY KEY ("cod_turma_catequista")
);

-- CreateTable
CREATE TABLE "documentos" (
    "cod_documento" TEXT NOT NULL,
    "dsc_titulo" TEXT NOT NULL,
    "dsc_descricao" TEXT,
    "dsc_file_url" TEXT NOT NULL,
    "visibilidade" TEXT NOT NULL DEFAULT 'parent',
    "cod_turma" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_pkey" PRIMARY KEY ("cod_documento")
);

-- CreateTable
CREATE TABLE "eventos" (
    "cod_evento" TEXT NOT NULL,
    "dsc_titulo" TEXT NOT NULL,
    "dsc_descricao" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "tipo" TEXT NOT NULL,
    "cod_turma" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "eventos_pkey" PRIMARY KEY ("cod_evento")
);

-- CreateTable
CREATE TABLE "galerias" (
    "cod_galeria" TEXT NOT NULL,
    "dsc_titulo" TEXT NOT NULL,
    "dsc_descricao" TEXT,
    "visibilidade" TEXT NOT NULL DEFAULT 'geral',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "galerias_pkey" PRIMARY KEY ("cod_galeria")
);

-- CreateTable
CREATE TABLE "imagens" (
    "cod_imagem" TEXT NOT NULL,
    "cod_galeria" TEXT NOT NULL,
    "dsc_file_url" TEXT NOT NULL,
    "dsc_titulo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagens_pkey" PRIMARY KEY ("cod_imagem")
);

-- CreateTable
CREATE TABLE "musicas" (
    "cod_musica" TEXT NOT NULL,
    "dsc_titulo" TEXT NOT NULL,
    "dsc_autor" TEXT,
    "txt_link_externo" TEXT,
    "dsc_notas" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "musicas_pkey" PRIMARY KEY ("cod_musica")
);

-- CreateTable
CREATE TABLE "loja_items" (
    "cod_loja_item" TEXT NOT NULL,
    "dsc_nome" TEXT NOT NULL,
    "dsc_descricao" TEXT,
    "vlr_preco" DOUBLE PRECISION NOT NULL,
    "qtd_estoque" INTEGER NOT NULL,
    "dsc_imagem_url" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loja_items_pkey" PRIMARY KEY ("cod_loja_item")
);

-- CreateTable
CREATE TABLE "ordem_loja" (
    "cod_ordem_loja" TEXT NOT NULL,
    "cod_responsavel" TEXT NOT NULL,
    "vlr_total" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "cod_pagamento" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ordem_loja_pkey" PRIMARY KEY ("cod_ordem_loja")
);

-- CreateTable
CREATE TABLE "_ItensOrdem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "administrador_dsc_email_key" ON "administrador"("dsc_email");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_dsc_email_key" ON "responsaveis"("dsc_email");

-- CreateIndex
CREATE UNIQUE INDEX "catequizando_documentos_cod_catequizando_dsc_tipo_key" ON "catequizando_documentos"("cod_catequizando", "dsc_tipo");

-- CreateIndex
CREATE UNIQUE INDEX "inscricoes_cod_catequizando_cod_turma_key" ON "inscricoes"("cod_catequizando", "cod_turma");

-- CreateIndex
CREATE UNIQUE INDEX "catequistas_dsc_email_key" ON "catequistas"("dsc_email");

-- CreateIndex
CREATE UNIQUE INDEX "turmas_catequistas_cod_turma_cod_catequista_key" ON "turmas_catequistas"("cod_turma", "cod_catequista");

-- CreateIndex
CREATE UNIQUE INDEX "_ItensOrdem_AB_unique" ON "_ItensOrdem"("A", "B");

-- CreateIndex
CREATE INDEX "_ItensOrdem_B_index" ON "_ItensOrdem"("B");

-- AddForeignKey
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_cod_administrador_fkey" FOREIGN KEY ("cod_administrador") REFERENCES "administrador"("cod_administrador") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catequizandos" ADD CONSTRAINT "catequizandos_cod_turma_fkey" FOREIGN KEY ("cod_turma") REFERENCES "turmas"("cod_turma") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catequizandos" ADD CONSTRAINT "catequizandos_cod_responsavel_fkey" FOREIGN KEY ("cod_responsavel") REFERENCES "responsaveis"("cod_responsavel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_matriculas" ADD CONSTRAINT "pre_matriculas_cod_administrador_fkey" FOREIGN KEY ("cod_administrador") REFERENCES "administrador"("cod_administrador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes_catequistas" ADD CONSTRAINT "inscricoes_catequistas_cod_administrador_fkey" FOREIGN KEY ("cod_administrador") REFERENCES "administrador"("cod_administrador") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catequizando_documentos" ADD CONSTRAINT "catequizando_documentos_cod_catequizando_fkey" FOREIGN KEY ("cod_catequizando") REFERENCES "catequizandos"("cod_catequizando") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_cod_catequizando_fkey" FOREIGN KEY ("cod_catequizando") REFERENCES "catequizandos"("cod_catequizando") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_cod_turma_fkey" FOREIGN KEY ("cod_turma") REFERENCES "turmas"("cod_turma") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inscricoes" ADD CONSTRAINT "inscricoes_cod_responsavel_fkey" FOREIGN KEY ("cod_responsavel") REFERENCES "responsaveis"("cod_responsavel") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_inscricaoId_fkey" FOREIGN KEY ("inscricaoId") REFERENCES "inscricoes"("cod_inscricao") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "responsaveis"("cod_responsavel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_cod_turma_fkey" FOREIGN KEY ("cod_turma") REFERENCES "turmas"("cod_turma") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas_catequistas" ADD CONSTRAINT "turmas_catequistas_cod_turma_fkey" FOREIGN KEY ("cod_turma") REFERENCES "turmas"("cod_turma") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "turmas_catequistas" ADD CONSTRAINT "turmas_catequistas_cod_catequista_fkey" FOREIGN KEY ("cod_catequista") REFERENCES "catequistas"("cod_catequista") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos" ADD CONSTRAINT "documentos_cod_turma_fkey" FOREIGN KEY ("cod_turma") REFERENCES "turmas"("cod_turma") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos" ADD CONSTRAINT "eventos_cod_turma_fkey" FOREIGN KEY ("cod_turma") REFERENCES "turmas"("cod_turma") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imagens" ADD CONSTRAINT "imagens_cod_galeria_fkey" FOREIGN KEY ("cod_galeria") REFERENCES "galerias"("cod_galeria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItensOrdem" ADD CONSTRAINT "_ItensOrdem_A_fkey" FOREIGN KEY ("A") REFERENCES "loja_items"("cod_loja_item") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItensOrdem" ADD CONSTRAINT "_ItensOrdem_B_fkey" FOREIGN KEY ("B") REFERENCES "ordem_loja"("cod_ordem_loja") ON DELETE CASCADE ON UPDATE CASCADE;
