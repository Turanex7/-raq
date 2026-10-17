# Çıraq · canlı demo ssenarisi

## Hazırlıq

1. README-dəki qayda ilə API-ni və Vite frontend-i başladırıq.
2. Admin üçün `.env`-də `DEMO_MODE=true` və `ADMIN_TOKEN` dəyəri qoyuruq.
3. `/dev/qr-sheet` səhifəsində admin token daxil edib imzalı QR siyahısını açırıq. Alternativ olaraq `/api/demo/qr/{taskId}` yalnız demo rejimində QR payload qaytarır.

## 3 dəqiqəlik axın

1. **Qeydiyyat (0:00–0:30)** — `/login` səhifəsində ad, universitet, avatar və son 12 ayda muzey ziyarəti barədə cavab daxil et.
2. **Xəritə (0:30–0:55)** — `/map` aç. Məkanlar, açıq/bağlı statusları və Baku mövsüm sayğacı API-dən gəlir. Məkan kartında cari “Muzey Fəthi” sahibi və xal fərqini göstər.
3. **Tapşırıq (0:55–1:45)** — Xalça Muzeyi detalına keç. QR skanını kamera ilə et və ya demo düyməsini seç; ilk dəfə muzeyə gedən kimi qeydiyyatdan keçmiş profil üçün +20 ilk-ziyarət XP-sini, ümumi XP-ni və suveniri göstər. Eyni tapşırığı yenidən bitirməyə cəhd et; server 409 ilə təkrar XP-ni bloklayır.
4. **Sosial oyun (1:45–2:25)** — Liderlərdə Ümumi, Universitetim, Universitet Liqası və Açıq liqanı göstər. Qrup yarat və dəvət kodunu paylaş. Universitet Liqasında top-10 aktiv üzvün ortalaması, minimum 3 iştirakçı qaydası görünür.
5. **Kolleksiya və profil (2:25–2:45)** — Muzeyimdə qazanılan/missed suvenirləri, Profil-də XP/səviyyə/avatarı və paylaşım kartı yaratma düyməsini göstər.
6. **Həftə sonu admin demo (2:45–3:00)** — admin tokenlə `/api/admin/demo/simulate-activity` çağır, sonra cari season ID ilə `/api/admin/demo/advance-week` et. Eyni season ID-ni təkrar göndər; yekun snapshot-lar təkrar yazılmır.

## Admin curl

```sh
curl -H "X-Admin-Token: $ADMIN_TOKEN" http://localhost:5000/api/admin/metrics
curl -X POST -H "Content-Type: application/json" -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d '{"count":3}' http://localhost:5000/api/admin/demo/simulate-activity
curl -X POST -H "Content-Type: application/json" -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d '{"seasonId":"season-current"}' http://localhost:5000/api/admin/demo/advance-week
```

Telefon kamerası və geolokasiya HTTPS secure context tələb edir. Demo QR statik kodun paylaşılmasını tam əngəlləmir; QR HMAC, soft GPS, velocity flag-ləri və mükafatın manual yoxlanması birlikdə işləyir.
