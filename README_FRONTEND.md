# Sistema de Gestão Catequética - Frontend

Frontend da plataforma de Gestão Catequética responsável pela interação entre Responsáveis, Catequistas, Secretaria e Coordenadores.

---

# Tecnologias

## Core

- React 19+
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

# Estrutura de Pastas

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

# Estrutura de Rotas

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

Instalação:

```bash
npm install
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

✅ Arquitetura definida

✅ Banco de dados modelado

✅ Requisitos definidos

⏳ Protótipos de tela

⏳ UI Components

⏳ Integração backend

⏳ Desenvolvimento