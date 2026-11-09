# Catequese Bom Pastor - Backend API

Backend em NestJS para plataforma de gestão catequética.

## 📋 Requisitos

- Node.js 18+ (LTS)
- PostgreSQL 14+
- npm ou yarn

## 🚀 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure as variáveis:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/catequese_db
JWT_SECRET=seu_secret_aqui
JWT_REFRESH_SECRET=seu_refresh_secret_aqui
# ... outras variáveis
```

### 3. Configurar banco de dados

#### Opção A: Usar Docker (Recomendado para desenvolvimento)

```bash
docker-compose up -d
```

#### Opção B: PostgreSQL local

Crie um banco de dados PostgreSQL e configure a `DATABASE_URL` no `.env`.

### 4. Executar migrations

```bash
npx prisma migrate dev
```

### 5. (Opcional) Seed de dados iniciais

```bash
npm run prisma:seed
```

### 6. Iniciar o servidor

#### Desenvolvimento

```bash
npm run start:dev
```

#### Produção

```bash
npm run build
npm run start:prod
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:

- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Registrar novo usuário

```bash
POST /api/auth/register
{
  "email": "usuario@example.com",
  "nome": "Nome do Usuário",
  "senha": "senha123",
  "role": "RESPONSAVEL" // ou "ADMINISTRADOR"
}
```

### Login

```bash
POST /api/auth/login
{
  "email": "usuario@example.com",
  "senha": "senha123"
}
```

Retorna:
```json
{
  "user": { "id": "...", "email": "...", "role": "..." },
  "accessToken": "...",
  "refreshToken": "..."
}
```

### Usar token nas requisições

Adicione o header:
```
Authorization: Bearer {accessToken}
```

## 👥 Tipos de Usuário

- **ADMINISTRADOR**: Acesso total ao sistema
- **RESPONSAVEL**: Acesso aos próprios catequizandos, inscrições, pagamentos

## 📦 Módulos Principais

### Auth
- Registro, login, refresh token
- Reset de senha
- Perfil do usuário

### Turmas
- CRUD de turmas
- Listar catequizandos

### Catequizandos
- CRUD de catequizandos
- Relacionamento com turmas e responsáveis

### Inscrições
- Submeter inscrições
- Workflow de aprovação (SUBMITTED → APPROVED/REJECTED)
- Upload de documentos

### Pagamentos
- Registrar pagamentos
- Múltiplos métodos (PIX, Cartão, Dinheiro, Transferência)
- Relatórios financeiros

### Materiais e Documentos
- Upload de arquivos
- Controle de visibilidade
- Presigned URLs S3

### Cronograma e Calendário
- Eventos de turma e gerais
- Filtros por data

### Galeria
- Álbuns de fotos
- Upload de imagens

### Músicas
- Cadastro de músicas
- Links externos (YouTube, etc)

### Loja
- Itens à venda
- Ordens de compra
- Controle de estoque

### Dashboard
- Dashboards específicos por tipo de usuário
- Estatísticas e métricas

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Scripts Úteis

```bash
# Gerar cliente Prisma
npm run prisma:generate

# Criar nova migration
npm run prisma:migrate

# Aplicar migrations em produção
npm run prisma:deploy

# Prisma Studio (GUI)
npm run prisma:studio

# Seed de dados
npm run prisma:seed

# Build
npm run build

# Lint
npm run lint

# Format
npm run format
```

## 🐳 Docker

### Build da imagem

```bash
docker build -t catequese-backend .
```

### Run com docker-compose

```bash
docker-compose up -d
```

## 🔧 Variáveis de Ambiente

### Obrigatórias

- `DATABASE_URL`: String de conexão PostgreSQL
- `JWT_SECRET`: Secret para access tokens
- `JWT_REFRESH_SECRET`: Secret para refresh tokens

### Opcionais

- `PORT`: Porta do servidor (padrão: 3000)
- `NODE_ENV`: Ambiente (development|production)
- `JWT_EXPIRATION`: Expiração do access token (padrão: 15m)
- `JWT_REFRESH_EXPIRATION`: Expiração do refresh token (padrão: 7d)
- `FRONTEND_URL`: URL do frontend para CORS

### Convites e criação de senha

As aprovações de pré-matrícula e inscrição de catequista enviam um link para criação de senha. Configure no `.env` do backend um servidor SMTP válido (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` e `SMTP_FROM`). Sem SMTP, a aprovação fica registrada, a tela administrativa informa que o e-mail não foi enviado e permite reenviar o convite após corrigir a configuração.

Os links expiram em 24 horas e só podem ser usados uma vez. A senha deve ter ao menos 12 caracteres, com letras maiúsculas e minúsculas, número e símbolo.
- `S3_*`: Configurações de upload S3/R2
- `RESEND_API_KEY`: API key para envio de emails
- `STRIPE_API_KEY`: API key do Stripe (pagamentos)

## 📖 Estrutura de Pastas

```
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   └── prisma/
├── modules/
│   ├── auth/
│   ├── turmas/
│   ├── catequizandos/
│   ├── responsaveis/
│   ├── inscricoes/
│   ├── pagamentos/
│   ├── materiais/
│   ├── documentos/
│   ├── cronograma/
│   ├── calendario/
│   ├── galeria/
│   ├── musicas/
│   ├── loja/
│   ├── uploads/
│   ├── dashboard/
│   └── health/
├── app.module.ts
└── main.ts
```

## 🛡️ Segurança

- ✅ Senhas com bcrypt (10 rounds)
- ✅ JWT com expiração
- ✅ CORS configurado
- ✅ Helmet para headers de segurança
- ✅ Rate limiting
- ✅ Validação de inputs (class-validator)
- ✅ HTTPS em produção
- ✅ Variáveis sensíveis via .env

## 📊 Health Checks

```bash
# Basic health
GET /api/health

# Database health
GET /api/health/db
```

## 🚀 Deploy

### Railway

1. Configure as variáveis de ambiente
2. Conecte o repositório
3. Railway detectará automaticamente o Dockerfile

### Render

1. Crie um novo Web Service
2. Configure as variáveis de ambiente
3. Configure o build command: `npm install && npx prisma generate && npm run build`
4. Configure o start command: `npm run prisma:deploy && npm run start:prod`

### Heroku

```bash
heroku create catequese-backend
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run prisma:deploy
```

## 📄 Licença

MIT

## 👨‍💻 Autor

Catequese Bom Pastor

## 🆘 Suporte

Para dúvidas ou problemas, abra uma issue no GitHub.
