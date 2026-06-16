/*
  Warnings:

  - The primary key for the `administrador` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `criadoEm` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `primeiroAcesso` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `administrador` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `administrador` table. All the data in the column will be lost.
  - The primary key for the `catequistas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bio` on the `catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `catequistas` table. All the data in the column will be lost.
  - The primary key for the `catequizando_documentos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catequizandoId` on the `catequizando_documentos` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `catequizando_documentos` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `catequizando_documentos` table. All the data in the column will be lost.
  - You are about to drop the column `tipo` on the `catequizando_documentos` table. All the data in the column will be lost.
  - You are about to drop the column `uploadDate` on the `catequizando_documentos` table. All the data in the column will be lost.
  - The primary key for the `catequizandos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cpf` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `dataBatismo` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `dataNascimento` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `endereco` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `responsavelId` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `catequizandos` table. All the data in the column will be lost.
  - You are about to drop the column `turmaId` on the `catequizandos` table. All the data in the column will be lost.
  - The primary key for the `documentos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `descricao` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `documentos` table. All the data in the column will be lost.
  - You are about to drop the column `turmaId` on the `documentos` table. All the data in the column will be lost.
  - The primary key for the `eventos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `descricao` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `eventos` table. All the data in the column will be lost.
  - You are about to drop the column `turmaId` on the `eventos` table. All the data in the column will be lost.
  - The primary key for the `galerias` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `descricao` on the `galerias` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `galerias` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `galerias` table. All the data in the column will be lost.
  - The primary key for the `imagens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `fileUrl` on the `imagens` table. All the data in the column will be lost.
  - You are about to drop the column `galeiraId` on the `imagens` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `imagens` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `imagens` table. All the data in the column will be lost.
  - The primary key for the `inscricoes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `catequizandoId` on the `inscricoes` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `inscricoes` table. All the data in the column will be lost.
  - You are about to drop the column `observacoes` on the `inscricoes` table. All the data in the column will be lost.
  - You are about to drop the column `responsavelId` on the `inscricoes` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `inscricoes` table. All the data in the column will be lost.
  - You are about to drop the column `turmaId` on the `inscricoes` table. All the data in the column will be lost.
  - The primary key for the `inscricoes_catequistas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ComprovanteResidencia` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `DocumentoCpf` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `alergias` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `casadaIgrejaCatolica` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `casado` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `dataBatismo` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `dataNascimento` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `decisaoEm` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `decisaoPorId` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `observacoesAdmin` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `sacramentos` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `inscricoes_catequistas` table. All the data in the column will be lost.
  - The primary key for the `loja_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `descricao` on the `loja_items` table. All the data in the column will be lost.
  - You are about to drop the column `estoque` on the `loja_items` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `loja_items` table. All the data in the column will be lost.
  - You are about to drop the column `imagemUrl` on the `loja_items` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `loja_items` table. All the data in the column will be lost.
  - You are about to drop the column `preco` on the `loja_items` table. All the data in the column will be lost.
  - The primary key for the `materiais` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `descricao` on the `materiais` table. All the data in the column will be lost.
  - You are about to drop the column `fileUrl` on the `materiais` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `materiais` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `materiais` table. All the data in the column will be lost.
  - You are about to drop the column `turmaId` on the `materiais` table. All the data in the column will be lost.
  - The primary key for the `musicas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `autor` on the `musicas` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `musicas` table. All the data in the column will be lost.
  - You are about to drop the column `linkExterno` on the `musicas` table. All the data in the column will be lost.
  - You are about to drop the column `notas` on the `musicas` table. All the data in the column will be lost.
  - You are about to drop the column `titulo` on the `musicas` table. All the data in the column will be lost.
  - The primary key for the `ordem_loja` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `ordem_loja` table. All the data in the column will be lost.
  - You are about to drop the column `pagamentoId` on the `ordem_loja` table. All the data in the column will be lost.
  - You are about to drop the column `responsavelId` on the `ordem_loja` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `ordem_loja` table. All the data in the column will be lost.
  - The primary key for the `pagamentos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dataPagamento` on the `pagamentos` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `pagamentos` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `pagamentos` table. All the data in the column will be lost.
  - You are about to drop the column `metodo` on the `pagamentos` table. All the data in the column will be lost.
  - You are about to drop the column `receiptUrl` on the `pagamentos` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pagamentos` table. All the data in the column will be lost.
  - The primary key for the `pre_matriculas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CertidaoDeNascimento` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `CertificadoBatismo` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `ComprovanteEndereco` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `alergiasProblemasSaude` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `dataNascimento` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `decisaoEm` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `decisaoPorId` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `nomeCatequizando` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `nomePais` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `sacramentosPais` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pre_matriculas` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `pre_matriculas` table. All the data in the column will be lost.
  - The primary key for the `responsaveis` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `responsaveis` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `responsaveis` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `responsaveis` table. All the data in the column will be lost.
  - You are about to drop the column `primeiroAcesso` on the `responsaveis` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `responsaveis` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `responsaveis` table. All the data in the column will be lost.
  - The primary key for the `turmas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `administradorId` on the `turmas` table. All the data in the column will be lost.
  - You are about to drop the column `ano` on the `turmas` table. All the data in the column will be lost.
  - You are about to drop the column `horario` on the `turmas` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `turmas` table. All the data in the column will be lost.
  - You are about to drop the column `nome` on the `turmas` table. All the data in the column will be lost.
  - You are about to drop the column `sala` on the `turmas` table. All the data in the column will be lost.
  - The primary key for the `turmas_catequistas` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoria` on the `turmas_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `catequistaId` on the `turmas_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `turmas_catequistas` table. All the data in the column will be lost.
  - You are about to drop the column `turmaId` on the `turmas_catequistas` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[dsc_email]` on the table `administrador` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dsc_email]` on the table `catequistas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cod_catequizando,dsc_tipo]` on the table `catequizando_documentos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cod_catequizando,cod_turma]` on the table `inscricoes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dsc_email]` on the table `responsaveis` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cod_turma,cod_catequista]` on the table `turmas_catequistas` will be added. If there are existing duplicate values, this will fail.
  - The required column `cod_administrador` was added to the `administrador` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dat_atualizado_em` to the `administrador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_email` to the `administrador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_nome` to the `administrador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_senha` to the `administrador` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_catequista` was added to the `catequistas` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_email` to the `catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_nome` to the `catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_senha` to the `catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_catequizando` to the `catequizando_documentos` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_documento` was added to the `catequizando_documentos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_tipo` to the `catequizando_documentos` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_catequizando` was added to the `catequizandos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `cod_responsavel` to the `catequizandos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dat_nascimento` to the `catequizandos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_nome` to the `catequizandos` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_documento` was added to the `documentos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_file_url` to the `documentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_titulo` to the `documentos` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_evento` was added to the `eventos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_titulo` to the `eventos` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `tipo` on the `eventos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - The required column `cod_galeria` was added to the `galerias` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_titulo` to the `galerias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_galeria` to the `imagens` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_imagem` was added to the `imagens` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_file_url` to the `imagens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_catequizando` to the `inscricoes` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_inscricao` was added to the `inscricoes` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `cod_responsavel` to the `inscricoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_turma` to the `inscricoes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_status` to the `inscricoes` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_inscricao_catequista` was added to the `inscricoes_catequistas` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dat_nascimento` to the `inscricoes_catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_casado` to the `inscricoes_catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_email` to the `inscricoes_catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_nome` to the `inscricoes_catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_status` to the `inscricoes_catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_telefone` to the `inscricoes_catequistas` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_loja_item` was added to the `loja_items` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_nome` to the `loja_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qtd_estoque` to the `loja_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vlr_preco` to the `loja_items` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_material` was added to the `materiais` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_file_url` to the `materiais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_titulo` to the `materiais` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_musica` was added to the `musicas` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_titulo` to the `musicas` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_ordem_loja` was added to the `ordem_loja` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `cod_responsavel` to the `ordem_loja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vlr_total` to the `ordem_loja` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_pagamento` was added to the `pagamentos` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `cod_pre_matricula` was added to the `pre_matriculas` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dat_nascimento` to the `pre_matriculas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_email` to the `pre_matriculas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_nome_catequizando` to the `pre_matriculas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_nome_pais` to the `pre_matriculas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_status` to the `pre_matriculas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_telefone` to the `pre_matriculas` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_responsavel` was added to the `responsaveis` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_email` to the `responsaveis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_nome` to the `responsaveis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dsc_senha` to the `responsaveis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_administrador` to the `turmas` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_turma` was added to the `turmas` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_nome` to the `turmas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_ano` to the `turmas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_catequista` to the `turmas_catequistas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cod_turma` to the `turmas_catequistas` table without a default value. This is not possible if the table is not empty.
  - The required column `cod_turma_catequista` was added to the `turmas_catequistas` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `dsc_categoria` to the `turmas_catequistas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ItensOrdem" DROP CONSTRAINT "_ItensOrdem_A_fkey";

-- DropForeignKey
ALTER TABLE "_ItensOrdem" DROP CONSTRAINT "_ItensOrdem_B_fkey";

-- DropForeignKey
ALTER TABLE "catequizando_documentos" DROP CONSTRAINT "catequizando_documentos_catequizandoId_fkey";

-- DropForeignKey
ALTER TABLE "catequizandos" DROP CONSTRAINT "catequizandos_responsavelId_fkey";

-- DropForeignKey
ALTER TABLE "catequizandos" DROP CONSTRAINT "catequizandos_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "eventos" DROP CONSTRAINT "eventos_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "imagens" DROP CONSTRAINT "imagens_galeiraId_fkey";

-- DropForeignKey
ALTER TABLE "inscricoes" DROP CONSTRAINT "inscricoes_catequizandoId_fkey";

-- DropForeignKey
ALTER TABLE "inscricoes" DROP CONSTRAINT "inscricoes_responsavelId_fkey";

-- DropForeignKey
ALTER TABLE "inscricoes" DROP CONSTRAINT "inscricoes_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "inscricoes_catequistas" DROP CONSTRAINT "inscricoes_catequistas_decisaoPorId_fkey";

-- DropForeignKey
ALTER TABLE "materiais" DROP CONSTRAINT "materiais_turmaId_fkey";

-- DropForeignKey
ALTER TABLE "pagamentos" DROP CONSTRAINT "pagamentos_inscricaoId_fkey";

-- DropForeignKey
ALTER TABLE "pagamentos" DROP CONSTRAINT "pagamentos_responsavelId_fkey";

-- DropForeignKey
ALTER TABLE "pre_matriculas" DROP CONSTRAINT "pre_matriculas_decisaoPorId_fkey";

-- DropForeignKey
ALTER TABLE "turmas" DROP CONSTRAINT "turmas_administradorId_fkey";

-- DropForeignKey
ALTER TABLE "turmas_catequistas" DROP CONSTRAINT "turmas_catequistas_catequistaId_fkey";

-- DropForeignKey
ALTER TABLE "turmas_catequistas" DROP CONSTRAINT "turmas_catequistas_turmaId_fkey";

-- DropIndex
DROP INDEX "administrador_email_key";

-- DropIndex
DROP INDEX "catequistas_email_key";

-- DropIndex
DROP INDEX "catequizando_documentos_catequizandoId_tipo_key";

-- DropIndex
DROP INDEX "inscricoes_catequizandoId_turmaId_key";

-- DropIndex
DROP INDEX "responsaveis_email_key";

-- DropIndex
DROP INDEX "turmas_catequistas_turmaId_catequistaId_key";

-- AlterTable
ALTER TABLE "administrador" DROP CONSTRAINT "administrador_pkey",
DROP COLUMN "criadoEm",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "nome",
DROP COLUMN "primeiroAcesso",
DROP COLUMN "senha",
DROP COLUMN "telefone",
DROP COLUMN "updatedAt",
ADD COLUMN     "cod_administrador" TEXT NOT NULL,
ADD COLUMN     "dat_atualizado_em" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dat_criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dsc_email" TEXT NOT NULL,
ADD COLUMN     "dsc_nome" TEXT NOT NULL,
ADD COLUMN     "dsc_senha" TEXT NOT NULL,
ADD COLUMN     "dsc_telefone" TEXT,
ADD COLUMN     "ind_primeiro_acesso" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "administrador_pkey" PRIMARY KEY ("cod_administrador");

-- AlterTable
ALTER TABLE "catequistas" DROP CONSTRAINT "catequistas_pkey",
DROP COLUMN "bio",
DROP COLUMN "email",
DROP COLUMN "endereco",
DROP COLUMN "id",
DROP COLUMN "nome",
DROP COLUMN "senha",
DROP COLUMN "telefone",
ADD COLUMN     "cod_catequista" TEXT NOT NULL,
ADD COLUMN     "dsc_bio" TEXT,
ADD COLUMN     "dsc_email" TEXT NOT NULL,
ADD COLUMN     "dsc_endereco" TEXT,
ADD COLUMN     "dsc_nome" TEXT NOT NULL,
ADD COLUMN     "dsc_senha" TEXT NOT NULL,
ADD COLUMN     "dsc_telefone" TEXT,
ADD CONSTRAINT "catequistas_pkey" PRIMARY KEY ("cod_catequista");

-- AlterTable
ALTER TABLE "catequizando_documentos" DROP CONSTRAINT "catequizando_documentos_pkey",
DROP COLUMN "catequizandoId",
DROP COLUMN "fileUrl",
DROP COLUMN "id",
DROP COLUMN "tipo",
DROP COLUMN "uploadDate",
ADD COLUMN     "cod_catequizando" TEXT NOT NULL,
ADD COLUMN     "cod_documento" TEXT NOT NULL,
ADD COLUMN     "dat_upload" TIMESTAMP(3),
ADD COLUMN     "dsc_file_url" TEXT,
ADD COLUMN     "dsc_tipo" TEXT NOT NULL,
ADD CONSTRAINT "catequizando_documentos_pkey" PRIMARY KEY ("cod_documento");

-- AlterTable
ALTER TABLE "catequizandos" DROP CONSTRAINT "catequizandos_pkey",
DROP COLUMN "cpf",
DROP COLUMN "dataBatismo",
DROP COLUMN "dataNascimento",
DROP COLUMN "email",
DROP COLUMN "endereco",
DROP COLUMN "id",
DROP COLUMN "nome",
DROP COLUMN "observacoes",
DROP COLUMN "responsavelId",
DROP COLUMN "telefone",
DROP COLUMN "turmaId",
ADD COLUMN     "cod_catequizando" TEXT NOT NULL,
ADD COLUMN     "cod_responsavel" TEXT NOT NULL,
ADD COLUMN     "cod_turma" TEXT,
ADD COLUMN     "dat_batismo" TIMESTAMP(3),
ADD COLUMN     "dat_nascimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dsc_cpf" TEXT,
ADD COLUMN     "dsc_email" TEXT,
ADD COLUMN     "dsc_endereco" TEXT,
ADD COLUMN     "dsc_nome" TEXT NOT NULL,
ADD COLUMN     "dsc_observacoes" TEXT,
ADD COLUMN     "dsc_telefone" TEXT,
ADD CONSTRAINT "catequizandos_pkey" PRIMARY KEY ("cod_catequizando");

-- AlterTable
ALTER TABLE "documentos" DROP CONSTRAINT "documentos_pkey",
DROP COLUMN "descricao",
DROP COLUMN "fileUrl",
DROP COLUMN "id",
DROP COLUMN "titulo",
DROP COLUMN "turmaId",
ADD COLUMN     "cod_documento" TEXT NOT NULL,
ADD COLUMN     "cod_turma" TEXT,
ADD COLUMN     "dsc_descricao" TEXT,
ADD COLUMN     "dsc_file_url" TEXT NOT NULL,
ADD COLUMN     "dsc_titulo" TEXT NOT NULL,
ADD CONSTRAINT "documentos_pkey" PRIMARY KEY ("cod_documento");

-- AlterTable
ALTER TABLE "eventos" DROP CONSTRAINT "eventos_pkey",
DROP COLUMN "descricao",
DROP COLUMN "id",
DROP COLUMN "titulo",
DROP COLUMN "turmaId",
ADD COLUMN     "cod_evento" TEXT NOT NULL,
ADD COLUMN     "cod_turma" TEXT,
ADD COLUMN     "dsc_descricao" TEXT,
ADD COLUMN     "dsc_titulo" TEXT NOT NULL,
DROP COLUMN "tipo",
ADD COLUMN     "tipo" TEXT NOT NULL,
ADD CONSTRAINT "eventos_pkey" PRIMARY KEY ("cod_evento");

-- AlterTable
ALTER TABLE "galerias" DROP CONSTRAINT "galerias_pkey",
DROP COLUMN "descricao",
DROP COLUMN "id",
DROP COLUMN "titulo",
ADD COLUMN     "cod_galeria" TEXT NOT NULL,
ADD COLUMN     "dsc_descricao" TEXT,
ADD COLUMN     "dsc_titulo" TEXT NOT NULL,
ADD CONSTRAINT "galerias_pkey" PRIMARY KEY ("cod_galeria");

-- AlterTable
ALTER TABLE "imagens" DROP CONSTRAINT "imagens_pkey",
DROP COLUMN "fileUrl",
DROP COLUMN "galeiraId",
DROP COLUMN "id",
DROP COLUMN "titulo",
ADD COLUMN     "cod_galeria" TEXT NOT NULL,
ADD COLUMN     "cod_imagem" TEXT NOT NULL,
ADD COLUMN     "dsc_file_url" TEXT NOT NULL,
ADD COLUMN     "dsc_titulo" TEXT,
ADD CONSTRAINT "imagens_pkey" PRIMARY KEY ("cod_imagem");

-- AlterTable
ALTER TABLE "inscricoes" DROP CONSTRAINT "inscricoes_pkey",
DROP COLUMN "catequizandoId",
DROP COLUMN "id",
DROP COLUMN "observacoes",
DROP COLUMN "responsavelId",
DROP COLUMN "status",
DROP COLUMN "turmaId",
ADD COLUMN     "cod_catequizando" TEXT NOT NULL,
ADD COLUMN     "cod_inscricao" TEXT NOT NULL,
ADD COLUMN     "cod_responsavel" TEXT NOT NULL,
ADD COLUMN     "cod_turma" TEXT NOT NULL,
ADD COLUMN     "dsc_observacoes" TEXT,
ADD COLUMN     "dsc_status" TEXT NOT NULL,
ADD CONSTRAINT "inscricoes_pkey" PRIMARY KEY ("cod_inscricao");

-- AlterTable
ALTER TABLE "inscricoes_catequistas" DROP CONSTRAINT "inscricoes_catequistas_pkey",
DROP COLUMN "ComprovanteResidencia",
DROP COLUMN "DocumentoCpf",
DROP COLUMN "alergias",
DROP COLUMN "casadaIgrejaCatolica",
DROP COLUMN "casado",
DROP COLUMN "dataBatismo",
DROP COLUMN "dataNascimento",
DROP COLUMN "decisaoEm",
DROP COLUMN "decisaoPorId",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "nome",
DROP COLUMN "observacoesAdmin",
DROP COLUMN "sacramentos",
DROP COLUMN "status",
DROP COLUMN "telefone",
ADD COLUMN     "cod_administrador" TEXT,
ADD COLUMN     "cod_inscricao_catequista" TEXT NOT NULL,
ADD COLUMN     "dat_batismo" TIMESTAMP(3),
ADD COLUMN     "dat_decisao" TIMESTAMP(3),
ADD COLUMN     "dat_nascimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dsc_alergias" TEXT,
ADD COLUMN     "dsc_casada_igreja_catolica" TEXT,
ADD COLUMN     "dsc_casado" TEXT NOT NULL,
ADD COLUMN     "dsc_comprovante_residencia" TEXT,
ADD COLUMN     "dsc_documento_cpf" TEXT,
ADD COLUMN     "dsc_email" TEXT NOT NULL,
ADD COLUMN     "dsc_nome" TEXT NOT NULL,
ADD COLUMN     "dsc_observacoes_admin" TEXT,
ADD COLUMN     "dsc_sacramentos" TEXT,
ADD COLUMN     "dsc_status" TEXT NOT NULL,
ADD COLUMN     "dsc_telefone" TEXT NOT NULL,
ADD CONSTRAINT "inscricoes_catequistas_pkey" PRIMARY KEY ("cod_inscricao_catequista");

-- AlterTable
ALTER TABLE "loja_items" DROP CONSTRAINT "loja_items_pkey",
DROP COLUMN "descricao",
DROP COLUMN "estoque",
DROP COLUMN "id",
DROP COLUMN "imagemUrl",
DROP COLUMN "nome",
DROP COLUMN "preco",
ADD COLUMN     "cod_loja_item" TEXT NOT NULL,
ADD COLUMN     "dsc_descricao" TEXT,
ADD COLUMN     "dsc_imagem_url" TEXT,
ADD COLUMN     "dsc_nome" TEXT NOT NULL,
ADD COLUMN     "qtd_estoque" INTEGER NOT NULL,
ADD COLUMN     "vlr_preco" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "loja_items_pkey" PRIMARY KEY ("cod_loja_item");

-- AlterTable
ALTER TABLE "materiais" DROP CONSTRAINT "materiais_pkey",
DROP COLUMN "descricao",
DROP COLUMN "fileUrl",
DROP COLUMN "id",
DROP COLUMN "titulo",
DROP COLUMN "turmaId",
ADD COLUMN     "cod_material" TEXT NOT NULL,
ADD COLUMN     "cod_turma" TEXT,
ADD COLUMN     "dsc_descricao" TEXT,
ADD COLUMN     "dsc_file_url" TEXT NOT NULL,
ADD COLUMN     "dsc_titulo" TEXT NOT NULL,
ADD CONSTRAINT "materiais_pkey" PRIMARY KEY ("cod_material");

-- AlterTable
ALTER TABLE "musicas" DROP CONSTRAINT "musicas_pkey",
DROP COLUMN "autor",
DROP COLUMN "id",
DROP COLUMN "linkExterno",
DROP COLUMN "notas",
DROP COLUMN "titulo",
ADD COLUMN     "cod_musica" TEXT NOT NULL,
ADD COLUMN     "dsc_autor" TEXT,
ADD COLUMN     "dsc_notas" TEXT,
ADD COLUMN     "dsc_titulo" TEXT NOT NULL,
ADD COLUMN     "txt_link_externo" TEXT,
ADD CONSTRAINT "musicas_pkey" PRIMARY KEY ("cod_musica");

-- AlterTable
ALTER TABLE "ordem_loja" DROP CONSTRAINT "ordem_loja_pkey",
DROP COLUMN "id",
DROP COLUMN "pagamentoId",
DROP COLUMN "responsavelId",
DROP COLUMN "total",
ADD COLUMN     "cod_ordem_loja" TEXT NOT NULL,
ADD COLUMN     "cod_pagamento" TEXT,
ADD COLUMN     "cod_responsavel" TEXT NOT NULL,
ADD COLUMN     "vlr_total" DOUBLE PRECISION NOT NULL,
ADD CONSTRAINT "ordem_loja_pkey" PRIMARY KEY ("cod_ordem_loja");

-- AlterTable
ALTER TABLE "pagamentos" DROP CONSTRAINT "pagamentos_pkey",
DROP COLUMN "dataPagamento",
DROP COLUMN "descricao",
DROP COLUMN "id",
DROP COLUMN "metodo",
DROP COLUMN "receiptUrl",
DROP COLUMN "status",
ADD COLUMN     "cod_pagamento" TEXT NOT NULL,
ADD COLUMN     "dat_pagamento" TIMESTAMP(3),
ADD COLUMN     "dsc_descricao" TEXT,
ADD COLUMN     "dsc_metodo" TEXT,
ADD COLUMN     "dsc_receipt_url" TEXT,
ADD COLUMN     "dsc_status" TEXT,
ADD CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("cod_pagamento");

-- AlterTable
ALTER TABLE "pre_matriculas" DROP CONSTRAINT "pre_matriculas_pkey",
DROP COLUMN "CertidaoDeNascimento",
DROP COLUMN "CertificadoBatismo",
DROP COLUMN "ComprovanteEndereco",
DROP COLUMN "alergiasProblemasSaude",
DROP COLUMN "dataNascimento",
DROP COLUMN "decisaoEm",
DROP COLUMN "decisaoPorId",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "nomeCatequizando",
DROP COLUMN "nomePais",
DROP COLUMN "sacramentosPais",
DROP COLUMN "status",
DROP COLUMN "telefone",
ADD COLUMN     "cod_administrador" TEXT,
ADD COLUMN     "cod_pre_matricula" TEXT NOT NULL,
ADD COLUMN     "dat_decisao" TIMESTAMP(3),
ADD COLUMN     "dat_nascimento" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dsc_alergias_problemas_saude" TEXT,
ADD COLUMN     "dsc_certidao_nascimento" TEXT,
ADD COLUMN     "dsc_certificado_batismo" TEXT,
ADD COLUMN     "dsc_comprovante_endereco" TEXT,
ADD COLUMN     "dsc_email" TEXT NOT NULL,
ADD COLUMN     "dsc_nome_catequizando" TEXT NOT NULL,
ADD COLUMN     "dsc_nome_pais" TEXT NOT NULL,
ADD COLUMN     "dsc_sacramentos_pais" TEXT,
ADD COLUMN     "dsc_status" TEXT NOT NULL,
ADD COLUMN     "dsc_telefone" TEXT NOT NULL,
ADD CONSTRAINT "pre_matriculas_pkey" PRIMARY KEY ("cod_pre_matricula");

-- AlterTable
ALTER TABLE "responsaveis" DROP CONSTRAINT "responsaveis_pkey",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "nome",
DROP COLUMN "primeiroAcesso",
DROP COLUMN "senha",
DROP COLUMN "telefone",
ADD COLUMN     "cod_responsavel" TEXT NOT NULL,
ADD COLUMN     "dsc_email" TEXT NOT NULL,
ADD COLUMN     "dsc_nome" TEXT NOT NULL,
ADD COLUMN     "dsc_senha" TEXT NOT NULL,
ADD COLUMN     "dsc_telefone" TEXT,
ADD COLUMN     "ind_primeiro_acesso" BOOLEAN NOT NULL DEFAULT false,
ADD CONSTRAINT "responsaveis_pkey" PRIMARY KEY ("cod_responsavel");

-- AlterTable
ALTER TABLE "turmas" DROP CONSTRAINT "turmas_pkey",
DROP COLUMN "administradorId",
DROP COLUMN "ano",
DROP COLUMN "horario",
DROP COLUMN "id",
DROP COLUMN "nome",
DROP COLUMN "sala",
ADD COLUMN     "cod_administrador" TEXT NOT NULL,
ADD COLUMN     "cod_turma" TEXT NOT NULL,
ADD COLUMN     "dsc_horario" TEXT,
ADD COLUMN     "dsc_nome" TEXT NOT NULL,
ADD COLUMN     "dsc_sala" TEXT,
ADD COLUMN     "num_ano" INTEGER NOT NULL,
ADD CONSTRAINT "turmas_pkey" PRIMARY KEY ("cod_turma");

-- AlterTable
ALTER TABLE "turmas_catequistas" DROP CONSTRAINT "turmas_catequistas_pkey",
DROP COLUMN "categoria",
DROP COLUMN "catequistaId",
DROP COLUMN "id",
DROP COLUMN "turmaId",
ADD COLUMN     "cod_catequista" TEXT NOT NULL,
ADD COLUMN     "cod_turma" TEXT NOT NULL,
ADD COLUMN     "cod_turma_catequista" TEXT NOT NULL,
ADD COLUMN     "dsc_categoria" TEXT NOT NULL,
ADD CONSTRAINT "turmas_catequistas_pkey" PRIMARY KEY ("cod_turma_catequista");

-- DropEnum
DROP TYPE "CategoriaCatequistaTurma";

-- DropEnum
DROP TYPE "InscricaoCatequistaStatus";

-- DropEnum
DROP TYPE "InscricaoStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PreMatriculaStatus";

-- DropEnum
DROP TYPE "TipoDocumentoCatequizando";

-- DropEnum
DROP TYPE "TipoEvento";

-- CreateIndex
CREATE UNIQUE INDEX "administrador_dsc_email_key" ON "administrador"("dsc_email");

-- CreateIndex
CREATE UNIQUE INDEX "catequistas_dsc_email_key" ON "catequistas"("dsc_email");

-- CreateIndex
CREATE UNIQUE INDEX "catequizando_documentos_cod_catequizando_dsc_tipo_key" ON "catequizando_documentos"("cod_catequizando", "dsc_tipo");

-- CreateIndex
CREATE UNIQUE INDEX "inscricoes_cod_catequizando_cod_turma_key" ON "inscricoes"("cod_catequizando", "cod_turma");

-- CreateIndex
CREATE UNIQUE INDEX "responsaveis_dsc_email_key" ON "responsaveis"("dsc_email");

-- CreateIndex
CREATE UNIQUE INDEX "turmas_catequistas_cod_turma_cod_catequista_key" ON "turmas_catequistas"("cod_turma", "cod_catequista");

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
