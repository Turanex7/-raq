# Qərarlar, fərziyyələr və qalan risklər

## Qərarlar

- Mövcud React/Vite görünüşü saxlanılıb, API isə layihənin nəzərdə tutduğu ASP.NET Core stack-də əlavə edilib.
- Lokal inkişaf bazası SQLite-dır; EF migration-ları var. SQLite provider-i production Postgres provider-inə çevirmək ayrıca deploy işi tələb edir.
- Həftə Bazar ertəsi 00:00-dan növbəti Bazar ertəsi 00:00-dək `Asia/Baku` ilədir. Normal rollover hosted background service ilə yoxlanır; admin endpoint-i təqdimatda eyni işi erkən başladır.
- Universitet sıralaması 10 aktiv üzvün orta həftəlik XP-si və minimum 3 aktiv iştirakçı ilə hesablanır.
- Müəllif yoxlaması tələb olunan seed tapşırıqlarının hamısında `needs_review=true` saxlanılıb.

## Risklər və demo fərziyyələri

- Seed istifadəçilər və onların XP-si təqdimat üçün nümunə məlumatdır; real istifadə statistikası kimi təqdim edilməməlidir. Admin metric endpoint-i DB saylarını qaytarır.
- Universitet domenləri seed konfiqurasiyasıdır; qeydiyyatda e-poçt domeni hazırda sərt şəkildə universitetlə tutuşdurulmur. Mükafat tələb edəndə tələbə e-poçtu/ID-si manual yoxlanmalıdır.
- HMAC QR imzası statik stiker şəklinin paylaşılmasını tam önləmir. GPS siqnalı yumşaq yoxlamadır; şübhəli məsafə və sürət flag-i yaradır və mükafat uyğunluğunu manual review-a salır.
- JWT və QR secret-ləri verilməsə proses yaddaşda təsadüfi secret yaradır; restart-dan sonra əvvəlki tokenlər keçərsiz olur. Stabil dəyər üçün `.env.example`-dəki dəyişənləri export et.
- Background rollover hər dəqiqədə bitmiş mövsümləri yoxlayır. API prosesi həmin anda bağlıdırsa, növbəti start-dan sonrakı ilk yoxlamada yekunlaşdırır.
- Co-op lobby işləyir, ancaq co-op completion hazırda xüsusi lobby axınındadır və mükafat ledger-i ilə qalan P0 qrup bonusu kimi eyni sınaq dərinliyində deyil.
- Əsas P1 işi: PWA/offline shell. P2 işi: dostlar arasında 60 saniyəlik duel, push tipli ərazi bildirişləri və kontekstual mascot tip-ləri. 3D landing səhnəsinin geometriyası dekorativ demo qatıdır, amma açılan məkan paneli və landing kartları API statusunu göstərir.
- API və Leaflet plitələri şəbəkə tələb edir. Mobil kameraya/GPS-ə giriş HTTPS secure context tələb edir.
- Çox böyük 3D Sparkles bundle-i build xəbərdarlığı yaradır; funksional xəta deyil, gələcək optimizasiya üçün qeyd olunub.
