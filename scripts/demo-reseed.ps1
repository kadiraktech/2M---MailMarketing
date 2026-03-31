$ErrorActionPreference = 'Stop'

Write-Host 'Resetting demo stack and regenerating seeded demo data...'
docker compose down -v
docker compose up -d --build

Write-Host ''
Write-Host 'Demo stack is rebuilding with a fresh database volume.'
Write-Host 'Admin UI: http://localhost:4200/admin'
Write-Host 'API Swagger: http://localhost:5000/swagger/index.html'
Write-Host 'Default admin user: admin@mailmarketing.local'
Write-Host 'Default admin password: Admin123!'
