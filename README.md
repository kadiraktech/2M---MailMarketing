# 2M - MailMarketing

2M - MailMarketing, çok dilli Angular yönetim arayüzü ve .NET tabanlı backend katmanıyla; abone yönetimi, şablon yönetimi, toplu gönderim, raporlama, canlı operasyon görünürlüğü ve kural tabanlı kampanya önerileri sunan bir e-posta pazarlama platformudur.

## Genel Bakış

Proje bir monorepo yapısında aşağıdaki ana parçalardan oluşur:

- `frontend/mail-marketing-ui`: Angular 19 tabanlı admin paneli ve herkese açık abonelik arayüzü
- `backend`: .NET 8 API, iş katmanı, domain modelleri, veri erişimi, arka plan worker ve testler
- `docker-compose.yml`: frontend, backend, PostgreSQL, Redis, RabbitMQ ve SonarQube içeren yerel geliştirme stack'i

Ürünün mevcut yönü operasyonel kullanım kolaylığına odaklanır:

- kampanya ve toplu gönderim yönetimi
- admin kullanıcıları için canlı operasyon dashboard'u
- kampanya planlama için kural tabanlı öneri desteği
- öneri akışı ile gerçek gönderim akışının net biçimde ayrılması

## Güncel Mimari

### Frontend

- Angular 19 standalone component yapısı
- PrimeNG bileşenleri
- Türkçe / İngilizce dil desteği için `ngx-translate`
- kimlik doğrulamalı admin shell yapısı
- herkese açık abonelik sayfası

### Backend

- .NET 8 Web API
- API, Business, Data ve Domain katmanlarına ayrılmış yapı
- PostgreSQL üzerinde Entity Framework Core
- JWT tabanlı kimlik doğrulama ve role-aware admin erişimi
- polling tabanlı arka plan mail queue worker

### Altyapı

- uygulama verisi için PostgreSQL
- yerel stack içinde Redis
- yerel stack içinde RabbitMQ
- Docker ve Docker Compose ile hızlı yerel çalışma

Notlar:

- RabbitMQ ortamda hazırdır ve sağlık çıktısında dürüst biçimde gösterilir; ancak aktif mail gönderim akışının bir parçası değildir.
- Kampanya öneri sistemi şu an kural tabanlıdır ve gelecekte gerçek bir sağlayıcı eklenebilecek şekilde tasarlanmıştır; gerçek LLM entegrasyonu yoktur.

## Başlıca Özellikler

### Admin Ürün Alanları

- Dashboard
- Subscribers
- Templates
- Send
- Reporting
- Settings
- Users
- Profile

### Abone ve Kampanya Operasyonları

- herkese açık bülten aboneliği
- abone listeleme, filtreleme ve yönetimi
- aktif / pasif durumlu şablon yönetimi
- kimlik doğrulamalı toplu gönderim kuyruğu oluşturma
- send item ve batch bazlı raporlama

### Canlı Admin Dashboard

Admin dashboard, artık polling tabanlı canlı operasyon görünümü sunar:

- kuyruk metrikleri
  - toplam bekleyen iş
  - işlenmekte olan işler
  - retry bekleyen işler
- gönderim metrikleri
  - aktif gönderim operasyonları
  - başarılı gönderim sayısı
  - başarısız gönderim sayısı
- son aktivite listesi
- sistem sağlık özeti
  - API
  - veritabanı
  - RabbitMQ
  - worker heartbeat

Uygulama notları:

- frontend her 10 saniyede bir güncellenir
- backend sağlık çıktısı gerçeği yansıtır
- worker sağlık durumu hafif bir in-memory heartbeat ile izlenir
- mevcut sürümde WebSocket kullanılmaz

### Kampanya Öneri Motoru

Send sayfasında admin / campaign manager kullanımına uygun bir öneri akışı bulunur.

Desteklenen kampanya hedefleri:

- `ProductLaunch`
- `DiscountOffer`
- `ReEngagement`
- `Newsletter`
- `SpecialAnnouncement`

Mevcut öneri alanları:

- konu başlığı önerileri
- hedef kitle / segment önerileri
- gönderim zamanı önerileri
- performans / hata içgörüleri

Öneri deneyimi prensipleri:

- öneri + inceleme + kullanıcı onayı
- otomatik gönderim yok
- send akışına otomatik uygulama yok
- deterministik ve açıklanabilir çıktı

### İçgörü Sinyal Kategorileri ve Sağlayıcı Metadatası

Öneri içgörüleri şu hafif sinyal kategorilerini destekler:

- `Opportunity`
- `Caution`
- `DeliveryStrategy`
- `AudienceFit`
- `MessagingQuality`

