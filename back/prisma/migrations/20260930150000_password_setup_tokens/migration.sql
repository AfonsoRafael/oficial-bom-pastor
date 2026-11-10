CREATE TYPE "PasswordSetupProfile" AS ENUM ('ADMINISTRADOR', 'CATEQUISTA', 'RESPONSAVEL');

CREATE TABLE "password_setup_tokens" (
    "cod_password_setup_token" TEXT NOT NULL,
    "dsc_profile_type" "PasswordSetupProfile" NOT NULL,
    "cod_profile" TEXT NOT NULL,
    "dsc_email" TEXT NOT NULL,
    "dsc_token_hash" TEXT NOT NULL,
    "dat_expires_at" TIMESTAMP(3) NOT NULL,
    "dat_used_at" TIMESTAMP(3),
    "dat_created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_setup_tokens_pkey" PRIMARY KEY ("cod_password_setup_token")
);

CREATE UNIQUE INDEX "password_setup_tokens_dsc_token_hash_key"
ON "password_setup_tokens"("dsc_token_hash");

CREATE INDEX "password_setup_tokens_dsc_profile_type_cod_profile_idx"
ON "password_setup_tokens"("dsc_profile_type", "cod_profile");

CREATE INDEX "password_setup_tokens_dat_expires_at_idx"
ON "password_setup_tokens"("dat_expires_at");