# Sistema de Gestão Catequética - Frontend

Frontend da plataforma de Gestão Catequética responsável pela interação entre Responsáveis, Catequistas, Secretaria e Coordenadores.

---

## Estado da base reaproveitada

O projeto executável fica em `front/`. Ele contém páginas e componentes
selecionados da versão anterior e uma interface de matrícula simulada.
O aplicativo ainda **não está pronto para produção**:

- Os serviços, contratos e endpoints em `front/src/lib` são da API anterior
  (NestJS). O endereço padrão é `http://localhost:3000`; configure
  `VITE_API_URL` somente para um servidor compatível. A integração com o novo
  backend Spring Boot ainda precisa ser definida e validada.
- A autenticação antiga usa `localStorage`, reconhece apenas os perfis
  responsável, catequista e admin, e a proteção de rotas verifica apenas a
  existência do perfil armazenado. Não há autorização por perfil: não usar
  essa base para proteger dados reais.
- O dashboard e a página de documentos do responsável contêm dados simulados.
  Essa página avisa que o envio não está disponível e não envia nem salva
  arquivos. Outros fluxos também precisam ser validados.
- O formulário em `/matricula` e a página `/inscricao/sucesso` são apenas uma
  demonstração: dados e documentos não são enviados nem persistidos.
- As telas e permissões próprias da secretaria e do coordenador e a integração
  do fluxo de aprovação e criação de usuário com o novo backend ainda não estão
  implementadas.
- As páginas legadas continuam acessíveis nas rotas antigas por compatibilidade;
  estar em `pages/legacy` não significa que estejam desativadas.

### Organização atual

```text
front/src/
├── assets/
├── components/       # layouts e componentes compartilhados, inclusive Shadcn/UI
├── contexts/
├── hooks/
├── lib/              # API, endpoints e utilitários herdados
├── pages/
│   ├── public/
│   ├── responsavel/
│   ├── catequista/
│   ├── shared/       # páginas usadas por mais de um perfil
│   └── legacy/       # funcionalidades e administração do sistema anterior
├── routes/
├── services/
├── types/
├── App.tsx
└── main.tsx
```

`api/`, `layouts/`, `store/`, `utils/` e as pastas para secretaria e
coordenador são propostas para quando houver código concreto a organizar;
os módulos herdados permanecem em `lib/` e `components/layout/` para manter
seus imports e o comportamento existentes. Não há necessidade de criar pastas
vazias antecipadamente.

### Rotas existentes e planejadas

As rotas implementadas estão em `front/src/routes/AppRoutes.tsx`. Entre elas
estão `/`, `/login`, `/esqueci-senha`, `/criar-senha`, `/pre-matricula`,
`/matricula`, `/inscricao/sucesso`,
`/pais`, `/pais/documentos`, `/admin` e `/catequista`. As rotas listadas mais
adiante neste documento são uma **proposta**, não uma declaração de que já
existam. Em particular, `/matricula/sucesso`,
`/responsavel/*`, `/secretaria/*` e `/coordenador/*` ainda não foram criadas.

### Avaliação do reaproveitamento

| Material anterior | Situação |
| --- | --- |
| `Index`, `Login`, `EsqueciSenha`, `PrimeiroAcesso`, `PreMatriculaCrianca` | Reaproveitados como base pública; ainda dependem da revisão dos contratos e fluxos. |
| `ParentDashboard`, `ParentDocumentos` | Reaproveitados como protótipos com dados fictícios; não representam dados reais. |
| `ParentCalendario`, `ParentCronograma` | Alternativas de calendário/cronograma para avaliação posterior. A primeira não possui rota; a segunda mantém a rota antiga. |
| `CatechistDashboard`, `CatechistOverview`, `MinhasTurmas`, `Comunicacao` | Mantidos para evolução posterior, fora do foco inicial. |
| `AddCatequizando`, `AdminOverview` e demais páginas de admin | Legado preservado: contém referências a pré-matrículas e aprovação da API anterior, mas não equivale aos novos perfis ou contratos. |
| `Lojinha`, `Contabilidade`, `Musicas`, `Photos` | Em `pages/legacy`; rotas mantidas apenas para compatibilidade. |
| Componentes de layout, UI, hooks, estilos e imagens utilizados | Copiados conforme os imports transitivos das páginas preservadas. |

Não foram trazidos o backend NestJS, o código de componentes sem uso pelas
páginas mantidas, a configuração específica do Lovable, os arquivos `.env` nem
as imagens sem referências. Nada foi removido do projeto anterior.

### Validação

- `npm run build`: verificação TypeScript e compilação de produção.
- `npm run lint`: existem erros e avisos no código herdado; o lint ainda não
  passa e requer saneamento posterior. A compilação não substitui essa análise.

---

# Tecnologias

## Core

- React 18
- TypeScript
- Vite

## Estilização

- Tailwind CSS
- Shadcn/UI
- Lucide React

## Navegação

- React Router DOM

## Consumo de API

- Axios

## Gerenciamento de Estado

- Zustand

## Formulários

- React Hook Form
- Zod

## Tabelas

- TanStack Table

## Datas

- date-fns

## Notificações

- Sonner

---

# Objetivo

Fornecer uma interface moderna, responsiva e intuitiva para todos os perfis do sistema.

O frontend deverá funcionar em:

- Desktop
- Tablet
- Smartphone

---

# Perfis do Sistema

## Responsável