Öneri yanıtları ayrıca gelecekteki sağlayıcı evrimine alan açan metadata da taşır:

- sağlayıcı adı ve görünen adı
- provider type
- generation mode
- explanation style
- recommendation version

Bu alanlar bugünkü yetenekleri abartmadan, ileride gerçek sağlayıcı entegrasyonuna temiz geçiş için eklenmiştir.

## Demo Verisi ve Ekran Görüntüsü Hazırlığı

Geliştirme ortamında proje, anlamlı demo ekranları için kontrollü bir demo veri hikayesi üretebilir.

### Demo Hikayesi

Demo veri akışı sistemi şu aralıkta aktif şekilde test edilmiş gibi gösterir:

- başlangıç: `2026-03-22`
- bitiş: `2026-03-31`

Bu demo veri seti şunları içerir:

- yaklaşık 90 demo subscriber
- aktif ve pasif abone karışımı
- 6 anlamlı template
- birden çok güne dağıtılmış send batch geçmişi
- başarılı ve başarısız gönderimler
- retry bekleyen queue kayıtları
- halen çalışan bir batch görünümü
- dashboard ve reporting için son aktivite verileri

### Demo Seed Davranışı

- demo verisi yalnızca development başlangıcında seed edilir
- tekrar tekrar aynı veriyi çoğaltmamak için marker kontrollü ve idempotent çalışır
- `DEMO_SEED_ENABLED=false` verilirse demo seed kapatılabilir

### Demo Verisini Yeniden Üretme

Fresh demo durumu için:

```powershell
./scripts/demo-reseed.ps1
```

Bu script:

1. mevcut Docker Compose stack'ini durdurur
2. veritabanı volume'unu temizler
3. stack'i yeniden build edip ayağa kaldırır
4. seed akışıyla demo veriyi yeniden üretir

### Demo Verisini Temizleme

Sadece temizlemek isterseniz:

```powershell
docker compose down -v
```

Sonrasında yeniden başlatmak için:

```powershell
docker compose up -d --build
```

## Teknoloji Yığını

### Frontend

- Angular 19
- TypeScript
- PrimeNG
- ngx-translate

### Backend

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core
- Npgsql / PostgreSQL

### Altyapı

- Docker
- Docker Compose
- PostgreSQL 16
- Redis 7
- RabbitMQ 3 Management
- SonarQube Community

### Test ve Doğrulama

- .NET unit testleri
- host `npm` yoksa Docker tabanlı Angular build doğrulaması
- `frontend/tests` altında Selenium test projesi

## Depo Yapısı

```text
frontend/
  mail-marketing-ui/

backend/
  src/
  tests/

scripts/
docker-compose.yml
README.md
```

## Docker ile Yerel Çalıştırma

Tam stack'i başlatmak için:

```bash
docker compose up -d --build
```

Ana URL ve portlar:

- Admin UI: `http://localhost:4200/admin`
- Public subscribe sayfası: `http://localhost:4200/subscribe`
- Backend API: `http://localhost:5000`
- Swagger UI: `http://localhost:5000/swagger/index.html`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- RabbitMQ AMQP: `localhost:5672`
- RabbitMQ Management: `http://localhost:15672`
- SonarQube: `http://localhost:9000`

Varsayılan geliştirme kullanıcıları:

- Admin: `admin@mailmarketing.local` / `Admin123!`
- User: `user@mailmarketing.local` / `User123!`

## Frontend Geliştirme

```bash
cd frontend/mail-marketing-ui
npm install
npm start
```

## Backend Geliştirme

```bash
dotnet build backend/MailMarketing.sln
dotnet test backend/MailMarketing.sln
```

## Doğrulama Notları

Yakın zamanda doğrulanan alanlar:

- canlı admin dashboard frontend ve backend
- live-dashboard polling endpoint'i
- worker heartbeat telemetry
- kural tabanlı kampanya öneri backend'i
- send sayfasındaki öneri akışı
- insight signal categories
- provider metadata gösterimi
- demo seed ve screenshot hazırlık akışı

Bu depoda kullanılan doğrulama yaklaşımı:

- backend solution build
- backend testleri
- gerekirse Docker tabanlı Angular build

## Öneri Motoru Durumu

Öneri motoru şu anda:

- kural tabanlı
- deterministik
- açıklanabilir
- review-first akışlar için güvenli
- gelecekte provider genişlemesine hazır

Şu anda olmayanlar:

- gerçek LLM üretimi
- otomatik gönderim optimizasyonu
- kişiselleştirilmiş model skorlama
- confidence tabanlı ML çıktısı

## Lisans

MIT License

## Yazar

Kadir Ak  
GitHub: https://github.com/kadiraktech
