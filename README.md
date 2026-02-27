# MailMarketing Monorepo

MailMarketing, .NET 8 + Angular + PostgreSQL tabanli bir e-posta pazarlama uygulamasidir.

## Mimari

- `backend/src/MailMarketing.Domain`: Entity ve enum tanimlari
- `backend/src/MailMarketing.Data`: EF Core DbContext, migration, seed
- `backend/src/MailMarketing.Business`: Is kurallari, JWT/AES, queue ve mail servisleri
- `backend/src/MailMarketing.Api`: Controller, middleware, auth, swagger
- `frontend/mail-marketing-ui`: Angular UI (CoreUI + Reactive Forms + Guard + Interceptor)

## Gereksinimler

- .NET SDK 8
- Node.js 20+
- Docker Desktop

## Ortam Degiskenleri

`.env.example` dosyasini `.env` olarak kopyalayin.

`APP_AES_KEY` zorunludur ve **Base64 formatinda 32-byte** olmalidir.

PowerShell ile anahtar uretimi:

```powershell
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
[Convert]::ToBase64String($bytes)
```

Uretilen degeri `.env` dosyasindaki `APP_AES_KEY=` satirina yazin.

Opsiyonel seed sifre degiskenleri:

- `SEED_ADMIN_PASSWORD`
- `SEED_USER_PASSWORD`

## Docker ile Calistirma

```powershell
docker compose up --build -d
docker compose ps
```

Servisler:

- API: `http://localhost:5000`
- UI: `http://localhost:4200`
- PostgreSQL: `localhost:5432`

Eger eski/bozuk migration state kaynakli backend cikislari gorurseniz:

```powershell
docker compose down -v
docker compose up --build -d
```

## Local Calistirma

### Backend

```powershell
$env:APP_AES_KEY="<32-byte-base64-key>"
$env:ConnectionStrings__Default="Host=localhost;Port=5432;Database=mailmarketing;Username=postgres;Password=postgres"
dotnet restore backend/MailMarketing.sln
dotnet build backend/MailMarketing.sln
dotnet run --project backend/src/MailMarketing.Api/MailMarketing.Api.csproj
```

### Frontend

```powershell
cd frontend/mail-marketing-ui
npm install
ng serve
```

## SMTP ve Batch Akisi

SMTP ayari olmadan kuyruk isleri olusturulsa bile gonderim basarili olmaz.

1. `/admin/settings` ekraninda SMTP bilgilerini kaydet.
2. `/admin/templates` ekraninda bir template olustur.
3. `/admin/send` ekraninda template ID ile `Batch Olustur`.

`Batch`, tek seferde birden fazla aboneye gonderim icin olusturulan toplu is kaydidir.
Sistem her batch icin:

- `SendBatch` kaydi olusturur
- her alici icin `SendItem` olusturur
- `SendJobQueue` ile background worker'a kuyruklar

Sonuc takibi: `/admin/reporting`.

## Migration Akisi (Yeniden Uretilebilir)

> Migration dosyalari elle degistirilmemeli.

```powershell
dotnet ef migrations add <MigrationName> --project backend/src/MailMarketing.Data --startup-project backend/src/MailMarketing.Api --output-dir Persistence/Migrations
dotnet ef database update --project backend/src/MailMarketing.Data --startup-project backend/src/MailMarketing.Api
```

Development ortaminda API acilisinda otomatik:

- `Database.MigrateAsync()`
- `DbSeeder.SeedAsync(...)`

## Hizli Test

- Swagger: `http://localhost:5000/swagger`
- UI: `http://localhost:4200`
- Admin login: `admin@mailmarketing.local / Admin123!`
- User login: `user@mailmarketing.local / User123!`

## Dogrulama Komutlari

```powershell
# opsiyonel format
dotnet format backend/MailMarketing.sln

# test
dotnet test backend/MailMarketing.sln

# build
dotnet build backend/MailMarketing.sln

# docker
docker compose up --build -d
docker compose ps
```
