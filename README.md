# MailMarketing Monorepo

MailMarketing, .NET 8 + Angular 19 + PostgreSQL tabanli bir e-posta pazarlama uygulamasidir.
Frontend tarafta CoreUI/Bootstrap tabani korunurken PrimeNG'ye kademeli gecis yapilmistir.

## Mimari

- `backend/src/MailMarketing.Domain`: Entity ve enum tanimlari
- `backend/src/MailMarketing.Data`: EF Core DbContext, migration, seed
- `backend/src/MailMarketing.Business`: Is kurallari, JWT/AES, queue ve mail servisleri
- `backend/src/MailMarketing.Api`: Controller, middleware, auth, swagger
- `frontend/mail-marketing-ui`: Angular UI (CoreUI + PrimeNG + Reactive Forms + Guard + Interceptor)

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
npm run start
```

## Frontend UI Durumu (PrimeNG Gecisi)

Mevcut durumda admin panelde PrimeNG gecisi **kademeli** olarak uygulanmistir:

- Admin shell yapisi: `AdminShellComponent`
- PrimeNG demo route: `/admin/ui-demo`
- PrimeNG'ye gecen admin sayfalari:
  - `/admin/send`
  - `/admin/users`
  - `/admin/templates`
  - `/admin/subscribers`

Notlar:

- CoreUI/Bootstrap tamamen kaldirilmamistir; birlikte calismaya devam eder.
- Bu gecis asamasinda davranis/servis/endpoint degil, agirlikli olarak UI katmani degistirilmistir.
- `users` sayfasinda `Rol` kolonu korunmustur (`user.role`).

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

# frontend
cd frontend/mail-marketing-ui
npm install
npm run build
```

Frontend build notu:

- `npm run build` su anda basarilidir.
- Bilinen warningler:
  - `quill-delta` CommonJS/ESM uyari
  - Bazi CSS selector parse warningleri (build'i durdurmaz)

## UI Tests (Selenium)

Selenium testleri `frontend/mail-marketing-ui/tests/selenium/java` altinda Maven ile calisir.

Gerekli ortam degiskenleri:

- `APP_BASE_URL` (varsayilan: `http://localhost:4200`)
- `ADMIN_EMAIL` (varsayilan: `admin@mailmarketing.local`)
- `ADMIN_PASSWORD` (varsayilan: `Admin123!`)
- `HEADLESS` (varsayilan: `true`, gorunur tarayici icin `false`)

Calistirma:

```powershell
# UI ve backend ayakta olduktan sonra
mvn -q test -f frontend/mail-marketing-ui/tests/selenium/java/pom.xml

# veya repo scripti ile
./scripts/selenium-run.ps1
```
