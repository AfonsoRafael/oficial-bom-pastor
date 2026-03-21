# Prompt para Construção do Backend - Catequese Bom Pastor

## Contexto do Projeto

Este é um backend para uma plataforma de gestão catequética chamada **Catequese Bom Pastor**. A plataforma suporta três tipos de usuários:
- **Admin**: Acesso total, gestão de turmas, catequistas, responsáveis, financeiro
- **Catequista**: Acesso às suas turmas, cronograma, alunos, materiais
- **Responsável (Pai/Mãe)**: Acesso às inscrições dos filhos, calendário, documentos, materiais e loja

## Stack Obrigatória

- **Runtime**: Node.js (LTS)
- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL
- **ORM**: Prisma
- **Autenticação**: JWT (access token + refresh token)
- **Autorização**: RBAC (Role-Based Access Control)
- **Validação**: class-validator + class-transformer
- **Logs**: Pino (ou similar)
- **API Docs**: Swagger/OpenAPI
- **Testes**: Jest + Supertest (mínimo testes e2e para rotas críticas)

## Modelo de Dados (Prisma Schema)

```prisma
// Roles
enum Role {
  ADMIN
  CATECHIST
  PARENT
}

// Entidade User
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  nome          String
  telefone      String?
  role          Role      @default(PARENT)
  senha         String
  firstAccessComplete Boolean @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relações
  catequista    Catequista?
  responsavel   Responsavel?
  createdTurmas Turma[]   @relation("createdBy")
}

model Catequista {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  turmas        Turma[]   @relation("CatechistasEmTurma")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Responsavel {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  alunos        Aluno[]
  inscricoes    Inscricao[]
  pagamentos    Pagamento[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Turma (classe)
model Turma {
  id            String    @id @default(cuid())
  nome          String
  ano           Int
  horario       String?   // Ex: "Sexta 19:00"
  createdById   String
  createdBy     User      @relation("createdBy", fields: [createdById], references: [id])
  catequistas   Catequista[] @relation("CatechistasEmTurma")
  alunos        Aluno[]
  inscricoes    Inscricao[]
  eventos       Evento[]
  materiais     Material[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Aluno (criança)
model Aluno {
  id            String    @id @default(cuid())
  nome          String
  dataNascimento DateTime
  turmaId       String
  turma         Turma     @relation(fields: [turmaId], references: [id], onDelete: Cascade)
  responsavelId String
  responsavel   Responsavel @relation(fields: [responsavelId], references: [id], onDelete: Cascade)
  inscricoes    Inscricao[]
  observacoes   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Inscrição
enum InscricaoStatus {
  SUBMITTED
  APPROVED
  REJECTED
}

model Inscricao {
  id            String    @id @default(cuid())
  alunoId       String
  aluno         Aluno     @relation(fields: [alunoId], references: [id], onDelete: Cascade)
  turmaId       String
  turma         Turma     @relation(fields: [turmaId], references: [id], onDelete: Cascade)
  responsavelId String
  responsavel   Responsavel @relation(fields: [responsavelId], references: [id], onDelete: Cascade)
  status        InscricaoStatus @default(SUBMITTED)
  documentosUrl String[]  // JSON array de URLs de documentos
  observacoes   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  pagamentos    Pagamento[]

  @@unique([alunoId, turmaId])
}

// Pagamento
enum PaymentMethod {
  CASH
  PIX
  CARD
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  RECEIVED
  CANCELLED
}

model Pagamento {
  id            String    @id @default(cuid())
  inscricaoId   String?
  inscricao     Inscricao? @relation(fields: [inscricaoId], references: [id], onDelete: SetNull)
  responsavelId String?
  responsavel   Responsavel? @relation(fields: [responsavelId], references: [id], onDelete: SetNull)
  valor         Float
  metodo        PaymentMethod
  status        PaymentStatus @default(PENDING)
  receiptUrl    String?
  dataPagamento DateTime?
  descricao     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Material (apostilas, videos, etc)
model Material {
  id            String    @id @default(cuid())
  titulo        String
  descricao     String?
  fileUrl       String
  turmaId       String?   // NULL = material geral
  turma         Turma?    @relation(fields: [turmaId], references: [id], onDelete: SetNull)
  visibilidade  String    @default("geral") // "geral" ou "turma"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Documento
model Documento {
  id            String    @id @default(cuid())
  titulo        String
  descricao     String?
  fileUrl       String
  visibilidade  String    @default("parent") // "parent", "turma", "geral"
  turmaId       String?
  turma         Turma?    @relation("DocumentosTurma", fields: [turmaId], references: [id], onDelete: SetNull)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Evento (cronograma/calendário)
enum TipoEvento {
  TURMA
  GERAL
}

model Evento {
  id            String    @id @default(cuid())
  titulo        String
  descricao     String?
  data          DateTime
  tipo          TipoEvento @default(GERAL)
  turmaId       String?
  turma         Turma?    @relation(fields: [turmaId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Galeria de Imagens
model Galeria {
  id            String    @id @default(cuid())
  titulo        String
  descricao     String?
  visibilidade  String    @default("geral")
  imagens       Imagem[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Imagem {
  id            String    @id @default(cuid())
  galeiraId     String
  galeria       Galeria   @relation(fields: [galeiraId], references: [id], onDelete: Cascade)
  fileUrl       String
  titulo        String?
  createdAt     DateTime  @default(now())
}

// Música
model Musica {
  id            String    @id @default(cuid())
  titulo        String
  autor         String?
  linkExterno   String?   // YouTube, Drive, etc
  notas         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Loja
model LojaItem {
  id            String    @id @default(cuid())
  nome          String
  descricao     String?
  preco         Float
  estoque       Int
  imagemUrl     String?
  ordens        OrdemLoja[] @relation("ItensOrdem")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model OrdemLoja {
  id            String    @id @default(cuid())
  responsavelId String
  itens         LojaItem[] @relation("ItensOrdem")
  total         Float
  status        String    @default("pending") // "pending", "paid", "shipped", "delivered"
  pagamentoId   String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

## Rotas da API (Padrão: /api/v1)

### Autenticação
- `POST /auth/register` - Registro de novo usuário (Primeiro Acesso)
  - Payload: `{ email, senha, nome, telefone?, role }`
  - Resposta: `{ user: { id, email, nome, role }, accessToken, refreshToken }`
  
- `POST /auth/login` - Login
  - Payload: `{ email, senha }`
  - Resposta: `{ user, accessToken, refreshToken }`
  
- `POST /auth/refresh` - Renovar token
  - Payload: `{ refreshToken }`
  - Resposta: `{ accessToken }`
  
- `POST /auth/forgot-password` - Solicitar reset
  - Payload: `{ email }`
  - Resposta: `{ message: "Email enviado" }`
  
- `POST /auth/reset-password` - Confirmar novo password
  - Payload: `{ token, novaSenha }`
  - Resposta: `{ message: "Senha atualizada" }`
  
- `GET /auth/me` - Perfil do usuário autenticado
  - Resposta: `{ id, email, nome, role, firstAccessComplete }`

### Usuários e Papéis
- `GET /users` - Listar usuários (ADMIN only)
  - Query: `?role=ADMIN&limit=20&offset=0`
  - Resposta: `{ total, users: [...] }`
  
- `POST /users` - Criar usuário (ADMIN only)
  - Payload: `{ email, nome, telefone?, role }`
  
- `GET /users/:id` - Detalhe do usuário
  
- `PATCH /users/:id` - Atualizar usuário
  - Payload: `{ nome?, telefone?, role? }` (role only ADMIN)
  
- `DELETE /users/:id` - Deletar usuário (ADMIN only)

### Turmas
- `GET /turmas` - Listar turmas
  - Query: `?catechistId=me&limit=20`
  - Resposta: `{ total, turmas: [...] }`
  
- `POST /turmas` - Criar turma (ADMIN, CATECHIST)
  - Payload: `{ nome, ano, horario?, catechistIds[] }`
  
- `GET /turmas/:id` - Detalhe da turma
  - Resposta: `{ id, nome, ano, horario, catequistas: [...], alunos: [...] }`
  
- `PATCH /turmas/:id` - Atualizar turma
  
- `DELETE /turmas/:id` - Deletar turma (ADMIN only)
  
- `GET /turmas/:id/alunos` - Alunos da turma
  
- `POST /turmas/:id/catequistas` - Vincular catequista
  - Payload: `{ catechistaId }`
  
- `DELETE /turmas/:id/catequistas/:catechistaId` - Desvincular catequista

### Alunos
- `GET /alunos` - Listar alunos
  - Query: `?turmaId=xxx&responsavelId=me&limit=20`
  
- `POST /alunos` - Criar aluno
  - Payload: `{ nome, dataNascimento, turmaId, responsavelId, observacoes? }`
  - Auth: PARENT (só pode criar para si) ou ADMIN
  
- `GET /alunos/:id` - Detalhe do aluno
  
- `PATCH /alunos/:id` - Atualizar aluno
  
- `DELETE /alunos/:id` - Deletar aluno

### Responsáveis (Pais)
- `GET /responsaveis` - Listar responsáveis (ADMIN)
  
- `POST /responsaveis` - Criar responsável (ADMIN ou auto-registro)
  
- `GET /responsaveis/:id` - Detalhe do responsável
  - Resposta: `{ id, userId, alunos: [...], inscricoes: [...] }`
  
- `PATCH /responsaveis/:id` - Atualizar responsável
  
- `DELETE /responsaveis/:id` - Deletar responsável

### Inscrições
- `GET /inscricoes` - Listar inscrições
  - Query: `?turmaId=xxx&status=SUBMITTED&responsavelId=xxx&limit=20`
  - Resposta: `{ total, inscricoes: [...] }`
  
- `POST /inscricoes` - Submeter nova inscrição (PreMatriculaCrianca)
  - Payload: `{ alunoId, turmaId, documentosUrl[] }`
  - Auth: PARENT (responsável do aluno)
  
- `GET /inscricoes/:id` - Detalhe da inscrição
  
- `PATCH /inscricoes/:id` - Atualizar inscrição (ADMIN, CATECHIST)
  - Payload: `{ status: "APPROVED" | "REJECTED", observacoes? }`
  
- `DELETE /inscricoes/:id` - Deletar inscrição (ADMIN)

### Pagamentos (Contabilidade)
- `GET /pagamentos` - Listar pagamentos
  - Query: `?turmaId=xxx&status=PENDING&responsavelId=xxx&limit=20&offset=0`
  - Resposta: `{ total, pagamentos: [...] }`
  
- `POST /pagamentos` - Registrar pagamento
  - Payload: `{ inscricaoId?, responsavelId?, valor, metodo, descricao? }`
  - Auth: ADMIN ou PARENT (próprios pagamentos)
  
- `GET /pagamentos/:id` - Detalhe do pagamento
  
- `PATCH /pagamentos/:id` - Atualizar pagamento
  - Payload: `{ status, dataPagamento?, receiptUrl? }`
  
- `DELETE /pagamentos/:id` - Deletar pagamento (ADMIN)
  
- `GET /pagamentos/relatorio/resumo` - Relatório de faturamento
  - Query: `?dataInicio=2026-01-01&dataFim=2026-01-31&turmaId=xxx`
  - Resposta: `{ total, porMetodo: {...}, porTurma: {...} }`

### Materiais
- `GET /materiais` - Listar materiais
  - Query: `?turmaId=xxx&visibilidade=geral&limit=20`
  
- `POST /materiais` - Criar material
  - Payload: `{ titulo, descricao?, fileUrl, turmaId?, visibilidade }`
  - Auth: ADMIN, CATECHIST
  
- `GET /materiais/:id` - Detalhe do material
  
- `PATCH /materiais/:id` - Atualizar material
  
- `DELETE /materiais/:id` - Deletar material (ADMIN, criador)

### Documentos
- `GET /documentos` - Listar documentos
  - Query: `?visibilidade=parent&turmaId=xxx&limit=20`
  
- `POST /documentos` - Criar documento
  - Payload: `{ titulo, descricao?, fileUrl, visibilidade, turmaId? }`
  - Auth: ADMIN
  
- `PATCH /documentos/:id` - Atualizar documento
  
- `DELETE /documentos/:id` - Deletar documento (ADMIN)

### Upload (Presigned URLs)
- `POST /uploads/presign` - Obter URL pré-assinada para upload S3
  - Payload: `{ fileName, fileType, fileSize }`
  - Resposta: `{ presignedUrl, fileKey }`
  - Use para materiais, documentos, inscrição, etc

### Cronograma
- `GET /cronograma` - Listar eventos de cronograma
  - Query: `?turmaId=xxx&limit=20`
  
- `POST /cronograma` - Criar evento
  - Payload: `{ titulo, descricao?, data, turmaId?, tipo }`
  - Auth: ADMIN, CATECHIST
  
- `PATCH /cronograma/:id` - Atualizar evento
  
- `DELETE /cronograma/:id` - Deletar evento

### Calendário
- `GET /calendario` - Listar eventos de calendário geral
  - Query: `?dataInicio=2026-01-01&dataFim=2026-12-31&limit=50`
  
- `POST /calendario` - Criar evento (ADMIN)
  
- `PATCH /calendario/:id` - Atualizar evento
  
- `DELETE /calendario/:id` - Deletar evento

### Galeria
- `GET /galerias` - Listar galerias
  - Query: `?visibilidade=geral&limit=20`
  
- `POST /galerias` - Criar galeria
  - Payload: `{ titulo, descricao?, visibilidade }`
  - Auth: ADMIN
  
- `GET /galerias/:id` - Detalhe com imagens
  
- `PATCH /galerias/:id` - Atualizar galeria
  
- `DELETE /galerias/:id` - Deletar galeria
  
- `POST /galerias/:id/imagens` - Adicionar imagem
  - Payload: `{ fileUrl, titulo? }`
  
- `DELETE /galerias/:id/imagens/:imagemId` - Remover imagem

### Músicas
- `GET /musicas` - Listar músicas
  - Query: `?limit=20&offset=0`
  
- `POST /musicas` - Criar música
  - Payload: `{ titulo, autor?, linkExterno?, notas? }`
  - Auth: ADMIN
  
- `GET /musicas/:id` - Detalhe da música
  
- `PATCH /musicas/:id` - Atualizar música
  
- `DELETE /musicas/:id` - Deletar música

### Loja
- `GET /lojinha/items` - Listar itens
  - Query: `?limit=20&offset=0`
  
- `POST /lojinha/items` - Criar item (ADMIN)
  - Payload: `{ nome, descricao?, preco, estoque, imagemUrl? }`
  
- `PATCH /lojinha/items/:id` - Atualizar item
  
- `DELETE /lojinha/items/:id` - Deletar item
  
- `GET /lojinha/orders` - Listar ordens
  - Query: `?responsavelId=me&status=pending&limit=20`
  
- `POST /lojinha/orders` - Criar ordem
  - Payload: `{ itens: [{ itemId, quantidade }] }`
  - Auth: PARENT
  - Resposta: `{ orderId, total, checkoutUrl }` (se integração pagamento)
  
- `GET /lojinha/orders/:id` - Detalhe da ordem
  
- `PATCH /lojinha/orders/:id` - Atualizar status ordem

### Dashboards
- `GET /dashboard/admin` - Dashboard admin
  - Resposta: `{ totalAlunos, totalTurmas, totalPagamentos, pagamentosPorMes, turmasCadastros }`
  
- `GET /dashboard/catechist` - Dashboard catequista
  - Resposta: `{ minhasTurmas, totalAlunos, proximosEventos, inscricoesPendentes }`
  
- `GET /dashboard/parent` - Dashboard responsável
  - Resposta: `{ meusAlunos, inscricoes, pagamentos, documentosDisponiveis, proximosEventos }`

## Requisitos Funcionais por Módulo

### Auth Module
- [x] JWT com access (15min) + refresh (7d) tokens
- [x] Hash de senhas com bcrypt
- [x] RBAC guards (RolesGuard) aplicados em rotas
- [x] Endpoint `/auth/me` retorna usuário autenticado
- [x] Refresh token endpoint para renovação
- [x] Password reset com token de expiração (1h)
- [x] First access flag e verificação de email (opcional, pode ser simplificado)

### Users Module
- [x] CRUD completo
- [x] Listar por role
- [x] Atualizar role (ADMIN only)
- [x] Soft delete ou hard delete com cascade nas relações apropriadas

### Turmas Module
- [x] CRUD completo
- [x] Vincular/desvincular catequistas
- [x] Filtrar por catequista (`?catechistId=me`)
- [x] Retornar lista de alunos inscritos
- [x] Validar que ao menos um catequista esteja presente

### Alunos Module
- [x] CRUD completo
- [x] PARENT só pode ver/editar próprios alunos
- [x] Validar relação com responsável
- [x] Filtrar por turma, responsável
- [x] Histórico de sacramentos/flags (observações)

### Inscrições Module
- [x] Workflow: SUBMITTED → APPROVED/REJECTED
- [x] PARENT submete com documentos
- [x] ADMIN/CATECHIST aprova/rejeita
- [x] Notificações (email) ao aprovar/rejeitar (usar queue ou envio síncrono)
- [x] Validar aluno + turma + responsável
- [x] Impedir duplicatas (unique constraint)

### Pagamentos Module
- [x] CRUD completo
- [x] Métodos: CASH, PIX, CARD, BANK_TRANSFER
- [x] Status: PENDING, RECEIVED, CANCELLED
- [x] Relatório de faturamento (filtrado por turma, período)
- [x] Vincular a inscrição ou responsável
- [x] Webhook para integração Stripe/Mercado Pago (opcional nesta fase)

### Materiais/Documentos Module
- [x] Upload via presigned URLs (S3)
- [x] Listar com filtros (turma, visibilidade)
- [x] PARENT vê só materiais gerais; CATECHIST vê da turma
- [x] Soft delete (adicionar flag `deletado` ou listar apenas ativos)

### Cronograma/Calendario Module
- [x] Diferenciar TURMA events (privados) vs GERAL events (públicos)
- [x] PARENT vê cronograma da turma do filho + eventos gerais
- [x] CATECHIST vê cronograma da sua turma + gerais
- [x] ADMIN vê todos
- [x] Ordenar por data

### Galeria/Musicas Module
- [x] Listar públicas/privadas respeitando autenticação
- [x] Upload de imagens via presigned URLs
- [x] Metadados de música (titular, link)
- [x] Sem lógica de streaming complexa (links externos)

### Loja Module
- [x] CRUD de itens (ADMIN only)
- [x] PARENT cria ordem
- [x] Carrinho: itens com quantidade
- [x] Total calculado no backend
- [x] Status workflow: PENDING → PAID → SHIPPED → DELIVERED
- [x] Validar estoque antes de criar ordem

### Health Check
- [x] GET `/health` - Resposta simples `{ status: "ok" }`
- [x] GET `/health/db` - Testa conexão Prisma

## Estrutura de Pastas Esperada

```
server/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── common/
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/
│   │   ├── database.config.ts
│   │   ├── jwt.config.ts
│   │   ├── storage.config.ts
│   │   └── email.config.ts
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── turmas/
│   │   ├── alunos/
│   │   ├── responsaveis/
│   │   ├── inscricoes/
│   │   ├── pagamentos/
│   │   ├── materiais/
│   │   ├── documentos/
│   │   ├── cronograma/
│   │   ├── calendario/
│   │   ├── galeria/
│   │   ├── musicas/
│   │   ├── loja/
│   │   ├── uploads/
│   │   └── dashboard/
│   ├── prisma/
│   │   └── schema.prisma
│   └── strategies/
│       └── jwt.strategy.ts
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── test/
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
├── .env.example
├── .env (não commitar)
├── .gitignore
├── docker-compose.yml (opcional, para Postgres local)
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Configuração Inicial

