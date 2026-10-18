# Çıraq

Çıraq Bakıdakı muzey və irs məkanlarını tələbələr üçün həftəlik kəşf və komanda oyununa çevirən mobil uyğun veb tətbiqdir. API XP-ni serverdə hesablayır, SQLite-da saxlayır və universitet reytinqini, muzey ərazilərini həmin qeydlərdən çıxarır.

## Tələblər

- Node.js 22.12+ və npm
- .NET SDK 9
- macOS/Linux üçün Bash

## Quick start

Repo kökündə:

```sh
cp -n backend/Chiraq.Api/.env.example backend/Chiraq.Api/.env
cp -n frontend/.env.example frontend/.env
npm --prefix frontend ci
scripts/dev.sh
```

Tətbiq `http://localhost:5173` ünvanında, API isə `http://localhost:5099` portunda açılır. İlk başladılmada API SQLite miqrasiyalarını tətbiq edir və seed məlumatı yaradır. Demo üçün `DEMO_MODE=true` aktivdir; `ADMIN_TOKEN` verilməyibsə, lokal admin açarı terminalda göstərilir. `scripts/smoke.sh` health, məkan və liderlər API-lərini yoxlayır. API girişi tələb olunan liderlər yoxlaması üçün `API_AUTH_TOKEN` ver; əks halda smoke skripti düzgün `401` cavabını yoxlayır.

## Reset demo data

Əvvəlcə `scripts/dev.sh` prosesini `Ctrl+C` ilə dayandır, sonra:

```sh
scripts/reset-db.sh
```

Skript mövcud SQLite bazasının ehtiyat nüsxəsini `.backup-TARIX` adı ilə saxlayır, bazanı yenidən qurur və demo məlumatını əlavə edir. Başqa fayl istifadə etmək üçün `CHIRAQ_DB_PATH=/tam/yol/demo.db` ver. Resetdən sonra tətbiqi yenidən `scripts/dev.sh` ilə başlat.

## Phone testing

Telefon və kompüter eyni Wi-Fi şəbəkəsində olduqda `scripts/dev.sh` terminalda LAN ünvanını göstərir; telefonu həmin ünvandakı `:5173` portuna yönəlt. HTTP LAN səhifəsində kameraya və GPS-ə brauzer icazə verməyə bilər, çünki bu API-lər HTTPS secure context tələb edir.

HTTPS üçün kompüterdə LAN IP-ni əhatə edən və telefonda etibarlı sayılan sertifikat yarat. Məsələn, `mkcert -install` et, sonra `mkcert 192.168.1.24` (öz LAN IP-ni yaz) işlət. Sertifikatın yolunu `frontend/.env` faylında qeyd et və Vite-i yenidən başlat:

```dotenv
VITE_HTTPS_CERT=/tam/yol/192.168.1.24.pem
VITE_HTTPS_KEY=/tam/yol/192.168.1.24-key.pem
```

Telefonun həmin sertifikat səlahiyyət mərkəzini etibarlı sayması lazımdır. Backend `.env` faylında `CORS_ORIGINS__1=https://192.168.1.24:5173` əlavə et ki, proxy sorğuları HTTPS səhifəsinin origin-i ilə uyğun gəlsin.

## Demo axını

1. `/login` səhifəsində universitet və profil məlumatları ilə qeydiyyatdan keç.
2. Xalça Muzeyinin detalında cari sahib, xal fərqi və `Fəth et` çağırışını gör.
3. Tapşırığı QR ilə və ya demo skanı ilə tamamla; nəticədə XP bölgüsü, səviyyə irəliləyişi və suvenir göstərilir.
4. Universitet Liqasında xalı və iştirakçı sayını yoxla.
5. `/dev/demo` səhifəsində admin açarını daxil edib ərazi dəyişikliyini və həftə sonunu nümayiş etdir.

## API və yoxlamalar

Sorğular, JSON sahələri və endpoint siyahısı [API müqaviləsi](docs/api-contract.md)-dədir. Bütün xətalar `{ "error": { "code", "message" } }` formatındadır. Health cavabı `/api/health` ünvanındadır. Seed məkan və tapşırıqlarının insan tərəfindən yoxlama siyahısı [məzmun yoxlaması sənədində](docs/CONTENT_REVIEW.md) verilib; təsdiqədək tapşırıqlar nəzərdən keçirilmə vəziyyətində qalır.

```sh
scripts/smoke.sh
cd frontend && npm test && npm run lint && npm run build
cd .. && dotnet test backend/Chiraq.Api.Tests/Chiraq.Api.Tests.csproj
dotnet build backend/Chiraq.Api/Chiraq.Api.csproj
```

3D səhnə ayrıca yüklənir; zəif cihazlarda və `prefers-reduced-motion` aktiv olduqda statik xəritə fallback-i görünür. Xəritə plitələri yüklənməsə, API məkan siyahısı işlək qalır.
