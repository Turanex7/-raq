# Çıraq · canlı demo ssenarisi

Bu walkthrough seed edilmiş demo məlumatı ilə qeydiyyatdan başlayıb muzey fəthi, XP, liqa və həftə yekununa qədər gedir. API `5099`, Vite `5173` portunda işləyir.

## Hazırlıq

1. Təzə, təkrarlana bilən demo üçün əvvəlcə `scripts/dev.sh` prosesini `Ctrl+C` ilə dayandır.
2. Repo kökündə `scripts/reset-db.sh` işlət. Skript SQLite faylının ehtiyat nüsxəsini yaradır, sonra demo bazasını sıfırdan doldurur. Yalnız ayrılmış demo bazasında istifadə et; işlək API bazaya bağlıdırsa reset dayanır.
3. `scripts/dev.sh` başladıb terminalda görünən lokal admin açarını saxla. Açar yalnız `/dev/demo` üçün lazımdır.
4. Brauzerdə `http://localhost:5173/login` aç. Mövcud istifadəçi varsa çıxış et ki, yeni ADA profili yarada biləsən.

## 3 dəqiqəlik walkthrough

1. **Qeydiyyat — ADA profili (0:00–0:30)**
   Yeni e-poçt və parol, ad, **ADA Universiteti**, `Nizami Gəncəvi` avatarını daxil et. İlk-ziyarət əlavəsini göstərmək üçün “Son 12 ayda muzeyə getmisən?” sualında “Xeyr” seç. Qeydiyyatdan sonra ana səhifədəki XP çipinə basıb “XP necə işləyir?” izahını aç; sonra `/profile` səhifəsində “Ümumi XP”, “Həftəlik XP”, səviyyə çubuğu və avatar kilidlərini göstər.

2. **Xalça Muzeyinin cari rəqabəti (0:30–0:50)**
   `/map` səhifəsinə keçib Xalça Muzeyini aç. Demo seed-də ilkin hesab ADNSU 15, ADA 10-dur; sahibi ADNSU-dur və fərq 5-dir. Məkan kartında müvəqqəti sahiblik və `Fəth et` düyməsi görünür.

3. **Asan tapşırıq və ərazi fəthi (0:50–1:40)**
   `Fəth et` ilə Xalça Muzeyinin ilk, asan `Eksponatı kəşf et` tapşırığını aç. `Skaneri aç` seç; kamera yoxdursa `Demo skan` düyməsindən istifadə et. Demo skanı yalnız DEVELOPMENT demo rejimində görünür. Uğurlu nəticə “Xalça Muzeyini ADNSU-dan fəth etdin!” mesajını, baza / ilk ziyarət XP bölgüsünü, yeni ümumi və həftəlik XP-ni, səviyyə irəliləyişini və qazanıla bilən suveniri göstərir. Eyni tapşırıq ikinci dəfə XP vermir.

4. **Liderlər və universitet liqası (1:40–2:10)**
   `/leaderboard` səhifəsini aç. “Ümumi” tabında fərdi həftəlik XP-ni və vurğulanan öz sətrini göstər. “Universitet Liqası”nda top 10 aktiv üzvün orta həftəlik XP-sini, iştirakçı sayını və min. 3 iştirakçı qaydasını göstər. “Universitetim” və “Açıq liqa” tabları datalı nəticə və CTA-lı boş vəziyyətээр шалlanır.

5. **Suvenir və profil (2:10–2:30)**
   `/museum` səhifəsində həftəyə aid qazanılmış/qaçırılmış suvenirləri və `Adi / Nadir / Epik` nişanlarını göstər. `/profile` səhifəsində ümumi XP-nin qalıcı, həftəlik XP-nin isə bazar ertəsi Bakı vaxtı ilə sıfırlanan sayğac olduğunu göstər.

6. **Demo paneli: fəth və həftə yekunu (2:30–3:00)**
   `/dev/demo` aç, terminalda göstərilən admin açarını daxil et, “Xalça Muzeyində fəth et” ilə seed iştirakçısının fəthini göstər. Panel cari sahib/fərqi yeniləyir. Sonra “Həftəni yekunlaşdır” seçib təsdiqlə; reytinq və ərazi snapshot-ları saxlanır, növbəti həftə başlayır. Demo ssenarisini təkrarlamaq üçün əvvəlcə bazanı yenidən qur.

## 390px telefon yoxlaması

Chrome DevTools-da eni `390px` et və bu səhifələrin hər birinə bax: qeydiyyat (`/login`), ana səhifə (`/`), xəritə (`/map`), məkan (`/museums/carpet-museum`), skaner (`/scanner?taskId=carpet-museum-visit&place=carpet-museum`), tapşırıq/nəticə (`/quests/carpet-museum-visit?place=carpet-museum`), liderlər (`/leaderboard`), profil (`/profile`), kolleksiya (`/museum`) və development demo (`/dev/demo`). Hər səhifədə üfüqi daşma olmamalı, əsas idarəetmə hədəfləri ən az `44 × 44px` olmalı və mobil alt menyu görünməlidir. Skaner və GPS üçün HTTPS və brauzer icazəsi tələb oluna bilər; lokal walkthrough-da demo skan istifadə oluna bilər.

## Endpoint-lərlə yoxlama

`/dev/demo` paneli qorunan demo endpoint-lərini çağırır. Terminaldan işlətmək lazım olsa, `seasonId`-ni `GET /api/seasons/current` cavabından götür; cari ID-ni sərt kodlama:

```sh
curl -H "X-Admin-Token: $ADMIN_TOKEN" http://localhost:5099/api/admin/metrics
curl -X POST -H "Content-Type: application/json" -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d '{"count":1,"placeSlug":"carpet-museum"}' http://localhost:5099/api/admin/demo/simulate-activity
curl -X POST -H "Content-Type: application/json" -H "X-Admin-Token: $ADMIN_TOKEN" \
  -d '{"seasonId":"<GET /api/seasons/current cavabındakı id>"}' http://localhost:5099/api/admin/demo/advance-week
```

Demo seed istifadəçiləri `IsDemo` kimi işarələnir; analitik metriklər real istifadəçiləri demo iştirakçılarından ayırır. Seed edilmiş tapşırıqların mətni nəzərdən keçirilməlidir və `needs_review=true` olaraq qalır.
