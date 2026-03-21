# Autenticação JWT - Guia de Uso

## Configuração

O projeto agora está configurado para usar JWT (JSON Web Tokens) para autenticação.

### Variáveis de Ambiente

Configure a URL da API no arquivo `.env`:
```
VITE_API_URL=http://localhost:3000
```

## Como Funciona

### 1. Login
Quando o usuário faz login através da página `/login`, o sistema:
- Envia email e senha para `POST /auth/login`
- Recebe do backend: `{ user, accessToken, refreshToken }`
- Armazena no localStorage:
  - `accessToken` - Token de acesso (expira em 15min)
  - `refreshToken` - Token para renovação (expira em 7 dias)
  - `user` - Dados do usuário
  - `userRole` - Role do usuário (parent, catechist, admin)

### 2. Fazendo Requisições Autenticadas

Use o helper `api` do arquivo `src/lib/api.ts`:

```typescript
import { api } from "@/lib/api";

// GET
const response = await api.get("/turmas");
const turmas = await response.json();

// POST
const response = await api.post("/turmas", {
  nome: "Turma A",
  ano: 2026
});

// PUT
const response = await api.put("/turmas/1", {
  nome: "Turma A - Atualizada"
});

// DELETE
const response = await api.delete("/turmas/1");
```

### 3. Renovação Automática do Token

O sistema renova automaticamente o `accessToken` quando ele expira:
- Detecta resposta 401 (não autorizado)
- Usa o `refreshToken` para obter novo `accessToken`
- Retenta a requisição original
- Se falhar, redireciona para login

### 4. Usando o AuthContext

```typescript
import { useAuth } from "@/contexts/AuthContext";

function MeuComponente() {
  const { user, role, isAuthenticated, logout, getAuthHeader } = useAuth();

  // Verificar se está autenticado
  if (!isAuthenticated) {
    return <div>Faça login</div>;
  }

  // Acessar dados do usuário
  console.log(user.nome, user.email);

  // Fazer logout
  const handleLogout = () => {
    logout(); // Remove tokens e redireciona para "/"
  };

  // Obter header de autorização manualmente (raramente necessário)
  const headers = getAuthHeader(); // { Authorization: "Bearer <token>" }

  return <div>Olá, {user.nome}!</div>;
}
```

## Testando no Console do Navegador

Abra o DevTools (F12) e execute:

```javascript
// Ver o token atual
console.log("Access Token:", localStorage.getItem("accessToken"));
console.log("Refresh Token:", localStorage.getItem("refreshToken"));
console.log("User:", JSON.parse(localStorage.getItem("user")));

// Copiar o token para usar em ferramentas como Postman/Insomnia
copy(localStorage.getItem("accessToken"));
```

## Usando com Postman/Insomnia

1. Faça login no site
2. Abra o console do navegador (F12)
3. Execute: `copy(localStorage.getItem("accessToken"))`
4. No Postman/Insomnia:
   - Adicione o header: `Authorization: Bearer <cole-o-token-aqui>`

## Estrutura de Dados

### Response de Login
```json
{
  "user": {
    "id": "123",
    "email": "usuario@email.com",
    "nome": "João Silva",
    "role": "parent"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### User Object
```typescript
interface User {
  id: string;
  email: string;
  nome: string;
  role: "parent" | "catechist" | "admin";
}
```

## Próximos Passos

1. **Configure a URL do backend** no arquivo `.env`
2. **Faça login** na página `/login` com credenciais válidas
3. **O token será armazenado automaticamente**
4. **Use o helper `api`** para fazer requisições autenticadas

## Solução de Problemas

### Erro 401 - Não autorizado
- Verifique se fez login
- Verifique se o token não expirou (após 15 minutos de inatividade)
- Tente fazer login novamente

### Token não está sendo enviado
- Verifique se usou o helper `api` do arquivo `src/lib/api.ts`
- Verifique se o token está no localStorage: `localStorage.getItem("accessToken")`

### Backend não aceita o token
- Verifique se a URL do backend está correta no `.env`
- Verifique se o backend está configurado para aceitar JWT
- Verifique se o secret do JWT é o mesmo no backend
