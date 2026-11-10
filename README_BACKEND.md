# Sistema de Gestão Catequética - Backend

Backend da plataforma de Gestão Catequética responsável pelo controle de usuários, matrículas, catequizandos, frequência, conteúdos catequéticos, eventos e comunicação interna.

---

# Tecnologias

## Linguagem

- Java 21

## Framework

- Spring Boot 3.x

## Persistência

- Spring Data JPA
- Hibernate

## Segurança

- Spring Security
- JWT (JSON Web Token)

## Banco de Dados

- MySQL 8

## Utilitários

- Lombok
- Bean Validation
- Spring Mail
- MapStruct (opcional)

---

# Arquitetura

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
MySQL
```

Arquitetura adotada:

```text
API REST
```

---

# Estrutura de Pacotes

```text
src/main/java/br/com/catequese
│
├── config
│
├── security
│
├── auth
│
├── usuario
│
├── perfil
│
├── responsavel
│
├── catequista
│
├── matricula
│
├── documento
│
├── catequizando
│
├── etapa
│
├── turma
│
├── conteudo
│
├── encontro
│
├── frequencia
│
├── justificativa
│
├── reposicao
│
├── mensagem
│
├── comunicado
│
├── evento
│
├── sacramento
│
└── common
```

---

# Camadas

Cada módulo deverá seguir:

```text
usuario
│
├── controller
├── dto
├── entity
├── mapper
├── repository
├── service
└── exception
```

---

# Padrão de Entidades

Exemplo:

```java
@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    private String email;

    private String senha;

    private String telefone;

    private Boolean ativo;
}
```

---

# Controle de Acesso

Modelo RBAC.

## Perfis

```text
RESPONSAVEL

CATEQUISTA

COORDENADOR

SECRETARIA
```

---

# Tabelas Principais

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

# Autenticação

Fluxo:

```text
Login
↓
Backend valida usuário
↓
Gera JWT
↓
Frontend recebe Token
↓
Token enviado no Authorization
```

Header:

```http
Authorization: Bearer <token>
```

---

# Endpoints

## Auth

```http
POST /api/auth/login

POST /api/auth/refresh
```

---

## Matrículas

```http
POST /api/matriculas

GET /api/matriculas

GET /api/matriculas/{id}

PUT /api/matriculas/{id}/aprovar

PUT /api/matriculas/{id}/rejeitar
```

---

## Documentos

```http
POST /api/documentos

GET /api/documentos

GET /api/documentos/{id}
```

---

## Catequizandos

```http
GET /api/catequizandos

GET /api/catequizandos/{id}

POST /api/catequizandos

PUT /api/catequizandos/{id}
```

---

## Turmas

```http
GET /api/turmas

POST /api/turmas

PUT /api/turmas/{id}
```

---

## Frequência

```http
POST /api/frequencias

GET /api/frequencias/turma/{id}
```

---

## Conteúdos

```http
GET /api/conteudos

POST /api/conteudos

PUT /api/conteudos/{id}
```

---

# Upload de Arquivos

Arquivos inicialmente armazenados em:

```text
/uploads
```

Tipos aceitos:

```text
PDF
JPG
JPEG
PNG
```

Utilização:

- Documentos de matrícula.
- Comprovantes.
- Materiais de apoio.
- Sacramentos.

---

# Emails

Utilizar:

```text
Spring Mail
```

Casos:

- Aprovação de matrícula.
- Geração de acesso.
- Recuperação de senha.

---

# Configuração Local

application.yml

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/catequese_db
    username: root
    password: root

  jpa:
    hibernate:
      ddl-auto: validate

    show-sql: true

  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
```

---

# Convenções

## Classes

```text
PascalCase
```

Exemplo:

```java
MatrizController
```

---

## Métodos

```text
camelCase
```

Exemplo:

```java
aprovarMatricula()
```

---

## Tabelas

```text
snake_case
```

Exemplo:

```text
conteudo_catequetico
```

---

## Endpoints

```text
kebab-case
```

Exemplo:

```http
/api/conteudos-catequeticos
```

---

# MVP

Primeira entrega:

- Login.
- Controle de Perfis.
- Matrículas.
- Documentos.
- Aprovação de Matrículas.
- Geração de Usuários.
- Dashboard Inicial.

---

# Roadmap

## Sprint 1

- Configuração projeto.
- Banco de dados.
- Segurança JWT.

## Sprint 2

- Matrículas.
- Documentos.

## Sprint 3

- Catequizandos.
- Turmas.

## Sprint 4

- Frequência.
- Justificativas.

## Sprint 5

- Conteúdo Catequético.

## Sprint 6

- Eventos.
- Comunicação.

---

# Status

✅ Requisitos concluídos

✅ Casos de Uso concluídos

✅ DER concluído

✅ Banco Modelado

⏳ Backend em desenvolvimento

⏳ Frontend em desenvolvimento