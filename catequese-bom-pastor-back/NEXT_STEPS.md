# 🎯 Próximos Passos - Como Usar o Backend

## ✅ O que foi criado

Um backend completo em NestJS com:

- ✅ Autenticação JWT (access + refresh tokens)
- ✅ Tipos de usuário (ADMINISTRADOR, RESPONSAVEL)
- ✅ Módulos completos:
  - Auth (registro, login, reset senha)
  - Users (CRUD com RBAC)
  - Turmas (com administrador)
  - Catequizandos (com responsáveis)
  - Responsáveis
  - Inscrições (workflow de aprovação)
  - Pagamentos (com relatórios)
  - Materiais, Documentos, Cronograma, Calendário
  - Galeria, Músicas, Loja
  - Uploads, Dashboard, Health Check
- ✅ Prisma ORM com PostgreSQL
- ✅ Swagger/OpenAPI docs
- ✅ Segurança (Helmet, CORS, Rate Limiting)
- ✅ Docker setup
- ✅ Testes E2E básicos
- ✅ Seed de dados iniciais

## 🚀 Como Executar

### 1. Setup Rápido (Windows PowerShell)

```powershell
.\setup.ps1
```

Este script irá:
- Instalar dependências
- Configurar .env
- Iniciar PostgreSQL (Docker)
- Executar migrations
- Seed de dados

### 2. Iniciar o Servidor

```bash
npm run start:dev
```

### 3. Acessar

- **API**: http://localhost:3000/api
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

## 📝 Testar a API

### Opção 1: Via Swagger (Recomendado)

1. Acesse http://localhost:3000/api/docs
2. Clique em "POST /auth/login"
3. Use as credenciais do seed:
   ```json
   {
     "email": "admin@catequese.com",
     "senha": "admin123"
   }
   ```
4. Copie o `accessToken`
5. Clique no botão "Authorize" no topo
6. Cole o token
7. Agora você pode testar todas as rotas!

### Opção 2: Via cURL/Postman

#### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@catequese.com",
    "senha": "admin123"
  }'
```

#### 2. Listar Turmas

```bash
curl -X GET http://localhost:3000/api/turmas \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

#### 3. Criar Nova Turma

```bash
curl -X POST http://localhost:3000/api/turmas \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Primeira Eucaristia 2026",
    "ano": 2026,
    "horario": "Sábado 15:00"
  }'
```

## 🔑 Usuários de Teste

Depois de executar o seed (`npm run prisma:seed`):

| Role | Email | Senha |
|------|-------|-------|
| Admin | admin@catequese.com | admin123 |
| Responsável | pai@catequese.com | parent123 |

## 📊 Visualizar o Banco de Dados

```bash
npm run prisma:studio
```

Abre uma interface gráfica em http://localhost:5555

## 🧪 Executar Testes

```bash
# Testes unitários
npm test

# Testes E2E
npm run test:e2e

# Com coverage
npm run test:cov
```

## 🐛 Solução de Problemas

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker ps

# Reiniciar PostgreSQL
docker-compose restart

# Ver logs
docker-compose logs postgres
```

### Porta 3000 ocupada

Edite o `.env`:
```env
PORT=3001
```

### Prisma não gera client

```bash
npx prisma generate
```

### Reset do banco de dados

```bash
npx prisma migrate reset
npm run prisma:seed
```

## 📦 Deploy

### Railway

1. Crie conta no Railway
2. Conecte o repositório GitHub
3. Adicione PostgreSQL
4. Configure variáveis de ambiente
5. Deploy automático!

### Render

1. Crie Web Service
2. Configure:
   - Build: `npm install && npx prisma generate && npm run build`
   - Start: `npm run prisma:deploy && npm run start:prod`
3. Adicione PostgreSQL
4. Configure variáveis de ambiente

### Heroku

```bash
heroku create seu-app
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npm run prisma:deploy
```

## 🔧 Desenvolvimento

### Criar nova migration

```bash
npx prisma migrate dev --name nome_da_migration
```

### Adicionar novo módulo

```bash
nest g module modules/novo-modulo
nest g service modules/novo-modulo
nest g controller modules/novo-modulo
```

### Formatação de código

```bash
npm run format
npm run lint
```

## 📚 Documentação Adicional

- [NestJS Docs](https://docs.nestjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Swagger/OpenAPI](https://swagger.io)
- [README.md](./README.md) - Documentação completa
- [INSTALL.md](./INSTALL.md) - Guia de instalação

## ⚠️ Importante para Produção

Antes de fazer deploy em produção:

1. ✅ Mude `JWT_SECRET` e `JWT_REFRESH_SECRET` no `.env`
2. ✅ Configure `FRONTEND_URL` correto
3. ✅ Configure S3/R2 para uploads
4. ✅ Configure email (Resend/SendGrid)
5. ✅ Configure HTTPS
6. ✅ Ative rate limiting mais restritivo
7. ✅ Configure monitoramento (Sentry, Datadog, etc)
8. ✅ Backups automáticos do banco de dados

## 🎉 Pronto!

Seu backend está pronto para uso! Explore a documentação Swagger e comece a integrar com o frontend.

Se tiver dúvidas, consulte:
- README.md (documentação completa)
- Swagger docs (todas as rotas disponíveis)
- Código dos controllers (exemplos de uso)

**Bom desenvolvimento! 🚀**
