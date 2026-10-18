# Seed məzmunu: insan yoxlaması

Seed edilmiş məkan və tapşırıq məzmunu yayımdan əvvəl muzey/mədəniyyət üzrə məsul şəxs tərəfindən yoxlanmalıdır. Təsdiq alınanadək hər seed tapşırığında `needs_review=true` qalır; interfeys tapşırığı yoxlama növbəsində olduğunu göstərir. Bu sənəd yoxlamanın siyahısıdır, məzmunun təsdiqi deyil.

## Yoxlanmalı məkan qeydləri

Hər sətirdə məkanın adı, rayon/ünvan etiketi, koordinat, təsvir, açıq olduğu həftələr və nadirlik etiketi birlikdə yoxlanmalıdır. Koordinatlar xəritə pininin təxmini yeridir; sahə ilə tutuşdurulmadan GPS tapşırığı üçün dəqiq hesab edilməməlidir.

| Slug | Seed məkan | Yoxlanmalı məzmun |
| --- | --- | --- |
| `carpet-museum` | Azərbaycan Milli Xalça Muzeyi | Dənizkənarı Bulvar etiketi və xalçaçılıq məktəbləri/naxış ənənələri təsviri |
| `national-history` | Milli Azərbaycan Tarixi Muzeyi | Şəhər mərkəzi etiketi və kolleksiyanın Azərbaycan tarixinin müxtəlif dövrlərini əhatə etməsi |
| `heydar-aliyev` | Heydər Əliyev Mərkəzi | Nərimanov etiketi, məkan növü və memarlıq/mədəniyyət sərgiləri təsviri |
| `modern-art` | Müasir İncəsənət Muzeyi | Yusif Səfərov küçəsi etiketi və müasir incəsənət nümunələri təsviri |
| `literature-museum` | Nizami Gəncəvi adına Ədəbiyyat Muzeyi | Fəvvarələr Meydanı etiketi və ədəbiyyat irsi/klassik müəlliflər təsviri |
| `miniature-book-museum` | Miniatür Kitab Muzeyi | İçərişəhər etiketi və kolleksiya təsviri |
| `28-may` | 28 May meydanı | Mərkəz etiketi, məkan növü və gündəlik şəhər ritmi təsviri |
| `bulvar` | Dənizkənarı Bulvar | Sahil etiketi və Xəzər sahili təsviri |
| `icherisheher` | İçərişəhər | İçərişəhər etiketi, qala divarları və tarixi küçələr təsviri |
| `fountains` | Fəvvarələr Meydanı | Mərkəz etiketi və şəhər memarlığı təsviri |
| `ateshgah` | Suraxanı Atəşgahı | Suraxanı etiketi və Abşeronun alovla bağlı tarixi məkanı təsviri |

## Yoxlanmalı tapşırıq şablonları

Aşağıdakı şablonlar `DbSeeder.CreateTasksForPlace` tərəfindən hər məkan üçün yaradılır. Tapşırıq identifikatorları `<slug>-visit`, `<slug>-quiz`, `<slug>-vote`, `<slug>-challenge` və `<slug>-coop` formasındadır.

- **`visit` — “Məkanın hekayəsini oxu və ilk izi tamamla.”** Hər məkan üçün hekayə/məlumat kartı və QR kodunun uyğunluğu yoxlanmalıdır. Tapşırığın `needs_review` sahəsi true-dur; payload-dakı məlumat yoxlama növbəsindədir.
- **`quiz` — “<məkanın adı> hansı şəhərdə yerləşir?”** Gözlənilən cavab `Bakı`, payload faktı isə “Bakı Azərbaycanın paytaxtıdır.” Bütün 11 məkanın Bakı ilə əlaqəsi və cavab/fakt uyğunluğu ayrıca yoxlanmalıdır.
- **`vote` — “Bu məkanda ən çox nə diqqətini çəkdi?”** Seçimlər “Memarlıq”, “Tarix”, “İncəsənət”dir. Subyektiv tapşırıqdır; düzgün cavab və ya tarixi fakt iddiası yoxdur.
- **`challenge` — “Məkanla bağlı bir memarlıq və ya tarix detalını təsvir et.”** Prompt hər məkan üçün uyğunluğu, cavabların fakt kimi təqdim edilməməsi və qiymətləndirmə qaydası yoxlanmalıdır.
- **`coop` — Üç iştirakçı QR kodunu skan edib fərqli rolların cavabını 60 dəqiqə ərzində göndərir.** QR-ın düzgün məkana aidliyi, rol bölgüsü və qrup mexanikası yoxlanmalıdır. Müddət oyun qaydasıdır, tarixi fakt deyil.

