#!/usr/bin/env pwsh

Write-Host " Setup do Catequese Bom Pastor Backend" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Node.js
Write-Host " Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host " Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host " Node.js não encontrado. Por favor, instale o Node.js 18+ LTS" -ForegroundColor Red
    exit 1
}

# 2. Instalar dependências
Write-Host ""
Write-Host " Instalando dependências..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host " Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

Write-Host " Dependências instaladas" -ForegroundColor Green

# 3. Verificar .env
Write-Host ""
Write-Host "  Verificando arquivo .env..." -ForegroundColor Yellow

if (-not (Test-Path ".env")) {
    Write-Host " Criando arquivo .env a partir do .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host " Arquivo .env criado" -ForegroundColor Green
    } else {
        Write-Host "  .env.example não encontrado. Crie o arquivo .env manualmente!" -ForegroundColor Yellow
    }
} else {
    Write-Host " Arquivo .env já existe" -ForegroundColor Green
}

# 4. Perguntar se quer iniciar Docker
Write-Host ""
$startDocker = Read-Host "Deseja iniciar o PostgreSQL via Docker? (S/N)"

if ($startDocker -eq "S" -or $startDocker -eq "s") {
    Write-Host " Iniciando Docker Compose..." -ForegroundColor Yellow
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " PostgreSQL iniciado" -ForegroundColor Green
        Write-Host " Aguardando banco de dados ficar pronto..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host " Erro ao iniciar Docker. Verifique se o Docker está instalado e rodando" -ForegroundColor Red
        Write-Host "ℹ  Você pode configurar um PostgreSQL local manualmente" -ForegroundColor Cyan
    }
}

# 5. Gerar Prisma Client
Write-Host ""
Write-Host " Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -ne 0) {
    Write-Host " Erro ao gerar Prisma Client" -ForegroundColor Red
    exit 1
}

Write-Host " Prisma Client gerado" -ForegroundColor Green

# 6. Executar migrations
Write-Host ""
$runMigrations = Read-Host "Deseja executar as migrations do banco? (S/N)"

if ($runMigrations -eq "S" -or $runMigrations -eq "s") {
    Write-Host " Executando migrations..." -ForegroundColor Yellow
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Migrations executadas" -ForegroundColor Green
    } else {
        Write-Host " Erro ao executar migrations" -ForegroundColor Red
        Write-Host "ℹ  Verifique a configuração DATABASE_URL no .env" -ForegroundColor Cyan
    }
}

# 7. Seed de dados
Write-Host ""
$runSeed = Read-Host "Deseja executar o seed de dados iniciais? (S/N)"

if ($runSeed -eq "S" -or $runSeed -eq "s") {
    Write-Host " Executando seed..." -ForegroundColor Yellow
    npm run prisma:seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " Seed executado com sucesso" -ForegroundColor Green
        Write-Host ""
        Write-Host " Credenciais de teste criadas:" -ForegroundColor Cyan
        Write-Host "   Admin: admin@catequese.com / admin123" -ForegroundColor White
        Write-Host "   Catequista: catequista@catequese.com / catequista123" -ForegroundColor White
        Write-Host "   Responsável: pai@catequese.com / parent123" -ForegroundColor White
    } else {
        Write-Host "  Erro ao executar seed (pode ser ignorado)" -ForegroundColor Yellow
    }
}

# 8. Finalização
Write-Host ""
Write-Host " Setup concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o servidor:" -ForegroundColor Cyan
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "URLs importantes:" -ForegroundColor Cyan
Write-Host "  API: http://localhost:3000/api/v1" -ForegroundColor White
Write-Host "  Docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "  Health: http://localhost:3000/api/v1/health" -ForegroundColor White
Write-Host ""