### 1. Setup do Projeto

```bash
npm i -g @nestjs/cli
nest new server --package-manager npm
cd server
npm i @nestjs/config @nestjs/jwt @nestjs/passport @nestjs/swagger
npm i passport passport-jwt passport-local bcrypt pino pino-http
npm i @prisma/client class-validator class-transformer
npm i -D prisma @types/node @types/bcrypt jest @types/jest ts-jest supertest @types/supertest
```

### 2. Configurar Prisma

- `npx prisma init`
- Editar `.env` com `DATABASE_URL` (PostgreSQL, Neon, Supabase, etc)
- Criar `prisma/schema.prisma` com os modelos acima
- `npx prisma migrate dev --name init`

### 3. Variáveis de Ambiente (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/catequese_db
JWT_SECRET=seu_secret_muito_seguro_aqui
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=development
PORT=3000

# S3 / Cloudflare R2
S3_REGION=auto (ou us-east-1)
S3_BUCKET=seu-bucket
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
S3_ENDPOINT=https://seu-r2-endpoint.com (se R2)

# Email (Resend, SendGrid, etc) - opcional
EMAIL_PROVIDER=resend
RESEND_API_KEY=xxx

# Pagamento (opcional)
STRIPE_API_KEY=xxx
MERCADO_PAGO_KEY=xxx
```

### 4. Docker Compose (opcional, para Postgres local)

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: catequese_user
      POSTGRES_PASSWORD: senha_forte
      POSTGRES_DB: catequese_db
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Padrões de Código

### DTOs (Data Transfer Objects)
- Use `class-validator` para validação
- Exemplo:
```typescript
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  nome: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsString()
  role?: string;
}
```

### Resposta Padronizada
- Sucesso: `{ data: {...}, message: "OK", statusCode: 200 }`
- Erro: `{ error: "mensagem_erro", statusCode: 400|401|403|500 }`

### Guards
- Implement `AuthGuard('jwt')` para rotas autenticadas
- Implement `RolesGuard` para rotas baseadas em role
- Exemplo: `@UseGuards(AuthGuard('jwt'), new RolesGuard(['ADMIN']))`

### Logs
- Use `Logger` do NestJS ou Pino
- Log todas as requisições (middleware)
- Log erros com stack trace

### Testes
- Mínimo: testes e2e para auth (login, register), turmas (CRUD), inscrições (workflow)
- Use `Supertest` para requisições HTTP
- Mock do Prisma com jest.mock()

## Requisitos de Segurança

- [x] Senhas com bcrypt (mínimo 10 rounds)
- [x] JWT com expiração curta (access) e longa (refresh)
- [x] CORS configurado para origem do frontend
- [x] Helmet para headers de segurança
- [x] Rate limiting em rotas críticas (login, register)
- [x] Validação de input em todas as rotas
- [x] Sem exposição de IDs internos em respostas (usar UUIDs/CUIDs)
- [x] Soft delete para dados sensíveis
- [x] Logs de autenticação e operações críticas
- [x] HTTPS em produção
- [x] Variáveis sensíveis via .env (nunca hardcoded)

## Observabilidade

- [x] Middleware de logging de requisições
- [x] Tratamento global de erros (ExceptionFilter)
- [x] Health checks (`/health`, `/health/db`)
- [x] Métricas básicas (tempo de resposta, status codes)
- [x] Rastreamento de erros (stack trace em logs)

## Testes E2E Mínimos

1. **Auth**: Register, Login, Refresh, Forgot Password
2. **Users**: CRUD, listar, buscar, atualizar role
3. **Turmas**: Create, list, get, update, add catechist
4. **Inscricoes**: Submit, approve, reject, list with filters
5. **Pagamentos**: Create, list, update status, relatório

## Deploy

- [x] Dockerfile com Node multi-stage build
- [x] docker-compose.yml para local dev
- [x] Environment-specific configs (dev, staging, prod)
- [x] Database migrations executadas no startup
- [x] Health checks prontos para K8s/Railway/Render
- [x] Variáveis de ambiente securas em produção

## Checklist Final

- [ ] Projeto criado e dependencies instaladas
- [ ] Prisma configurado e migrations rodadas
- [ ] Auth module completo (JWT, bcrypt, refresh)
- [ ] RolesGuard e AuthGuard aplicados
- [ ] CRUD de todos os módulos implementados
- [ ] Validação de input com class-validator
- [ ] Tratamento de erros global
- [ ] Testes e2e para rotas críticas
- [ ] Swagger docs geradas
- [ ] Dockerfile e docker-compose
- [ ] Health check endpoints
- [ ] Logging com Pino
- [ ] CORS e Helmet configurados
- [ ] Rate limiting em rotas sensíveis
- [ ] README com instruções de setup
- [ ] Seed script para dados iniciais

## Notas Adicionais

- Este backend é a API principal para o frontend React/Vite existente
- O frontend consome endpoints `/api/v1/*`
- Implementar CORS permissivo durante dev, restritivo em prod
- Se usar Stripe/Mercado Pago, criar webhook endpoints (`/webhooks/stripe`, `/webhooks/mercado-pago`)
- Notificações por email podem ser assíncronas (queue Bull ou similar) ou síncronas (fica mais lento)
- Para presigned URLs S3, usar biblioteca AWS SDK com `getSignedUrl`
- Considerar soft delete para Alunos/Turmas (dados sensíveis) vs hard delete para Musicas/itens não críticos

---

**Este prompt é completo e deve permitir construção de um backend robusto, escalável e seguro. Bom desenvolvimento!**
