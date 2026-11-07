CREATE TABLE conteudo_catequetico (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    titulo VARCHAR(200) NOT NULL,

    descricao TEXT,

    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE etapa_conteudo (
    etapa_id BIGINT NOT NULL,
    conteudo_id BIGINT NOT NULL,

    PRIMARY KEY (etapa_id, conteudo_id),

    CONSTRAINT fk_ec_etapa
        FOREIGN KEY (etapa_id)
        REFERENCES etapa_catequetica(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_ec_conteudo
        FOREIGN KEY (conteudo_id)
        REFERENCES conteudo_catequetico(id)
        ON DELETE CASCADE
);

CREATE TABLE material_apoio (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    conteudo_id BIGINT NOT NULL,

    titulo VARCHAR(150) NOT NULL,

    categoria VARCHAR(100),

    arquivo VARCHAR(255),

    CONSTRAINT fk_material_conteudo
        FOREIGN KEY (conteudo_id)
        REFERENCES conteudo_catequetico(id)
        ON DELETE CASCADE
);

CREATE TABLE disponibilizacao_conteudo (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    conteudo_id BIGINT NOT NULL,

    catequista_id BIGINT NOT NULL,

    usuario_liberador_id BIGINT NOT NULL,

    data_disponibilizacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    ativo BOOLEAN DEFAULT TRUE,

    observacao TEXT,

    CONSTRAINT fk_disp_conteudo
        FOREIGN KEY (conteudo_id)
        REFERENCES conteudo_catequetico(id),

    CONSTRAINT fk_disp_catequista
        FOREIGN KEY (catequista_id)
        REFERENCES catequista(id),

    CONSTRAINT fk_disp_usuario
        FOREIGN KEY (usuario_liberador_id)
        REFERENCES usuario(id)
);

CREATE TABLE encontro_catequetico (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    turma_id BIGINT NOT NULL,

    conteudo_id BIGINT NOT NULL,

    data DATE NOT NULL,

    tema VARCHAR(200),

    observacoes TEXT,

    CONSTRAINT fk_encontro_turma
        FOREIGN KEY (turma_id)
        REFERENCES turma(id),

    CONSTRAINT fk_encontro_conteudo
        FOREIGN KEY (conteudo_id)
        REFERENCES conteudo_catequetico(id)
);

