CREATE DATABASE IF NOT EXISTS catequese_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE catequese_db;

CREATE TABLE usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME
);

CREATE TABLE perfil (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao VARCHAR(255)
);

CREATE TABLE usuario_perfil (
    usuario_id BIGINT NOT NULL,
    perfil_id BIGINT NOT NULL,

    PRIMARY KEY(usuario_id, perfil_id),

    CONSTRAINT fk_usuario_perfil_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_usuario_perfil_perfil
        FOREIGN KEY (perfil_id)
        REFERENCES perfil(id)
        ON DELETE CASCADE
);

CREATE TABLE responsavel (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id BIGINT NOT NULL UNIQUE,

    cpf VARCHAR(14) NOT NULL,
    parentesco VARCHAR(50),

    CONSTRAINT fk_responsavel_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE
);

CREATE TABLE catequista (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id BIGINT NOT NULL UNIQUE,

    formacao VARCHAR(150),

    data_ingresso DATE,

    CONSTRAINT fk_catequista_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE
);

CREATE TABLE matricula (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    data_solicitacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    status VARCHAR(30) NOT NULL,

    observacao TEXT,

    data_aprovacao DATETIME
);

CREATE TABLE documento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    matricula_id BIGINT NOT NULL,

    nome_arquivo VARCHAR(255) NOT NULL,

    tipo_documento VARCHAR(100) NOT NULL,

    status VARCHAR(30) NOT NULL,

    parecer TEXT,

    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_documento_matricula
        FOREIGN KEY (matricula_id)
        REFERENCES matricula(id)
        ON DELETE CASCADE
);

CREATE TABLE etapa_catequetica (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(150) NOT NULL,

    descricao TEXT,

    ordem INT NOT NULL,

    ativa BOOLEAN DEFAULT TRUE
);

CREATE TABLE turma (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    etapa_id BIGINT NOT NULL,

    nome VARCHAR(150) NOT NULL,

    ano INT NOT NULL,

    horario VARCHAR(50),

    local VARCHAR(150),

    ativa BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_turma_etapa
        FOREIGN KEY (etapa_id)
        REFERENCES etapa_catequetica(id)
);

CREATE TABLE turma_catequista (
    turma_id BIGINT NOT NULL,

    catequista_id BIGINT NOT NULL,

    PRIMARY KEY(turma_id, catequista_id),

    CONSTRAINT fk_tc_turma
        FOREIGN KEY (turma_id)
        REFERENCES turma(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tc_catequista
        FOREIGN KEY (catequista_id)
        REFERENCES catequista(id)
        ON DELETE CASCADE
);

CREATE TABLE catequizando (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    matricula_id BIGINT UNIQUE,

    responsavel_id BIGINT NOT NULL,

    turma_id BIGINT,

    nome VARCHAR(150) NOT NULL,

    data_nascimento DATE NOT NULL,

    sexo VARCHAR(20),

    endereco TEXT,

    telefone_emergencia VARCHAR(20),

    situacao VARCHAR(50),

    data_ingresso DATE,

    CONSTRAINT fk_catequizando_matricula
        FOREIGN KEY (matricula_id)
        REFERENCES matricula(id),

    CONSTRAINT fk_catequizando_responsavel
        FOREIGN KEY (responsavel_id)
        REFERENCES responsavel(id),

    CONSTRAINT fk_catequizando_turma
        FOREIGN KEY (turma_id)
        REFERENCES turma(id)
);

CREATE TABLE sacramento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    catequizando_id BIGINT NOT NULL,

    tipo VARCHAR(50) NOT NULL,

    data_recebimento DATE,

    paroquia VARCHAR(150),

    comprovante VARCHAR(255),

    CONSTRAINT fk_sacramento_catequizando
        FOREIGN KEY (catequizando_id)
        REFERENCES catequizando(id)
        ON DELETE CASCADE
);

INSERT INTO perfil (nome, descricao)
VALUES
('RESPONSAVEL', 'Responsável pelo catequizando'),
('CATEQUISTA', 'Catequista da turma'),
('COORDENADOR', 'Coordenador da catequese'),
('SECRETARIA', 'Equipe administrativa');