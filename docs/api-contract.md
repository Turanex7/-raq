# Çıraq API müqaviləsi

Base URL: `http://localhost:5000/api`. Tarixlər UTC ISO-8601 formatındadır; həftə sərhədləri `Asia/Baku` ilə hesablanır. Auth tələb edən yollar `Authorization: Bearer <token>` qəbul edir. Admin demo və QR sheet yolları `X-Admin-Token: <ADMIN_TOKEN>` tələb edir.

## Ümumi

| Method | Yol | Auth | Təsvir |
|---|---|---|---|
| GET | `/health` | Yox | API statusu |
| GET | `/config` | Yox | XP, qrup, reytinq və zona parametrləri |
| GET | `/universities` | Yox | Universitetlər və qısa adlar |
| GET | `/avatars` | Yox | Avatarlar və açılma səviyyələri |
| GET | `/places` | Yox | Məkan statusu, koordinat, tapşırıq sayı və cari ərazi sahibi |
| GET | `/places/{slug}` | Yox | Məkan detalı, tapşırıqlar, öz completion statusun və ərazi |
| GET | `/seasons/current` | Yox | Mövsüm başlanğıcı/sonu, mövzu və qalan saniyə |

## Hesab və oyun

| Method | Yol | Auth | Sorğu |
|---|---|---|---|
| POST | `/auth/register` | Yox | `{ name, email, password, universityId, avatarId?, visitedMuseumLast12Months? }` |
| POST | `/auth/login` | Yox | `{ email, password }` |
| GET | `/me` | Bəli | Profil, lifetime/həftəlik XP və səviyyə |
| PATCH | `/me` | Bəli | `{ name?, avatarId? }` |
| POST | `/checkins` | Bəli | `{ placeId, latitude, longitude, accuracy }`; koordinatlar validasiyadan sonra saxlanmır |
| POST | `/tasks/{id}/complete` | Bəli | `{ qrToken?, answer?, latitude?, longitude?, accuracy? }`; XP yalnız serverdə hesablanır |
| POST | `/coop/{taskId}/join` | Bəli | `{ qrToken? }`; co-op qrupu/lobby sessiyasına qoşul |
| GET | `/coop/{sessionId}` | Bəli | Sessiya iştirakçıları və tamamlanma statusu |

Completion cavabı `xp_awarded`, `breakdown`, `new_total`, `level_up`, `avatar_unlocked`, `souvenir_drop`, `territory_change`, `correct_answer` və `fact` sahələrini verir. Eyni user/task/season completion ikinci dəfə `409 already_completed` qaytarır.

## Reytinq, qruplar, kolleksiya və mükafat

| Method | Yol | Auth | Sorğu |
|---|---|---|---|
| GET | `/leaderboard?scope=global\|university\|league\|open` | Bəli | Scope query; universitet liqası top-10 aktiv üzvün ortalamasıdır, minimum 3 iştirakçı |
| GET | `/territories` | Yox | Cari mövsüm üzrə fəth sahibləri |
| POST | `/groups` | Bəli | `{ name }`, dəvət kodu yaradır |
| POST | `/groups/join` | Bəli | `{ inviteCode }` |
| GET | `/groups/me` | Bəli | Qrup, üzvlər və dəvət kodu |
| GET | `/me/collection` | Bəli | Qazanılmış və buraxılmış mövsümi suvenirlər |
| GET | `/rewards/current` | Bəli | Həftə içi ilkin namizədlər, yekun mövsümdə qaliblər |
| POST | `/rewards/claim` | Bəli | `{ studentEmail, studentId }`; manual yoxlama üçün müraciət |
| GET | `/me/share-card?placeId={id}` | Bəli | Paylaşım kartı üçün məkan, XP, sıralama və ərazi statusu |

## Demo və admin

| Method | Yol | Auth | Sorğu |
|---|---|---|---|
| GET | `/admin/metrics` | Admin | Real DB count-lar: yeni istifadəçi, muzey ziyarəti, ilk ziyarət, yer/universitet statistikası, retention |
| POST | `/admin/demo/simulate-activity` | Admin + `DEMO_MODE=true` | `{ count: 1..20 }` |
| POST | `/admin/demo/advance-week` | Admin + `DEMO_MODE=true` | `{ seasonId }`; həftəni demo üçün erkən yekunlaşdırır |
| GET | `/dev/qr-sheet` | Admin | Bütün task-lar üçün imzalı QR payload-lar |
| GET | `/demo/qr/{taskId}` | `DEMO_MODE=true` | Demo QR payload; yalnız demo rejimində aktivdir |

Admin header nümunəsi: `X-Admin-Token: <ADMIN_TOKEN>`. API səhvləri vahid formatdadır: `{ "error": { "code": "...", "message": "..." } }`.
