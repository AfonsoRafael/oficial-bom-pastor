CREATE TABLE mensagem (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    remetente_id BIGINT NOT NULL,

    destinatario_id BIGINT NOT NULL,

    texto TEXT NOT NULL,

    lida BOOLEAN DEFAULT FALSE,

    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_msg_remetente
        FOREIGN KEY (remetente_id)
        REFERENCES usuario(id),

    CONSTRAINT fk_msg_destinatario
        FOREIGN KEY (destinatario_id)
        REFERENCES usuario(id)
);

CREATE TABLE comunicado (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    usuario_id BIGINT NOT NULL,

    turma_id BIGINT NULL,

    tipo_comunicado VARCHAR(20) NOT NULL,

    titulo VARCHAR(200) NOT NULL,

    conteudo TEXT NOT NULL,

    data_publicacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_comunicado_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id),

    CONSTRAINT fk_comunicado_turma
        FOREIGN KEY (turma_id)
        REFERENCES turma(id),

    CONSTRAINT chk_tipo_comunicado
        CHECK (tipo_comunicado IN ('GERAL','TURMA'))
);

CREATE TABLE evento (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    turma_id BIGINT NULL,

    titulo VARCHAR(200) NOT NULL,

    descricao TEXT,

    data_evento DATETIME NOT NULL,

    local VARCHAR(150),

    obrigatorio BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_evento_turma
        FOREIGN KEY (turma_id)
        REFERENCES turma(id)
);

CREATE TABLE participacao_evento (
    evento_id BIGINT NOT NULL,

    catequizando_id BIGINT NOT NULL,

    presente BOOLEAN DEFAULT FALSE,

    PRIMARY KEY (evento_id, catequizando_id),

    CONSTRAINT fk_pe_evento
        FOREIGN KEY (evento_id)
        REFERENCES evento(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_pe_catequizando
        FOREIGN KEY (catequizando_id)
        REFERENCES catequizando(id)
        ON DELETE CASCADE
);