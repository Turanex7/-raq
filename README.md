# Çıraq

Çıraq Bakıdakı muzey və irs məkanlarını tələbələr üçün həftəlik kəşf və komanda oyununa çevirən mobil uyğun veb tətbiqdir. API XP-ni serverdə hesablayır, SQLite-a yazır və universitet reytinqi ilə “Muzey Fəthi” ərazilərini həmin XP ledger-indən çıxarır.

## Tələblər

- Node.js 22.12+ və npm
- .NET SDK 9

## Lokal başladılma

Terminal 1 — API:

```sh
cd backend/Chiraq.Api
export JWT_SECRET='local-demo-jwt-secret-please-change-32chars'
export QR_HMAC_SECRET='local-demo-qr-secret-please-change-32chars'
export ADMIN_TOKEN='local-demo-admin-token-change-me-now'
export DEMO_MODE=true
dotnet run --no-launch-profile --urls http://localhost:5000
```

İlk start EF migration-larını tətbiq edir və 8 universitet, 10 məkan, 40 fərqli demo istifadəçi, tapşırıqlar, avatarlar və suvenirlər yaradır. Baza `backend/Chiraq.Api/chiraq.db` faylında saxlanır. `JWT_SECRET`, `QR_HMAC_SECRET` və `ADMIN_TOKEN` yalnız lokal demo üçündür; paylaşılmış və ya real mühitdə uzun, gizli dəyərlərlə əvəz et.

Terminal 2 — frontend:

```sh
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Vite `localhost:5173`-də işləyir və `/api` sorğularını `localhost:5000`-ə yönləndirir. `VITE_USE_MOCKS=true` əvvəlki lokal prototipi açır; normal API demo üçün `false` saxla. `VITE_DEMO_MODE=true` demo QR düyməsini göstərir.

Telefon kamerası və GPS üçün secure context lazımdır. Telefonda sınaq üçün HTTPS tuneli istifadə et və API CORS siyahısına tunelin frontend origin-ini `CORS_ORIGINS` ilə əlavə et.

## Əsas demo axını

1. `/login`-də universitet, avatar və son 12 ayda muzey ziyarəti barədə cavabla qeydiyyatdan keç.
2. `/map`-də məkan aç və tapşırıqları yoxla. Muzeydə ilk tapşırıq QR skanıdır.
3. Kameradan QR oxut və ya tapşırıq səhifəsində demo skanı seç.
4. XP breakdown, ilk ziyarət bonusu və suvenir nəticədə görünür; ikinci completion 409 qaytarır.
5. Liderlər, qruplar, muzey ərazisi, suvenirlər, mükafatlar və profil bölmələrini aç.
6. Admin token ilə `/dev/qr-sheet` çap edilə bilən imzalı QR siyahısını göstərir.

Demo admin sorğularında bu başlığı istifadə et: `X-Admin-Token: $ADMIN_TOKEN`.

```sh
curl http://localhost:5000/api/health
curl http://localhost:5000/api/places
curl http://localhost:5000/api/seasons/current
curl -H "X-Admin-Token: $ADMIN_TOKEN" http://localhost:5000/api/dev/qr-sheet
curl -X POST -H "Content-Type: application/json" -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d '{"count":3}' http://localhost:5000/api/admin/demo/simulate-activity
curl -X POST -H "Content-Type: application/json" -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d '{"seasonId":"season-current"}' http://localhost:5000/api/admin/demo/advance-week
```

`/api/admin/demo/advance-week` təqdimatda həftəni vaxtından əvvəl bağlamaq üçündür. Eyni season ID ilə təkrar çağırmaq idempotentdir. Normal həftəlik bağlanmanı server background job-u mövsüm bitdikdən sonra avtomatik edir.

## API müqaviləsi

Sorğular, JSON sahələri və endpoint siyahısı [API müqaviləsi](docs/api-contract.md)-dədir. Bütün xətalar `{ "error": { "code", "message" } }` formatındadır. Uğurlu health cavabı `/api/health`-dədir.

## Yoxlama

```sh
cd frontend
npm test
npm run lint
npm run build
cd ..
dotnet test backend/Chiraq.Api.Tests/Chiraq.Api.Tests.csproj
dotnet build backend/Chiraq.Api/Chiraq.Api.csproj
```

3D səhnə ayrıca yüklənir; daha zəif cihazlarda və `prefers-reduced-motion` aktiv olduqda statik xəritə fallback-i göstərilir. Xəritə plitələri yüklənməsə, API məkan siyahısı işlək qalır.
