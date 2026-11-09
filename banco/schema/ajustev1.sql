-- usuario: contas existentes presumem senha já definida.
-- O backend deve informar TRUE ao criar uma conta que ainda exige primeiro acesso.
ALTER TABLE usuario
    ADD COLUMN primeiro_acesso BOOLEAN NOT NULL DEFAULT FALSE;


-- Solicitação de primeiro acesso: token armazenado somente como hash.
CREATE TABLE password_setup_token (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expira_em DATETIME NOT NULL,
    usado_em DATETIME NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    tipo ENUM('PRIMEIRO_ACESSO','RESET_SENHA'),

    CONSTRAINT uk_password_setup_token_hash
        UNIQUE (token_hash),

    CONSTRAINT fk_password_setup_token_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id)
        ON DELETE CASCADE,

    INDEX idx_password_setup_token_usuario_expira (usuario_id, expira_em)
) ENGINE=InnoDB;


-- Matrícula: dados necessários durante a análise, antes de criar
-- a conta do responsável e o cadastro definitivo do catequizando.
ALTER TABLE matricula
    ADD COLUMN responsavel_id BIGINT NULL,
    ADD COLUMN responsavel_nome VARCHAR(150) NOT NULL,
    ADD COLUMN responsavel_cpf VARCHAR(14) NOT NULL,
    ADD COLUMN responsavel_parentesco VARCHAR(50) NOT NULL,
    ADD COLUMN responsavel_data_nascimento DATE NOT NULL,
    ADD COLUMN responsavel_telefone VARCHAR(20) NOT NULL,
    ADD COLUMN responsavel_whatsapp VARCHAR(20) NOT NULL,
    ADD COLUMN responsavel_email VARCHAR(150) NOT NULL,
    ADD COLUMN catequizando_nome VARCHAR(150) NOT NULL,
    ADD COLUMN catequizando_data_nascimento DATE NOT NULL,
    ADD COLUMN catequizando_endereco TEXT NOT NULL,
    ADD COLUMN catequizando_telefone_emergencia VARCHAR(20) NOT NULL,
    ADD COLUMN etapa_id BIGINT NOT NULL,
    ADD CONSTRAINT fk_matricula_responsavel
        FOREIGN KEY (responsavel_id)
        REFERENCES responsavel(id)
        ON DELETE SET NULL,
    ADD CONSTRAINT fk_matricula_etapa
        FOREIGN KEY (etapa_id)
        REFERENCES etapa_catequetica(id);


-- Histórico imutável das decisões da Secretaria e do Coordenador.
CREATE TABLE matricula_decisao (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    matricula_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    etapa VARCHAR(20) NOT NULL,
    resultado VARCHAR(30) NOT NULL,
    parecer TEXT NULL,
    decidido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_matricula_decisao_matricula
        FOREIGN KEY (matricula_id)
        REFERENCES matricula(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matricula_decisao_usuario
        FOREIGN KEY (usuario_id)
        REFERENCES usuario(id),

    INDEX idx_matricula_decisao_matricula_data (matricula_id, decidido_em),
    INDEX idx_matricula_decisao_usuario (usuario_id)
) ENGINE=InnoDB;