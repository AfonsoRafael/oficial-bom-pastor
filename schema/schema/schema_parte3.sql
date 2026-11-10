CREATE TABLE frequencia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    catequizando_id BIGINT NOT NULL,

    encontro_id BIGINT NOT NULL,

    status VARCHAR(30) NOT NULL,

    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_freq_catequizando
        FOREIGN KEY (catequizando_id)
        REFERENCES catequizando(id),

    CONSTRAINT fk_freq_encontro
        FOREIGN KEY (encontro_id)
        REFERENCES encontro_catequetico(id),

    CONSTRAINT uk_frequencia
        UNIQUE (catequizando_id, encontro_id)
);

CREATE TABLE justificativa (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    frequencia_id BIGINT NOT NULL,

    motivo TEXT NOT NULL,

    arquivo_comprovante VARCHAR(255),

    analise TEXT,

    status VARCHAR(30) DEFAULT 'PENDENTE',

    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_justificativa_frequencia
        FOREIGN KEY (frequencia_id)
        REFERENCES frequencia(id)
        ON DELETE CASCADE
);

CREATE TABLE reposicao (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    data DATE NOT NULL,

    local VARCHAR(150),

    observacao TEXT
);

CREATE TABLE catequizando_reposicao (
    catequizando_id BIGINT NOT NULL,

    reposicao_id BIGINT NOT NULL,

    PRIMARY KEY (catequizando_id, reposicao_id),

    CONSTRAINT fk_cr_catequizando
        FOREIGN KEY (catequizando_id)
        REFERENCES catequizando(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cr_reposicao
        FOREIGN KEY (reposicao_id)
        REFERENCES reposicao(id)
        ON DELETE CASCADE
);