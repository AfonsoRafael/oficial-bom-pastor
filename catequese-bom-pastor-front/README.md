# Catequese Frontend

Aplicação web em React para gestão de catequese: turmas, documentos, frequência, cronograma e materiais. Interface moderna com Tailwind CSS e componentes `shadcn/ui`.

**Status:** em desenvolvimento.

**Principais Funcionalidades**

- **Minhas Turmas:** listagem de turmas e alunos, busca, detalhes do catequizando, pré‑visualização de documentos e acompanhamento de frequência. Veja [src/pages/MinhasTurmas.tsx](src/pages/MinhasTurmas.tsx).
- **Cronograma:** página de cronograma e eventos. Veja [src/pages/Cronograma.tsx](src/pages/Cronograma.tsx).
- **Material e Músicas:** apoio didático ao catequista. Veja [src/pages/Material.tsx](src/pages/Material.tsx) e [src/pages/Musicas.tsx](src/pages/Musicas.tsx).
- **Área do Catequista e Responsável:** dashboards dedicados. Veja [src/pages/CatechistDashboard.tsx](src/pages/CatechistDashboard.tsx) e [src/pages/ParentDashboard.tsx](src/pages/ParentDashboard.tsx).
- **Autenticação e Fluxos de Inscrição:** páginas de acesso e pré‑matrícula. Veja [src/pages/Login.tsx](src/pages/Login.tsx), [src/pages/PrimeiroAcesso.tsx](src/pages/PrimeiroAcesso.tsx), [src/pages/Inscricao.tsx](src/pages/Inscricao.tsx) e [src/pages/PreMatriculaCrianca.tsx](src/pages/PreMatriculaCrianca.tsx).

**Tecnologias**

- **React 18** + **Vite 5** + **TypeScript**.
- **Tailwind CSS** com animações (`tailwindcss-animate`) e tipografia ([tailwind.config.ts](tailwind.config.ts)).
- **shadcn/ui** sobre **Radix UI** (componentes em [src/components/ui](src/components/ui)). Configuração em [components.json](components.json).
- **React Router v6** para rotas ([src/main.tsx](src/main.tsx)).
- **Lucide Icons**, **React Hook Form** + **Zod**, **TanStack Query** (pronto para dados assíncronos).
- **ESLint** + **TypeScript ESLint** com regras definidas em [eslint.config.js](eslint.config.js).

**Pré‑requisitos**

- Node.js 18+ (recomendado 20 LTS).
- PNPM, NPM ou Yarn (exemplos abaixo usam NPM).

**Instalação e Execução**

```bash
npm install
npm run dev
```

**Scripts Disponíveis**

- `dev`: inicia o servidor de desenvolvimento do Vite.
- `build`: build de produção.
- `build:dev`: build em modo desenvolvimento.
- `preview`: serve o build para inspeção.
- `lint`: análise estática com ESLint.

**Estrutura do Projeto**

- [src/pages](src/pages): páginas principais da aplicação.
- [src/components/ui](src/components/ui): biblioteca de componentes reutilizáveis (shadcn/ui).
- [src/components/layout](src/components/layout): `Header`, `Footer` e `MainLayout`.
- [src/hooks](src/hooks): hooks utilitários como [use-mobile.tsx](src/hooks/use-mobile.tsx).
- [src/lib/utils.ts](src/lib/utils.ts): helpers de estilização e composição.
- [tailwind.config.ts](tailwind.config.ts) e [src/index.css](src/index.css): tema e estilos globais.
- [tsconfig.json](tsconfig.json): alias de import `@/*` apontando para `src/*`.

**Padrões e Convenções**

- **Imports com alias:** use `@/components`, `@/components/ui`, `@/hooks`, `@/lib`, conforme definido em [components.json](components.json) e [tsconfig.json](tsconfig.json).
- **Estilização:** priorize classes utilitárias Tailwind e componentes da pasta [src/components/ui](src/components/ui).
- **Acessibilidade:** componentes Radix/shadcn já incluem práticas de A11y; mantenha labels e semântica.

**Dicas de Desenvolvimento**

- O overlay de erros do Vite pode ser ajustado em [vite.config.ts](vite.config.ts) (`server.hmr.overlay`).
- Ícones estão em **lucide-react**; prefira importações nomeadas, ex.: `import { Users } from "lucide-react"`.

**Como Contribuir**

- Abra uma issue com contexto claro, passos de reprodução e proposta de solução.
- Mantenha o estilo do código, nomes descritivos e mudanças focadas.

---

Feito com Tailwind e shadcn/ui para uma experiência rápida e elegante.
