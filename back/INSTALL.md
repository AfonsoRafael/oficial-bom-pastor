# 🚀 Guia Rápido de Instalação

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Banco de Dados

### Opção A: Docker (Recomendado)

```bash
docker-compose up -d
```

Isso criará:
- PostgreSQL na porta 5432
- PgAdmin na porta 5050 (opcional)

### Opção B: PostgreSQL Local

1. Instale o PostgreSQL
2. Crie um banco de dados:
```sql
CREATE DATABASE catequese_db;
CREATE USER catequese_user WITH PASSWORD 'senha_forte';
GRANT ALL PRIVILEGES ON DATABASE catequese_db TO catequese_user;
```

## Passo 3: Configurar Variáveis de Ambiente

Copie o `.env.example` para `.env`:

```bash
cp .env.example .env
```

**Windows PowerShell:**
```powershell
Copy-Item .env.example .env
```

Edite o `.env` com suas configurações.

## Passo 4: Executar Migrations

```bash
npx prisma migrate dev
```

## Passo 5: (Opcional) Seed de Dados

```bash
npm run prisma:seed
```

Isso criará usuários de teste:
- **Admin**: admin@catequese.com / admin123
- **Responsável**: pai@catequese.com / parent123

## Passo 6: Iniciar o Servidor

```bash
npm run start:dev
```

Acesse:
- API: http://localhost:3000/api
- Docs: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/health

## 🧪 Testar a API

### Registrar novo usuário

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "nome": "Teste",
    "senha": "senha123"
  }'
```

### Fazer login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@catequese.com",
    "senha": "admin123"
  }'
```

Copie o `accessToken` retornado.

### Listar turmas (autenticado)

```bash
curl -X GET http://localhost:3000/api/turmas \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

## 🔧 Comandos Úteis

```bash
# Gerar Prisma Client
npx prisma generate

# Ver banco de dados (GUI)
npx prisma studio

# Executar testes
npm test

# Executar testes E2E
npm run test:e2e

# Build para produção
npm run build

# Executar em produção
npm run start:prod
```

## ❓ Problemas Comuns

### Erro de conexão com banco de dados

Verifique:
1. PostgreSQL está rodando
2. `DATABASE_URL` no `.env` está correta
3. Credenciais estão corretas

### Porta 3000 já em uso

Mude no `.env`:
```env
PORT=3001
```

### Prisma não gera o client

```bash
npx prisma generate
```

## 📚 Próximos Passos

1. Explore a documentação Swagger: http://localhost:3000/api/docs
2. Teste as rotas de autenticação
3. Crie turmas, catequizandos e responsáveis
4. Configure upload de arquivos (S3/R2)
5. Configure envio de emails (Resend/SendGrid)

## 🆘 Suporte

Se encontrar problemas, verifique:
1. Logs do servidor
2. Status do banco de dados: http://localhost:3000/api/health/db
3. README.md para mais detalhes
