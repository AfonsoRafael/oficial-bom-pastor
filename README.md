# Sistema de Gestão Catequética

Sistema web para gerenciamento de catequese paroquial, permitindo o controle de matrículas, catequizandos, frequência, conteúdos catequéticos, comunicação e eventos.

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

## Coordenador

- Herdar todas as permissões do Catequista.
- Aprovar matrículas.
- Aprovar documentos.
- Gerenciar turmas.
- Gerenciar etapas catequéticas.
- Publicar comunicados.
- Disponibilizar conteúdos.
- Gerar relatórios gerenciais.

---

# Tecnologias

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/UI

## Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- JWT

## Banco de Dados

- MySQL 8

## Ferramentas

- MySQL Workbench
- Draw.io
- DBeaver (opcional)
- Postman
- Git
- GitHub

---

# Estrutura do Projeto

```text
catequese-system
│
├── backend
│
├── frontend
│
├── database
│   ├── schema.sql
│   ├── backups
│
├── docs
│   ├── requisitos
│   ├── casos-de-uso
│   ├── diagrama-classes
│   ├── der
│
└── README.md
```

---

# Modelo de Permissões

O sistema utiliza controle de acesso baseado em perfis (RBAC).

Tabelas principais:

- usuario
- perfil
- usuario_perfil

Perfis disponíveis:

- RESPONSAVEL
- CATEQUISTA
- SECRETARIA
- COORDENADOR

Um usuário pode possuir mais de um perfil.

Exemplo:

```text
João Silva
├── CATEQUISTA
└── COORDENADOR
```

---

# Banco de Dados

O banco possui modelagem relacional baseada em:

- Usuários e Perfis
- Matrículas
- Catequizandos
- Etapas Catequéticas
- Turmas
- Conteúdo Catequético
- Frequência
- Reposições
- Comunicação
- Eventos
- Sacramentos

Entidades principais:

```text
usuario
perfil
usuario_perfil

responsavel
catequista

matricula
documento

catequizando

etapa_catequetica
turma
turma_catequista

conteudo_catequetico
etapa_conteudo
material_apoio
disponibilizacao_conteudo
encontro_catequetico

frequencia
justificativa

reposicao
catequizando_reposicao

mensagem
comunicado

evento
participacao_evento

sacramento
```

---

# MVP (Primeira Entrega)

### Módulos Prioritários

- Matrículas.
- Gestão documental.
- Aprovação pela coordenação.
- Cadastro de catequizandos.
- Login e permissões.

---

# Futuras Implementações

- Notificações por e-mail.
- Notificações push.
- Aplicativo mobile.
- QR Code para presença.
- Dashboard estatístico.
- Exportação de relatórios PDF.

---

# Status do Projeto

✅ Requisitos finalizados

✅ Casos de Uso finalizados

✅ Diagrama de Classes finalizado

✅ DER finalizado

✅ Banco de Dados modelado

⏳ Backend em desenvolvimento

⏳ Frontend em desenvolvimento

⏳ MVP de matrículas