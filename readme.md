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

## Pré-matrícula e renovação

- Na pré-matrícula são exigidos os três documentos e as confirmações do formulário. A coordenação consulta os dados e anexos em **Catequizandos**, aprova ou recusa e, ao aprovar, cria o acesso do responsável quando necessário.
- O responsável acessa **Renovação**, seleciona o catequizando e o ano atual ou seguinte e anexa o comprovante do Pix de R$ 50. Documentos já cadastrados não são exigidos novamente; documentos faltantes são obrigatórios e os existentes podem ser substituídos. A solicitação só é confirmada após análise em **Renovações** pela coordenação. Se recusada, o motivo aparece para o responsável, que pode reenviar.
- A aprovação da renovação registra a decisão; ela não movimenta o catequizando de turma automaticamente nem verifica o Pix com o banco.
- Antes da publicação, execute `npm run prisma:deploy` e `npm run prisma:generate` no backend e reinicie a API. Configure PostgreSQL, S3/R2 e SMTP; o endpoint público do S3 deve ser acessível pelo navegador, pois os links dos documentos são temporários. Sem SMTP, a coordenação precisa reenviar o convite depois da configuração.
- Configure `VITE_API_URL` com a URL pública da API ao compilar o frontend se ela estiver em outro domínio, e inclua o endereço público do site em `FRONTEND_URLS` no backend. Sem `VITE_API_URL`, a versão de produção usa a mesma origem do site, que deve encaminhar `/api` ao backend.
- A página de histórico e o controle de presença de reuniões ainda não estão integrados aos dados reais; use o cronograma para cadastrar reuniões.

Os testes de integração podem ser executados contra um **banco de teste isolado**, após aplicar as migrations nele, definindo `TEST_DATABASE_URL` e executando `npm run test:e2e` no backend. Os testes simulam o armazenamento de arquivos e não devem apontar para o banco de produção.