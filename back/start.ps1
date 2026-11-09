#!/usr/bin/env pwsh

Write-Host "🎯 Iniciando Catequese Bom Pastor Backend..." -ForegroundColor Cyan
Write-Host ""

# Verificar se as dependências foram instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Gerar Prisma Client
Write-Host "🔧 Gerando Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Verificar Docker
Write-Host "🐳 Verificando PostgreSQL..." -ForegroundColor Yellow
$dockerRunning = docker ps --filter "name=catequese_db" --format "{{.Names}}" 2>$null

if (-not $dockerRunning) {
    Write-Host "⚠️  PostgreSQL não está rodando" -ForegroundColor Yellow
    $startDb = Read-Host "Deseja iniciar o PostgreSQL via Docker? (S/N)"
    
    if ($startDb -eq "S" -or $startDb -eq "s") {
        docker-compose up -d
        Write-Host "⏳ Aguardando banco de dados..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }
}

# Executar migrations
Write-Host "🔄 Executando migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# Iniciar servidor
Write-Host ""
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
Write-Host ""
Write-Host "URLs importantes:" -ForegroundColor Cyan
Write-Host "  API: http://localhost:3000/api/v1" -ForegroundColor White
Write-Host "  Docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "  Health: http://localhost:3000/api/v1/health" -ForegroundColor White
Write-Host ""

npm run start:dev
