# Catequese Bom Pastor

Sistema web para gestão da catequese, com áreas para **admin**, **catequista** e **responsável**.

O projeto está dividido em duas partes:

- [catequese-bom-pastor-front](catequese-bom-pastor-front) - frontend em React + Vite.
- [catequese-bom-pastor-back](catequese-bom-pastor-back) - backend em NestJS + Prisma.

## O que o sistema faz

- gerencia turmas, catequizandos e inscrições;
- organiza cronograma, calendário e histórico;
- controla documentos, pagamentos e materiais;
- oferece galeria de fotos e áreas específicas por perfil de usuário.

## Requisitos

- Node.js 18 ou superior;
- npm;
- PostgreSQL 14 ou superior para o backend;
- Docker opcional, se quiser subir o banco com `docker-compose`.

## Como executar o projeto

### 1. Backend

Entre na pasta do backend:

```bash
cd catequese-bom-pastor-back
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente conforme a documentação do backend, especialmente `DATABASE_URL`, `JWT_SECRET` e `JWT_REFRESH_SECRET`.

Se quiser subir o banco via Docker:

```bash
docker-compose up -d
```

Depois rode as migrations:

```bash
npx prisma migrate dev
```

Opcionalmente, execute o seed:

```bash
npm run prisma:seed
```

Por fim, inicie a API:

```bash
npm run start:dev
```

Endereços úteis do backend:

- API: `http://localhost:3000/api`
- Swagger: `http://localhost:3000/api/docs`
- Health check: `http://localhost:3000/api/health`

### 2. Frontend

Em outro terminal, entre na pasta do frontend:

```bash
cd catequese-bom-pastor-front
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

O frontend normalmente ficará disponível em:

- `http://localhost:5173`

## Scripts úteis

### Frontend

- `npm run dev` - inicia o Vite em modo desenvolvimento.
- `npm run build` - gera build de produção.
- `npm run preview` - visualiza o build gerado.
- `npm run lint` - executa o ESLint.

### Backend

- `npm run start:dev` - inicia a API em modo desenvolvimento.
- `npm run build` - compila o projeto.
- `npm run prisma:migrate` - cria novas migrations.
- `npm run prisma:deploy` - aplica migrations em produção.
- `npm run prisma:studio` - abre o Prisma Studio.
- `npm run prisma:seed` - executa a carga inicial de dados.

## Como subir no GitHub

Se o repositório ainda não estiver vinculado ao GitHub:

```bash
git init
git add .
git commit -m "docs: adiciona README do projeto"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

Se o repositório já existir e você só quiser enviar atualizações:

```bash
git add .
git commit -m "docs: atualiza README"
git push
```

## Documentação complementar

- [catequese-bom-pastor-back/README.md](catequese-bom-pastor-back/README.md)
- [catequese-bom-pastor-back/INSTALL.md](catequese-bom-pastor-back/INSTALL.md)
- [catequese-bom-pastor-back/START.md](catequese-bom-pastor-back/START.md)
- [catequese-bom-pastor-front/README.md](catequese-bom-pastor-front/README.md)

## Observação

Algumas integrações podem depender de variáveis adicionais no backend, como envio de e-mail, armazenamento de arquivos e autenticação. Consulte a documentação específica de cada pasta antes de publicar em produção.