- Solicitar matrícula.
- Acompanhar matrícula.
- Enviar documentos.
- Consultar catequizandos.
- Consultar frequência.
- Consultar conteúdos.
- Consultar eventos.
- Justificar faltas.
- Enviar mensagens.

---

## Catequista

- Consultar turmas.
- Realizar chamadas.
- Gerenciar frequência.
- Registrar conteúdos ministrados.
- Consultar conteúdos disponibilizados.
- Consultar materiais de apoio.
- Responder mensagens.

---

## Secretaria

- Conferir documentos.
- Analisar matrículas.
- Atualizar cadastros.
- Visualizar relatórios administrativos.

---

## Coordenador

- Aprovar matrículas.
- Aprovar documentos.
- Gerenciar turmas.
- Gerenciar etapas catequéticas.
- Gerenciar conteúdos.
- Publicar comunicados.
- Gerenciar eventos.
- Gerar relatórios.

---

# Estrutura de Pastas Proposta

```text
src
│
├── assets
│
├── components
│   ├── ui
│   ├── forms
│   ├── tables
│   ├── dialogs
│   ├── cards
│   └── layouts
│
├── pages
│   ├── auth
│   ├── responsavel
│   ├── catequista
│   ├── secretaria
│   └── coordenador
│
├── routes
│
├── services
│
├── hooks
│
├── store
│
├── types
│
├── utils
│
├── contexts
│
└── App.tsx
```

---

# Estrutura de Rotas Proposta

## Públicas

```text
/

/login

/matricula

/matricula/sucesso

/recuperar-senha
```

---

## Responsável

```text
/responsavel/dashboard

/responsavel/catequizandos

/responsavel/frequencia

/responsavel/documentos

/responsavel/eventos

/responsavel/mensagens

/responsavel/justificativas
```

---

## Catequista

```text
/catequista/dashboard

/catequista/turmas

/catequista/chamada

/catequista/conteudos

/catequista/reposicoes

/catequista/mensagens
```

---

## Secretaria

```text
/secretaria/dashboard

/secretaria/matriculas

/secretaria/documentos

/secretaria/cadastros
```

---

## Coordenador

```text
/coordenador/dashboard

/coordenador/turmas

/coordenador/etapas

/coordenador/matriculas

/coordenador/documentos

/coordenador/conteudos

/coordenador/eventos

/coordenador/comunicados

/coordenador/relatorios
```

---

# Layout Base

Estrutura padrão:

```text
Header
↓
Sidebar
↓
Conteúdo Principal
```

```text
-------------------------------------------------
| Header                                        |
-------------------------------------------------
| Sidebar   |                                  |
|           |      Conteúdo Principal          |
|           |                                  |
-------------------------------------------------
```

---

# MVP Inicial

Prioridade definida pela coordenação:

## Matrícula

Tela pública:

```text
Página Inicial

[ Realizar Matrícula ]
```

---

Fluxo:

```text
Preencher dados do responsável
↓
Preencher dados do catequizando
↓
Enviar documentos
↓
Enviar solicitação
↓
Receber protocolo
```

---

# Componentes Iniciais

## Formulários

```text
FormInput

FormSelect

FormDatePicker

FormTextarea

FormUpload
```

---

## Tabelas

```text
DataTable

Pagination

ColumnFilter
```

---

## Feedback

```text
Toast

AlertDialog

ConfirmationDialog
```

---

# Autenticação

JWT armazenado em:

```text
HttpOnly Cookie
```

ou

```text
Local Storage
```

(decisão futura)

---

# Integração Backend

Base URL:

```env
VITE_API_URL=http://localhost:8080/api
```

---

Exemplo:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

---

# Convenções

## Componentes

```text
PascalCase
```

Exemplo:

```tsx
LoginPage.tsx

DashboardPage.tsx

DataTable.tsx
```

---

## Hooks

```text
useNomeHook
```

Exemplo:

```tsx
useAuth()

useUsuario()
```

---

## Rotas

```text
kebab-case
```

Exemplo:

```text
/coordenador/conteudos-catequeticos
```

---

# Dashboard do Coordenador

Indicadores:

```text
Total de Catequizandos

Total de Turmas

Matrículas Pendentes

Documentos Pendentes

Próximos Eventos
```

---

# Dashboard do Catequista

Indicadores:

```text
Minhas Turmas

Catequizandos

Próximo Encontro

Reposições Pendentes

Mensagens
```

---

# Dashboard do Responsável

Indicadores:

```text
Meus Catequizandos

Próximo Encontro

Frequência

Eventos

Comunicados
```

---

# Responsividade

Breakpoints:

```text
Mobile
< 768px

Tablet
768px - 1023px

Desktop
≥ 1024px
```

---

# Desenvolvimento

Na pasta `front/`, instalação:

```bash
npm ci
```

Executar:

```bash
npm run dev
```

Build:

```bash
npm run build
```

---

# Roadmap Frontend

## Sprint 1

- Login
- Layout base
- Matrícula pública

## Sprint 2

- Dashboard Responsável
- Envio de documentos

## Sprint 3

- Dashboard Secretaria
- Gestão de matrículas

## Sprint 4

- Dashboard Coordenador
- Aprovações

## Sprint 5

- Dashboard Catequista
- Frequência

## Sprint 6

- Conteúdos
- Eventos
- Comunicação

---

# Status

✅ Base herdada organizada

✅ Banco de dados modelado

✅ Requisitos definidos

⏳ Protótipos de tela

⏳ Validação e adaptação dos componentes reaproveitados

⏳ Integração backend

⏳ Desenvolvimento