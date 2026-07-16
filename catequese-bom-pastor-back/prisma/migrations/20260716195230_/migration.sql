-- CreateEnum
CREATE TYPE "DestinatarioTipo" AS ENUM ('ADMINISTRADOR', 'CATEQUISTA', 'RESPONSAVEL', 'TURMA');

-- CreateTable
CREATE TABLE "mensagens" (
    "cod_mensagem" TEXT NOT NULL,
    "dsc_remetente_tipo" "DestinatarioTipo" NOT NULL,
    "cod_remetente" TEXT NOT NULL,
    "dsc_assunto" TEXT NOT NULL,
    "txt_conteudo" TEXT NOT NULL,
    "ind_lida" BOOLEAN NOT NULL DEFAULT false,
    "dat_lida_em" TIMESTAMP(3),
    "dat_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dat_atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("cod_mensagem")
);

-- CreateTable
CREATE TABLE "mensagens_destinatarios" (
    "cod_mensagem_destinatario" TEXT NOT NULL,
    "cod_mensagem" TEXT NOT NULL,
    "dsc_destinatario_tipo" "DestinatarioTipo" NOT NULL,
    "cod_destinatario" TEXT NOT NULL,
    "ind_lida" BOOLEAN NOT NULL DEFAULT false,
    "dat_lida_em" TIMESTAMP(3),
    "dat_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_destinatarios_pkey" PRIMARY KEY ("cod_mensagem_destinatario")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "cod_notificacao" TEXT NOT NULL,
    "dsc_usuario_tipo" "DestinatarioTipo" NOT NULL,
    "cod_usuario" TEXT NOT NULL,
    "dsc_titulo" TEXT NOT NULL,
    "dsc_descricao" TEXT NOT NULL,
    "dsc_tipo" TEXT NOT NULL,
    "dsc_prioridade" TEXT NOT NULL DEFAULT 'NORMAL',
    "ind_lida" BOOLEAN NOT NULL DEFAULT false,
    "dat_lida_em" TIMESTAMP(3),
    "txt_link_relacionado" TEXT,
    "dat_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("cod_notificacao")
);

-- AddForeignKey
ALTER TABLE "mensagens_destinatarios" ADD CONSTRAINT "mensagens_destinatarios_cod_mensagem_fkey" FOREIGN KEY ("cod_mensagem") REFERENCES "mensagens"("cod_mensagem") ON DELETE CASCADE ON UPDATE CASCADE;
