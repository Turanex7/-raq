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

## Çıraq hekayəsi üçün yoxlanmalı ümumi mətnlər

Bu hekayə mətnləri tarixi fakt iddiası daşımır. API konfiqurasiyasında `needs_review=true` ilə verilir və mədəniyyət üzrə məsul şəxs yoxlayana qədər təsdiqlənmiş məzmun sayılmır.

- Bölmə adı: “Çırağın ilk işığı”.
- Tapmaca ipucu: “Qaranlıqda parlayan nöqtəni tap və toxun.”
- İpucu kartı: “Eksponata diqqətlə bax, sonra yaxınlıqdakı QR işarəsini skan et.”
- Alov nəticəsi: “Bir alov parçası işıqlandı.”
- Bölmə sonu: “Növbəti alov başqa yerdədir...”
- Ev bölməsi: “Bir ipucu qazan”; “Qısa tapmacanı tamamla, sonra eksponata baxmaq üçün muzeyə yollan.”
- Tapmaca paneli: “İpucu tapmacası”; “Nöqtələrin sırası: 1, 3, 2”; “Nöqtələrin sırasını yenidən yoxla.”
- Tapmaca qeydi: “Bu tapmaca XP vermir; XP muzey tapşırıqlarından qazanılır.”
- Tapşırıqdan sonrakı istiqamət: “İndi eksponata bax”; “Yaxınlıqda tamamlanmamış asan və orta tapşırıqlar.”

## Üçlü alov üçün yoxlanmalı ümumi suallar

Bu rol sualları eksponata baxışı təşviq edir və tarixi fakt iddia etmir. Hər sual API cavabında `needs_review=true` daşıyır.

- Kəşfiyyatçı: “Eksponatda diqqətini çəkən bir detalı tap və təsvir et.”
- Tarixçi: “Tapşırıq kartında oxuduğun ümumi fikri öz sözlərinlə yaz.”
- Müşahidəçi: “Eksponatda gördüyün rəng və ya formanı təsvir et.”
- Üçlü alov ekranı: “Üç iştirakçı QR kodunu skan edib ayrı rollarını seçir. Hər kəs cavabını 60 dəqiqə ərzində göndərməlidir; tapşırıq tamamlananda XP-ni server verir.”
- Nəticə: “Üçlü alov tamamlandı. XP serverdə hesablandı.”
- Cavab forması: “Məkanda gördüyün detalı yaz”; “Cavabın qeydə alındı. Digər rolların cavablarını gözlə.”
