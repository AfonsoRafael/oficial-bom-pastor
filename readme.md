# Sistema de Gestão Catequética - Bom Pastor

Sistema web moderno para gerenciamento de catequese paroquial, permitindo o controle de matrículas, catequizandos, frequência, conteúdos catequéticos, comunicação e eventos.

---

## Objetivo

O projeto tem como objetivo modernizar a gestão da catequese, substituindo processos manuais realizados por meio de fichas, planilhas e aplicativos de mensagens, oferecendo uma plataforma centralizada para responsáveis, catequistas, secretaria e coordenação.

---

# Principais Funcionalidades

## Matrículas

- Solicitação online de matrícula.
- Envio de documentos obrigatórios.
- Análise documental pela secretaria.
- Aprovação ou rejeição pelo coordenador.
- Criação automática de acesso para responsáveis após aprovação.

## Gestão de Catequizandos

- Cadastro de catequizandos.
- Histórico catequético.
- Promoção entre etapas.
- Controle de situação do catequizando.
- Registro de sacramentos.
- Renovação de inscrição anual.

## Gestão de Turmas

- Cadastro de turmas.
- Associação de catequistas.
- Controle de etapas catequéticas.
- Transferência de catequizandos entre turmas.

## Frequência

- Realização de chamadas.
- Controle de presença.
- Justificativas de faltas.
- Controle de reposições.
- Cálculo de frequência.

## Conteúdo Catequético

- Cadastro de conteúdos catequéticos.
- Disponibilização para catequistas.
- Associação de conteúdos aos encontros.
- Biblioteca de materiais de apoio.

## Comunicação

- Mensagens entre usuários.
- Comunicados gerais.
- Comunicados por turma.
- Notificações.

## Eventos

- Cadastro de eventos.
- Controle de participação.
- Registro de presença.

---

# Perfis de Usuário

## Responsável

- Solicitar matrícula.
- Acompanhar catequizandos.
- Consultar frequência.
- Consultar conteúdos.
- Consultar eventos.
- Enviar documentos.
- Justificar faltas.
- Enviar mensagens.

## Catequista

- Visualizar turmas.
- Registrar conteúdos.
- Realizar chamadas.
- Gerenciar reposições.
- Consultar materiais.
- Responder mensagens.

## Secretaria

- Conferir documentos.
- Analisar matrículas.
- Emitir pareceres.
- Atualizar cadastros.
- Gerar relatórios administrativos.

## Administrador

- Aprovação de matrículas.
- Gestão de turmas e catequistas.
- Gestão de etapas catequéticas.
- Publicação de comunicados.
- Disponibilização de conteúdos.
- Geração de relatórios gerenciais.

---

# Tecnologias

## Frontend

- React 18+
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI
- React Router

## Backend

- Node.js
- NestJS
- TypeScript
- Prisma ORM
- JWT Authentication
- AWS S3 (Armazenamento de documentos)
- Nodemailer (Envio de e-mails)

## Banco de Dados

- PostgreSQL

## Ferramentas

- Git & GitHub
- Prisma Studio
- Postman
- Docker (para deploy)

---

# Estrutura do Projeto

```text
oficial-bom-pastor/
│
├── catequese-bom-pastor-back/    # Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── common/              # Guards, decorators, filters, storage
│   │   ├── modules/             # Módulos de negócio
│   │   │   ├── alunos/
│   │   │   ├── auth/
│   │   │   ├── pre-matriculas/
│   │   │   ├── renovacoes/
│   │   │   ├── comunicacao/
│   │   │   ├── notificacoes/
│   │   │   └── ...
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── catequese-bom-pastor-front/   # Frontend React
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas por role
│   │   ├── hooks/               # Custom hooks
│   │   ├── contexts/            # Context API
│   │   ├── lib/                 # Utilitários e API
│   │   ├── services/            # Chamadas de API
│   │   ├── types/               # Tipos TypeScript
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── README.md                      # Este arquivo
├── README_BACKEND.md              # Documentação do backend
├── README_FRONTEND.md             # Documentação do frontend
│
└── .gitignore
```

---

# Setup Inicial

## Pré-requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL 14+
- Git

## Backend

```bash
cd catequese-bom-pastor-back

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrations
npx prisma migrate dev

# Executar seed
npx prisma db seed

# Iniciar servidor
npm run start:dev
```

## Frontend

```bash
cd catequese-bom-pastor-front

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

---

# Modelo de Dados

Entidades principais:

```
administrador
responsavel
catequista

turma
turmaCatequista

catequizando
catequizandoDocumento

preMatricula
documento
renovacao

inscricao
pagamento

evento
musica

lojaItem

mensagem
notificacao
```

---

# Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

- Login com email e senha
- Geração de token JWT
- Refresh tokens para renovação de sessão
- Guards de autenticação e autorização baseados em perfis

---

# Status do Projeto

✅ Estrutura base finalizada

✅ Autenticação implementada

✅ Módulo de pré-matrículas implementado

✅ Módulo de renovações implementado

✅ Seed com dados de login (4 perfis)

⏳ Testes automatizados

⏳ Documentação de API

---

# Contribuindo

1. Clone o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -am 'Add feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

# Licença

MIT