## Yoxlama qeydi

- Tarixi iddialara mənbə əlavə edin; mənbəsiz il, tarix, say və ya başqa dəqiq rəqəm daxil etməyin.
- Səhv və ya təsdiqlənməmiş məlumatı yayımlamayın. Düzəlişdən sonra yalnız məsul şəxs təsdiqlədikdə review bayrağını dəyişin.
- Mövcud seed tapşırıqları `NeedsReview = true` ilə yaradılır. Test bütün seed tapşırıqlarında bu vəziyyəti yoxlayır.

## Gündəlik çıraq üçün yoxlanmalı mətnlər

Bu, tarixi hekayə deyil və tarixi fakt iddiası daşımır. Sayğac ardıcıl gündəlik girişləri göstərir; XP yalnız serverin yeddinci ardıcıl gündə verdiyi mükafatdır.

- Bölmə adı və düymə: “Gündəlik çıraq”; “Alovu yandır”; “Bu gün alovu yandır”.
- İzah: “Hər gün bir dəfə yandır, ardıcıl gün seriyanı qoru.”
- Sayğac: “Seriya”; “N gün ardıcıl”; “Növbəti mükafata irəliləyiş: N/7.”
- Mükafat: “Hər 7 ardıcıl günə +10 XP”; “Yeddi günlük seriya tamamlandı: +10 XP.”
- Gündəlik vəziyyət: “Bu gün alovunu yandırmısan. Seriyan sabah davam edə bilər.”
- Buraxılmış gün: “Bir günü buraxdığın üçün seriya sönüb. Bu gün yenidən başla.”
- Gündəlik nəticə: “Alov yandı. Ardıcıl gün: N.”
- Kosmetik suvenir: “Nadir alov kolleksiyaya əlavə olundu”; “XP qazandırmır.”

## Üçlü alov üçün yoxlanmalı ümumi suallar

Bu rol sualları eksponata baxışı təşviq edir və tarixi fakt iddia etmir. Hər sual API cavabında `needs_review=true` daşıyır.

- Kəşfiyyatçı: “Eksponatda diqqətini çəkən bir detalı tap və təsvir et.”
- Tarixçi: “Tapşırıq kartında oxuduğun ümumi fikri öz sözlərinlə yaz.”
- Müşahidəçi: “Eksponatda gördüyün rəng və ya formanı təsvir et.”
- Üçlü alov ekranı: “Üç iştirakçı QR kodunu skan edib ayrı rollarını seçir. Hər kəs cavabını 60 dəqiqə ərzində göndərməlidir; tapşırıq tamamlananda XP-ni server verir.”
- Nəticə: “Üçlü alov tamamlandı. XP serverdə hesablandı.”
- Cavab forması: “Məkanda gördüyün detalı yaz”; “Cavabın qeydə alındı. Digər rolların cavablarını gözlə.”

## Muzeyə aparan səviyyə ipucları

Bu oyun ipucları marşrut seçimi üçündür; tarixi fakt və ya tarix iddiası daşımır. Hər ipucunda `needs_review=true` saxlanılır və muzey üzrə məsul şəxs yoxlamadan yayımlanmış məzmun sayılmamalıdır.

| Mərhələ | Hədəf məkan | Başlıq və ipucu | Review |
| --- | --- | --- | --- |
| 1 | `carpet-museum` | “İlk muzey izi” — “İp və rənglə qurulan naxışların izini hansı muzeydə axtaracaqsan?” | `needs_review=true` |
| 2 | `national-history` | “Keçmişin izi” — “Müxtəlif dövrləri kolleksiyası ilə tanıdan muzeyi seç.” | `needs_review=true` |
| 3 | `heydar-aliyev` | “Axıcı formaların izi” — “Memarlıq və mədəniyyət sərgilərini bir arada kəşf edə biləcəyin məkanı tap.” | `needs_review=true` |

Mərhələ yalnız hədəf məkanın `visit` QR tapşırığı və `quiz` sualı tamamlandıqda irəliləyir. İpucu cavabı XP vermir; XP yalnız mövcud server tapşırıq axınından hesablanır.
