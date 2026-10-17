# 🏛️ Visit-to-Earn

> **Explore culture. Complete quests. Earn XP.**  
> Azərbaycan muzeylərini və mədəni irs məkanlarını interaktiv oyuna çevirən mobil-uyğun veb platforma.

## 📌 Layihə haqqında

**Problem:** Gənclər üçün ənənəvi muzey ziyarətləri bəzən passiv və maraqsız görünür.

**Həll:** İstifadəçilər xəritədə muzeyləri kəşf edir, muzeylə bağlı quest-ləri tamamlayır, XP və rəqəmsal suvenirlər qazanır, universitetlərarası reytinqdə yarışırlar.

**Hakaton MVP məqsədi:** Münsiflərə **xəritə → muzey → quest → QR/quiz → XP → profil/leaderboard** ardıcıllığını canlı göstərmək.

> ⚠️ **Demo məhdudiyyəti:** Statik QR kodun fotosu başqasına ötürülə bilər; təkcə QR skanı fiziki iştirakın etibarlı sübutu deyil. MVP-də QR + quiz və server tərəfli təkrar-completion yoxlaması istifadə olunur. Real muzeydə stiker yerləşdirmək üçün icazə tələb olunur.

## 🧰 Texnologiyalar

| Lay | Texnologiya |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS |
| Backend | ASP.NET Core Web API (C#) |
| Database | PostgreSQL (Supabase host edilə bilər) |
| ORM | Entity Framework Core + Npgsql |
| Xəritə | React Leaflet + OpenStreetMap |
| QR | `html5-qrcode` |
| Versiya nəzarəti | Git + GitHub Pull Requests |

**Auth qərarı:** Komanda ilkin mərhələdə **bir** auth yanaşması seçməlidir (məsələn, Supabase Auth və ya ASP.NET Identity). MVP üçün demo istifadəçi ilə başlamaq olar; bu, production autentifikasiyası deyil.

## 👥 Komanda və iş bölgüsü

| Üzv | Səviyyə | Məsuliyyət | Branch | Öz sahəsi |
| --- | --- | --- | --- | --- |
| DEV 1 | Güclü | .NET API, DB, XP və completion qaydaları | `feature/backend` | `backend/`, `database/` |
| DEV 2 | Güclü | React core, routing, map, QR, API inteqrasiyası | `feature/frontend-core` | `frontend/src/app/`, `features/auth/`, `features/map/`, `features/scanner/`, `services/` |
| DEV 3 | İnkişaf edən | Profil, XP bar, avatar, rewards, leaderboard UI | `feature/gamification` | `frontend/src/features/gamification/` |
| DEV 4 | İnkişaf edən | Muzey detalları, quest kartları, quiz UI və məzmun | `feature/museums` | `frontend/src/features/museums/` |

### Paralel işləmə qaydası

1. **İlk 15–20 dəqiqə:** DEV 2 minimal React/Vite skeleton, DEV 1 minimal .NET Web API skeleton hazırlayıb `main`-ə PR vasitəsilə daxil edir. Bu arada DEV 3 və DEV 4 komponentlərini ayrıca feature qovluqlarında yaza bilərlər.
2. **Hamı eyni vaxtda:** DEV 1 backend-i yazır; DEV 2 map və əsas axını hazırlayır; DEV 3 və DEV 4 öz səhifələrini **mock data** ilə müstəqil hazırlayırlar.
3. **İnteqrasiya:** DEV 2 hazır komponentləri router-ə qoşur və mock data-nı API çağırışları ilə əvəz edir. DEV 1 endpoint-ləri sabit saxlayır.
4. **Test:** Bir demo istifadəçi ilə tam axın yoxlanır; səhvlər düzəldilir; təqdimata hazır versiya `main`-də saxlanır.

**Fayl sahibliyi:** DEV 3/4 `App.jsx`, `router.jsx`, `package.json`, `main.jsx`, ümumi CSS və ortaq konfiqurasiyaları dəyişmir. Dəyişiklik lazımdırsa DEV 2-yə bildirirlər. Heç kim başqasının feature qovluğunu icazəsiz redaktə etmir.

## 📁 Repository strukturu

```text
visit-to-earn/
├── backend/                              # DEV 1
│   ├── VisitToEarn.Api/
│   │   ├── Controllers/
│   │   │   ├── MuseumsController.cs
│   │   │   ├── QuestsController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── RewardsController.cs
│   │   │   └── LeaderboardController.cs
│   │   ├── Models/
│   │   │   ├── User.cs
│   │   │   ├── Museum.cs
│   │   │   ├── Quest.cs
│   │   │   ├── QuestCompletion.cs
│   │   │   └── Reward.cs
│   │   ├── DTOs/
│   │   ├── Data/AppDbContext.cs
│   │   ├── Services/
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── VisitToEarn.Api.csproj
│   └── VisitToEarn.sln
├── frontend/
│   ├── public/images/
│   ├── public/avatars/
│   ├── src/
│   │   ├── app/                           # DEV 2
│   │   │   ├── App.jsx
│   │   │   ├── router.jsx
│   │   │   └── AppLayout.jsx
│   │   ├── features/
│   │   │   ├── auth/                       # DEV 2
│   │   │   ├── map/                        # DEV 2
│   │   │   ├── scanner/                    # DEV 2
│   │   │   ├── gamification/               # DEV 3
│   │   │   │   ├── ProfilePage.jsx
│   │   │   │   ├── LeaderboardPage.jsx
│   │   │   │   ├── RewardsPage.jsx
│   │   │   │   ├── components/
│   │   │   │   └── mockData.js
│   │   │   └── museums/                    # DEV 4
│   │   │       ├── MuseumDetailPage.jsx
│   │   │       ├── QuestPage.jsx
│   │   │       ├── QuizPage.jsx
│   │   │       ├── components/
│   │   │       └── mockData.js
│   │   ├── services/                      # DEV 2
│   │   │   ├── api.js
│   │   │   ├── museumService.js
│   │   │   └── questService.js
│   │   ├── components/                    # DEV 2: shared UI
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
├── database/                              # DEV 1
├── docs/
│   ├── api-contract.md                    # DEV 1 + DEV 2
│   └── demo-script.md
├── .gitignore
└── README.md
```

> **Qeyd:** Bu, **hədəf strukturdur**; README-nin yerləşdirilməsi bu faylları avtomatik yaratmır. İlk mərhələdə skeleton faylları əlavə olunacaq. Git boş qovluqları saxlamır.

## 🎯 Konkret tasklar və qəbul meyarları

### DEV 1 — Backend (`feature/backend`)

- [ ] ASP.NET Core Web API yarat, CORS və lokal konfiqurasiyanı qur.
- [ ] PostgreSQL bağlantısı və EF Core modelləri/migrations əlavə et.
- [ ] `Museum`, `Quest`, `User`, `QuestCompletion`, `Reward` modellərini qur.
- [ ] Muzey və quest-lər üçün GET endpoint-ləri yaz.
- [ ] Quest completion üçün POST endpoint yaz: QR/quiz məlumatını yoxla, təkrar completion-a icazə vermə, XP-ni serverdə hesabla.
- [ ] Profil, rewards və leaderboard endpoint-ləri yaz.
- [ ] Demo seed data və API test nümunələri hazırla.

**Hazır sayılır:** API işə düşür; ən azı 2 muzeyin məlumatı qaytarılır; düzgün quest completion XP verir, eyni quest ikinci dəfə XP vermir; səhv kod rədd olunur.

### DEV 2 — Core Frontend (`feature/frontend-core`)

- [ ] React + Vite + Tailwind layihəsini qur; routing və ümumi layout əlavə et.
- [ ] Xəritədə muzey pin-lərini göstər.
- [ ] Muzey pin-inə kliklədikdə detail səhifəsinə keçid yarat.
- [ ] QR scanner və scan nəticəsi UI yaz.
- [ ] `services/` içində API client yarat; loading/error halları göstər.
- [ ] DEV 3/4 səhifələrini router-ə qoş; inteqrasiya və mobil responsivliyi yoxla.

**Hazır sayılır:** Brauzerdə xəritə açılır, muzey seçilir, quest-ə keçilir, QR/quiz axını işləyir və uğurlu completion nəticəsi görünür.

### DEV 3 — Gamification UI (`feature/gamification`)

- [ ] `ProfilePage.jsx`: avatar, ad, universitet, level və XP.
- [ ] `XPProgressBar.jsx`: cari XP və növbəti səviyyəyə progress.
- [ ] `LeaderboardPage.jsx`: istifadəçilər/universitetlər üçün reytinq.
- [ ] `RewardsPage.jsx`: qazanılmış rəqəmsal suvenirlər.
- [ ] `mockData.js`: real API formatına uyğun demo məlumatlar.

**Hazır sayılır:** Səhifələr mock data ilə işləyir, mobil görünüş uyğundur, komponentlər öz qovluğundan import edilə bilir.

### DEV 4 — Museums & Quests (`feature/museums`)

- [ ] `MuseumDetailPage.jsx`: şəkil, təsvir, ünvan və quest siyahısı.
- [ ] `QuestPage.jsx` və `QuestCard.jsx`: tapşırıq detalları və XP.
- [ ] `QuizPage.jsx`: sual, variantlar, cavabın seçilməsi və nəticə UI.
- [ ] `mockData.js`: ən azı 2 muzey, hərəsinə 3 quest.
- [ ] Demo məzmunun faktlarını yoxla; lazım olduqda mənbə linklərini qeyd et.

**Hazır sayılır:** Muzeydən quest-ə, quest-dən quiz-ə keçid işləyir; mock data backend formatına uyğundur.

## 🔌 API contract (MVP)

Bütün API yollarının prefiksi: `/api`. DEV 1 və DEV 2 implementasiyadan əvvəl **ID formatı, response field-ləri, auth və error formatını** təsdiqləməlidir. Aşağıdakılar ilkin müqavilədir.

| Method | Endpoint | Nəticə |
| --- | --- | --- |
| GET | `/api/museums` | Muzey siyahısı |
| GET | `/api/museums/{id}` | Muzey detalları |
| GET | `/api/museums/{id}/quests` | Muzey quest-ləri |
| POST | `/api/quests/{id}/complete` | Cavabı təsdiqlə, XP/reward ver |
| GET | `/api/users/me` | İstifadəçi profili |
| GET | `/api/users/me/rewards` | Suvenirlər |
| GET | `/api/leaderboard?type=university` | Universitet reytinqi |

### Nümunə quest response

```json
{
  "id": "quest_001",
  "museumId": "museum_001",
  "title": "Find the Buta",
  "description": "Buta simvolunu tap və suala cavab ver",
  "xp": 100,
  "type": "qr_quiz",
  "completed": false
}
```

### Nümunə completion request

```http
POST /api/quests/quest_001/complete
Content-Type: application/json
Authorization: Bearer <access-token>

{
  "qrToken": "DEMO_BUTA_TOKEN",
  "answerId": "option_b"
}
```

### Nümunə uğurlu cavab

```json
{
  "success": true,
  "xpEarned": 100,
  "totalXp": 350,
  "rewardId": "reward_buta"
}
```

**Server qaydası:** `xp` request-dən qəbul edilmir. İstifadəçi ID-si autentifikasiya edilmiş sessiyadan götürülür; client tərəfindən göndərilən `userId`-yə etibar edilmir. Completion əməliyyatı transaction və `(user_id, quest_id)` unique constraint ilə qorunur. Auth hazır olmayana qədər ayrıca və aydın işarələnmiş demo rejimindən istifadə edin.

## 💻 Lokal işə salma

### Tələblər

- Git
- Node.js LTS və npm
- .NET SDK (**komandanın seçdiyi eyni versiya**, məsələn .NET 8)
- PostgreSQL verilənlər bazası (lokal və ya Supabase)

### 1. Repo-nu klonla

```bash
git clone https://github.com/OWNER/visit-to-earn.git
cd visit-to-earn
```

`OWNER` hissəsini real GitHub owner adı ilə əvəz edin.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite terminalda lokal URL göstərəcək (adətən `http://localhost:5173`). Frontend skeleton-u yaradıldıqdan sonra bu komandalar işləyəcək.

`frontend/.env.example` nümunəsi:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

`.env.example`-dan `.env` yaradın və faktiki backend URL/port-a uyğunlaşdırın. **`VITE_` dəyişənləri brauzerdə görünür: secret və database parollarını ora yazmayın.**

### 3. Backend

```bash
cd backend/VisitToEarn.Api
dotnet restore
dotnet run
```

API portunu terminaldan götürün; frontend URL-ni həmin porta uyğunlaşdırın. DB connection string və digər secret-lər `appsettings.json`-a commit edilməməlidir; lokal `dotnet user-secrets` və ya environment variables istifadə edin. Migrations hazırlandıqdan sonra DEV 1 onların tətbiqi qaydasını sənədləşdirəcək.

> **Hazırkı status:** Bunlar layihə skeleton-u yaradıldıqdan sonra istifadə olunacaq komandalar və konfiqurasiya nümunələridir; bu README özü işləyən app təqdim etmir.

## 🌿 Git və Pull Request qaydaları

### Branch açmaq

```bash
git switch main
git pull origin main
git switch -c feature/gamification
```

Hər kəs `feature/gamification` yerinə **öz branch adını** yazır. Branch artıq varsa: `git switch feature/gamification`.

### Dəyişiklikləri göndərmək

```bash
git status
git add .
git commit -m "feat: add profile and leaderboard UI"
git push -u origin feature/gamification
```

GitHub-da **Pull Request → base: `main` → compare: öz branch-in**. Başqa bir komanda üzvü kodu yoxlayır, sonra merge edilir.

### Komanda qaydaları

1. **Birbaşa `main`-ə push etməyin.** GitHub branch protection/ruleset imkan varsa aktivləşdirin.
2. Hər PR kiçik və aydın olsun; dəyişiklikləri və test addımlarını təsvir edin.
3. Eyni faylı paralel redaktə etməyin; ortaq faylların sahibi DEV 2-dir.
4. `main`-dəki yenilikləri almaq üçün öz branch-inizdə `git fetch origin && git merge origin/main` edin; conflict yaranarsa həmin faylın sahibi ilə həll edin.
5. `.env`, parol, token, service-role key, `node_modules/`, `bin/`, `obj/` commit etməyin.
6. PR merge edilməzdən əvvəl ən azı lokal build/test və əsas UI yoxlaması aparın.

**Commit mesajı nümunələri:** `feat: add museum map`, `fix: prevent duplicate XP`, `docs: update API contract`.

## 🚀 MVP prioritetləri

| Prioritet | Funksiya | Qərar |
| --- | --- | --- |
| P0 | Xəritə və muzey siyahısı | Mütləq |
| P0 | Quest + QR/quiz + server XP | Mütləq |
| P0 | Profil və leaderboard demo | Mütləq |
| P1 | Rəqəmsal suvenirlər | Vaxt qalarsa |
| P1 | Avatar customization | Vaxt qalarsa |
| P2 | Co-op quest, dinamik QR, real partnyor paneli | MVP-dən sonra |

## 🧪 Demo ssenarisi

1. Demo istifadəçi tətbiqi açır və Bakı xəritəsini görür.
2. Xalça Muzeyini seçir və **Buta Quest**-i açır.
3. Demo QR kodunu skan edir və sualı cavablandırır.
4. Server completion-u yoxlayır, **+100 XP** qaytarır.
5. Profilin XP-si yenilənir; leaderboard-da yeni nəticə görünür.
6. Eyni quest təkrar tamamlananda əlavə XP verilmədiyi göstərilir.

**Demo ehtiyat planı:** İnternet/kamera icazəsi problem yaratsa, əvvəlcədən çəkilmiş qısa video və ya açıq şəkildə *demo mode* adlandırılmış test axını hazır olsun.

## ✅ Final checklist

- [ ] Dörd developer öz branch-ində işləyib PR açıb.
- [ ] Frontend və backend lokal olaraq işə düşür.
- [ ] API response formatları frontend ilə uyğundur.
- [ ] Xəritədən quest completion-a qədər tam axın işləyir.
- [ ] Təkrar completion XP vermir.
- [ ] Mobil ekran ölçülərində əsas səhifələr düzgün görünür.
- [ ] Secret-lər GitHub-a göndərilməyib.
- [ ] Deployment və demo ssenarisi test olunub.

---

**Visit-to-Earn — Mədəniyyəti kəşf et, tapşırıqları tamamla, XP qazan!**
