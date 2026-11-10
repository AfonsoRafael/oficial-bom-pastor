# 🚀 START RÁPIDO - Catequese Bom Pastor Backend

## ✅ Passo a Passo (5 minutos)

### 1️⃣ Instalar Dependências (CONCLUÍDO ✅)
```bash
npm install
```
**Status**: ✅ Concluído - Todas as dependências instaladas!

### 2️⃣ Iniciar Banco de Dados

**Opção A: Docker (Recomendado)**
```powershell
docker-compose up -d
```

**Opção B: PostgreSQL Local**
- Certifique-se que o PostgreSQL está rodando
- Atualize o `DATABASE_URL` no arquivo `.env`

### 3️⃣ Executar Migrations
```powershell
npx prisma generate
npx prisma migrate dev --name init
```

### 4️⃣ Seed de Dados (Opcional)
```powershell
npm run prisma:seed
```

Isso criará usuários de teste:
- **Admin**: admin@catequese.com / admin123  
- **Responsável**: pai@catequese.com / parent123

### 5️⃣ Iniciar o Servidor
```powershell
npm run start:dev
```

### 6️⃣ Testar
Abra no navegador:
- **Swagger Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/api/health

---

## 🎯 Script Automático

Se preferir fazer tudo de uma vez:

```powershell
.\setup.ps1
```

Este script irá:
1. ✅ Instalar dependências
2. ✅ Configurar .env
3. ✅ Iniciar PostgreSQL (Docker)
4. ✅ Executar migrations
5. ✅ Seed de dados

---

## 🐛 Problemas Comuns

### Porta 3000 ocupada
Edite o `.env`:
```env
PORT=3001
```

### Erro de conexão com banco
Verifique se o PostgreSQL está rodando:
```powershell
docker ps
```

Se não estiver, inicie:
```powershell
docker-compose up -d
```

### Prisma não encontrado
```powershell
npm install
npx prisma generate
```

---

## 📚 Documentação Completa

- [README.md](README.md) - Documentação completa
- [INSTALL.md](INSTALL.md) - Guia de instalação detalhado
- [NEXT_STEPS.md](NEXT_STEPS.md) - Próximos passos
- [CHECKLIST.md](CHECKLIST.md) - Status de implementação

---

## ✅ Status Atual

✅ Dependências instaladas  
⏳ Aguardando: Iniciar banco de dados  
⏳ Aguardando: Executar migrations  
⏳ Aguardando: Iniciar servidor  

**Próximo comando recomendado:**
```powershell
docker-compose up -d
```

Depois:
```powershell
npx prisma migrate dev
npm run start:dev
```

**Bom desenvolvimento! 🚀**
