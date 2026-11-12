# QOZON — uy oshxonasi yordamchisi
## Mahsulot strategiyasi va texnik topshiriq (v1.0 · 2026-11-12)

> Holat: **qurilish boshlanmagan**. "Qur" buyrug'ini berganingizda aynan shu hujjat bo'yicha quriladi.

---

## 0. Bir qarashda — 12 ta asosiy qaror

| # | Savol | Qaror | Nega |
|---|-------|-------|------|
| 1 | Platforma | Mobil-birinchi veb-ilova (PWA). Telefonda "Bosh ekranga qo'shish" → ilova kabi | Oshxonada va bozorda telefon qo'lda bo'ladi |
| 2 | Backend | v1 da **yo'q**: hamma ma'lumot qurilmaning o'zida + JSON zaxira nusxa. v2 — Supabase sinxron | Tez, bepul, offline ishlaydi, shaxsiy ma'lumot chiqib ketmaydi |
| 3 | Stack | React + TypeScript + Vite + Zustand, bitta HTML faylga yig'iladi | Istalgan joyga (Netlify, GitHub Pages, Claude artifact) joylash mumkin |
| 4 | Til | O'zbek (lotin). Masalliqlarda ruscha nom ham (smetana, grechka, tvorog) | Do'konda shunday yozilgan |
| 5 | Ovqatlar | ~52 retsept, 3 mahal, O'zbekiston sharoiti, dengiz mahsulotisiz, 1 kishilik porsiya, "ko'p pishirib 2–3 kun yeyish" belgisi | Sizning shartingiz |
| 6 | Masalliqlar | ~80 ta: birlik, qadoq o'lchami, mo'ljal narx, saqlanish muddati, saqlash joyi, bozor bo'limi | Bozorlik va ombor shunga tayanadi |
| 7 | Tavsiya | Ballar tizimi (bor masalliq, buzilish muddati, xilma-xillik, vaqt, narx, mahal, mavsum, qoldiq) → har mahalga 1 "Tavsiya" + "Mumkin bo'lganlar", har biri "nega" chiplari bilan | Siz tanlaysiz, ilova tushuntiradi |
| 8 | Ombor | Partiyalar (lot): har xarid o'z narxi va muddati bilan; FIFO sarflanadi | Tannarx haqiqiy narxdan chiqadi, buzilish nazorati |
| 9 | Narx | Mo'ljal narxlar (Toshkent, 2026-noyabr) + har xariddan o'rganadi (EMA); bozor/supermarket farqi; mavsumiy koeffitsiyent | Narxlar tez o'zgaradi |
| 10 | Bozorlik | "Oylik asos + haftalik to'ldirish" modeli; bozor bo'limlari bo'yicha; chek rejimi; "Sotib oldim" → omborga | Bir odam uchun eng tejamli sxema |
| 11 | Hisobot | Kunlik/haftalik/oylik xarajat, porsiya tannarxi, chiqindi, tashqarida ovqatlanishga nisbatan tejam | 6-talabingiz |
| 12 | Nom | **Qozon** (variantlar: Oshpaz, Dasturxon) | Qisqa, o'zbekcha, oshxona |

---

## 1. Nima uchun va kim uchun

### 1.1 Muammo
- Har kuni "nima pishiray?" — qaror charchog'i.
- Masalliqlar muzlatgichda unutilib buziladi → pul chiqindiga.
- Retseptlar "ko'z bilan chamalab" yoziladi; boshlovchiga gramm, daqiqa, belgi kerak.
- Bir mahal tashqarida ovqat 30–45 ming so'm; uyda 6–15 ming. Farq oyiga 500 000+ so'm.
- Oy oxirida "pul qayerga ketdi?" — hisob yo'q.

### 1.2 Foydalanuvchi portreti (siz)
Toshkent/O'zbekiston, o'zi pishiradi (asosan 1 kishi), vaqt cheklangan (ish kuni 30–45 daq, dam olish 1,5 soat), oshpazlik darajasi boshlang'ich–o'rta, Korzinka + dehqon bozori, asosiy qurilma — telefon, dengiz mahsulotlarini yemaydi, byudjetga e'tiborli.

### 1.3 Asosiy va'da
**"Bugun nima yeyishni, qanday pishirishni va qancha turishini bitta ekranda ko'rsatadi; bozorlik ro'yxatini o'zi tuzadi; hech narsa behuda buzilmaydi."**

### 1.4 Muvaffaqiyat mezonlari
| Ko'rsatkich | Maqsad |
|---|---|
| Ilova kuniga ochiladi | ≥ 1 marta (ertalab) |
| Mahallarning uyda pishirilgani | ≥ 80 % |
| Buzilib tashlangan masalliq | haftada ≤ 5 % (so'mda) |
| Oylik xarajat | byudjet ichida (±10 %) |
| Bozorlik ro'yxatini qo'lda tuzatish | ≤ 3 satr |
| "Pishirdim" ni belgilash vaqti | ≤ 10 soniya |

---

## 2. Mahsulot prinsiplari
1. **Oshxona rejimi** — bir qadam = bir ekran, katta shrift, taymer, ekran o'chmaydi, moyli qo'l bilan bosiladigan katta tugmalar.
2. **Yozishdan ko'ra bosish** — hamma narsa tanlanadi; qo'lda yozish faqat narx tuzatishda.
3. **Hech qachon bo'sh ekran** — ma'lumot yo'q bo'lsa, nima qilish kerakligi va bitta tugma turadi.
4. **Narx hamma joyda** — retsept kartasi, qadam, bozorlik satri, ombor qatori.
5. **Offline-birinchi** — bozorda internet yomon bo'lsa ham ishlaydi.
6. **Kechirimli** — har amalda "Bekor qilish" (undo), har raqamni qo'lda tuzatish mumkin.
7. **Taxminiylikni tan oladi** — "≈" belgisi; aniq emas, lekin foydali.
8. **Sizning sharoitingiz** — gaz plita, qozon, tova; duxovka/blender bo'lsa — sozlamada yoqiladi.

---

## 3. Lug'at
| Termin | Ma'nosi |
|---|---|
| Masalliq | Bitta mahsulot (piyoz, guruch). Bazaviy birlik: g / ml / dona |
| Retsept | Ovqat: masalliqlar + qadamlar + vaqt + porsiya |
| Ombor | "Grocery bank" — uyda bor masalliqlar |
| Partiya (lot) | Bir xariddan kelgan bir masalliq miqdori, o'z narxi va muddati bilan |
| Reja | Kun × mahal → retsept (rejalashtirilgan / pishirilgan / o'tkazib yuborilgan) |
| Qoldiq | Pishirilgan, hali yeyilmagan porsiyalar (muzlatgichdagi palov) |
| Bozorlik ro'yxati | Sotib olinadigan masalliqlar, miqdor va taxminiy narx bilan |
| Xarid | Tasdiqlangan bozorlik (chek) — tarixga yoziladi, omborga partiya bo'lib tushadi |
| Kundalik | Har bir hodisa: pishirdim, yedim, tashladim, tuzatdim, sotib oldim |
| Zaxira darajasi | Doimiy masalliq uchun minimum (tuz 500 g, yog' 500 ml...) — kam qolsa ro'yxatga tushadi |

---

## 4. Foydalanuvchi sayohati

### 4.1 Kun 0 — birinchi ishga tushirish (6 qadam, ≤ 5 daqiqa)
1. **Salom.** Ism (ixtiyoriy), nechta odamga pishirasiz (1), ish kuni/dam olish kuni pishirishga vaqt (30 / 90 daq).
2. **Jihozlar.** Gaz plita (default ✓), qozon, tova, duxovka, mikroto'lqinli, blender, multivarka, muzlatkich (freezer). Retseptlar shunga filtrlanadi.
3. **Yemayman.** Dengiz mahsulotlari ✓ (default), cho'chqa ✓, jigar, qo'ziqorin, sut, yong'oq... Chip bosiladi. Bu masalliqlar hech qayerda chiqmaydi.
4. **Ovqatlar ro'yxatim.** 52 retsept kategoriya bo'yicha, hammasi "Yeyman" holatida; yoqtirmaganini o'chirasiz. Har kartada: vaqt, ≈ narx/porsiya.
5. **Uyda nima bor?** 20 ta eng ko'p uchraydigan masalliq chipi (tuz, yog', guruch, un, piyoz, kartoshka, tuxum, choy, shakar...). Bosganda miqdor: "oz / o'rtacha / ko'p" yoki aniq son. "Hech narsa yo'q" tugmasi.
6. **Birinchi bozorlik.** Oylik byudjet (default 1 200 000 so'm) → "1 hafta" yoki "1 oy" → ro'yxat narxlari bilan → "Bozorga ketdim" rejimi.
Istalgan qadamni o'tkazib yuborish mumkin; "Namuna bilan ko'rish" tugmasi demo ombor bilan to'ldiradi.

### 4.2 Oddiy kun
- **Ertalab** ochasiz → "Bugun": 3 mahal kartasi. Nonushta tavsiyasi: *Pomidorli tuxum · ≈ 9 500 so'm · 15 daq · "pomidor 2 kunda buziladi"*. "Pishirish" → qadamlar → "Tayyor" → ombordan 2 tuxum, 150 g pomidor, 10 ml yog' ayriladi; kun xarajati 9 500.
- **Tushlik:** yuqorida banner — *"Qoldiq: Palov, 2 porsiya (kecha pishirilgan). Avval shuni yeng"* → "Yedim" → porsiya ayriladi, kun xarajatiga porsiya narxi qo'shiladi.
- **Kechki ovqat:** tavsiya *Moshkichiri* ("hamma masalliq bor", "sabzi 2 kunda tugaydi", "8 700 so'm"). "Boshqa variantlar": Qovurma kartoshka (hammasi bor), Palov (90 daq — bugun vaqt kam), Lag'mon (2 ta yetishmaydi: go'sht, bulg'or qalampiri → "Bozorlikka qo'shish").
- Kechqurun pastda: *Bugun: 28 400 so'm · byudjet: kuniga 40 000 · oy: 412 000 / 1 200 000*.

### 4.3 Dam olish kuni — katta pishirish
Ilova taklif qiladi: "Bugun vaqtingiz ko'p — Chuchvara 120 dona (6 porsiya, muzlatkichga) yoki Palov 4 porsiya?" Pishirilgach porsiyalar "Qoldiq/Muzlatkich"ga tushadi va keyingi kunlarga avtomatik rejalanadi.

### 4.4 Yakshanba — haftalik yakun (3 daqiqa)
Haftalik hisobot (xarajat, eng arzon/qimmat ovqat, chiqindi) → keyingi hafta rejasi (avtomatik, tahrirlanadi) → "Haftalik to'ldirish" bozorlik ro'yxati → ixtiyoriy tez inventarizatsiya ("bor / kam / yo'q").

### 4.5 Oy boshi
"Oylik asosiy bozorlik" (guruch, un, yog', shakar, dukkaklilar, ziravor, go'sht muzlatkichga 200 g lik bo'lib) + oylik hisobot + byudjetni qayta ko'rish.

### 4.6 Maxsus holatlar
- **Mehmon keldi:** retseptni ×N qilish; yetishmayotgan masalliq tez ro'yxati.
- **Ramazon rejimi:** 3 mahal o'rniga Saharlik + Iftorlik (sozlamada yoqiladi).
- **Safar / uyda yo'qman:** kunlar o'tkazib yuboriladi, buziladigan masalliqlar haqida ogohlantirish.
- **Vaqtim yo'q:** "15 daqiqa" tugmasi → faqat tez retseptlar yoki qoldiqlar.
- **Payshanba oshi:** an'anaviy haftalik palov qoidasi (sozlamada yoqiladi).

---

## 5. Ekranlar

### 5.0 Navigatsiya
Pastki panel (telefon) / chap panel (kompyuter): **Bugun · Retseptlar · Ombor · Bozorlik · Hisobot** + yuqorida ⚙ Sozlamalar. Havola: `#bugun`, `#retseptlar`, `#ombor`, `#bozorlik`, `#hisobot`.

### 5.1 Bugun (bosh ekran)
```
┌──────────────────────────────────────────┐
│ Payshanba, 12-noyabr        ⚙            │
│ Bugun: 9 500 so'm   Oy: 412k / 1 200k ▓▓░ │
├──────────────────────────────────────────┤
│ ⚠ Tez ishlating: sabzi (2 kun), sut (1) │
│ 🍲 Qoldiq: Palov · 2 porsiya · [Yedim]   │
├──────────────────────────────────────────┤
│ NONUSHTA ✓ Pomidorli tuxum · 9 500       │
├──────────────────────────────────────────┤
│ TUSHLIK · Tavsiya                        │
│ ┌ Moshkichiri ─────────── ≈8 700 · 50' ┐│
│ │ ✓ Hammasi bor · Sabzi 2 kunda tugaydi ││
│ │ [Pishirish]  [Boshqasini tanlash ▾]   ││
│ └───────────────────────────────────────┘│
│   Hozir pishirsa bo'ladi (5) ▸           │
│   1–2 ta yetishmaydi (3) ▸               │
│   Bozorlik kerak (12) ▸                  │
├──────────────────────────────────────────┤
│ KECHKI OVQAT · Tavsiya ...               │
└──────────────────────────────────────────┘
```
- Har mahal: tavsiya kartasi + yig'iladigan variantlar ro'yxati (ball tartibida, mavjudlik belgisi bilan).
- Amallar: **Pishirish**, **Tanlash** (rejaga qo'yish), **O'tkazib yuborish** (sabab: tashqarida yedim / och emasdim — xarajat kiritish mumkin), **Yedim** (qoldiq uchun).
- Tezkor tugmalar: "15 daqiqa", "Arzon", "Go'shtsiz", "Qayta aralashtir".
- Bo'sh ombor → "Ombor bo'sh. Bozorlik tuzamizmi?" + minimal retseptlar (non-choy, tuxum).

### 5.2 Retseptlar
Qidiruv (o'zbek/rus nom bo'yicha), filtrlar: mahal, vaqt (≤15/30/60), narx/porsiya, "Hozir bor", go'shtli/go'shtsiz, batch, jihoz. Har kartada: nom, vaqt, ≈ narx/porsiya, mavjudlik nuqtasi (yashil/sariq/kulrang), ❤ sevimli, "Yeyman" tugmachasi. "Nima pishiray?" rejimi: masalliq chiplarini tanlang → mos retseptlar. "+ O'z retseptim" — oddiy forma (nom, masalliqlar, qadamlar).

### 5.3 Retsept sahifasi
Sarlavha, teglar, vaqt (tayyorlov + pishirish), qiyinlik, porsiya tanlagich (1–8; miqdorlar qayta hisoblanadi), **≈ narx (jami va porsiya)**, masalliqlar jadvali (miqdor, uy o'lchovi "≈ 1 piyola", omborda bormi ✓/✗, yetishmasa "Bozorlikka"), kerakli idishlar, qadamlar oldindan ko'rish, "Masalliq pasporti" havolalari, maslahatlar ("Birinchi marta pishiryapsizmi?"), o'rnini bosuvchilar. Tugmalar: **Pishirishni boshlash**, **Rejaga qo'shish**.

### 5.4 Pishirish rejimi (full-screen)
1. **Tayyorgarlik:** masalliqlar checklisti (hammasini stol ustiga qo'ying), idishlar.
2. **Qadamlar:** bir qadam — bir ekran, katta matn, rasm o'rniga belgi, "nega" izohi (masalan, "piyoz oltin rang — shirinlik beradi"), ichki taymer tugmasi ("20 daqiqa dimlang" → ▶ 20:00, tugaganda signal/vibratsiya), parallel qadamlar belgisi ("shu orada sabzini to'g'rang"). Surish bilan oldinga/orqaga. Ekran o'chmaydi (Wake Lock).
3. **Tayyor!** — "Necha porsiya chiqdi?" (default retseptdagi), "Hozir nechtasini yeysiz?", qolgani → Qoldiq (muddat 3 kun / muzlatkich 60 kun). Masalliqlar ombordan ayriladi (FIFO). Ko'rsatiladi: **tannarx, porsiya narxi, bugungi xarajat**. "Masalliqni kamroq/ko'proq ishlatdim" tuzatish. Baho ⭐ va "kamroq tavsiya qil".
4. Chiqib ketilsa — holat saqlanadi, qaytganda davom etadi.

### 5.5 Ombor
Guruhlar: Go'sht · Sut/tuxum · Sabzavot · Quruq mahsulotlar · Yog'/ziravor · Non · Boshqa. Qator: nom, miqdor (1,2 kg · 6 dona), muddat belgisi (🟢 >5 kun, 🟡 ≤5, 🔴 ≤2, ⚫ o'tgan — "Tekshiring"), ≈ qiymati. Amallar: ± miqdor, **Tugadi**, **Tashladim** (chiqindi: sabab), **Muzlatkichga qo'ydim** (muddat uzayadi), partiyalarni ko'rish. Yuqorida: "Ombor qiymati ≈ 386 000 so'm", "3 ta masalliq zaxira darajasidan past". "+ Qo'shish" (qidiruv → miqdor → narx (default mo'ljal) → sana). "Inventarizatsiya" rejimi.

### 5.6 Bozorlik
- **Joriy ro'yxat** (bo'limlar bo'yicha, har satr: masalliq, miqdor (qadoqqa yaxlitlangan), ≈ narx, nima uchun kerak ("Palov, Mastava")). Jami. Byudjetga mosligi.
- **Yangi ro'yxat ustasi:** muddat (7 / 14 / 30 kun), rejim (Ovqat rejasidan / Zaxirani to'ldirish / Aralash), do'kon (Bozor / Supermarket), byudjet cheklovi → ro'yxat + menyu oldindan ko'rish (tahrirlanadi: retseptni almashtirish).
- **Bozorga ketdim rejimi:** katta checkbox, bosganda haqiqiy narx va miqdor (default taxminiy), jami jonli yangilanadi, "olmadim" → keyingi safarga. **Tugatdim** → omborga partiyalar, xarid tarixi, narxlar o'rganiladi.
- **Tarix:** xaridlar, summalar, "reja vs haqiqiy" farqi. Ro'yxatni matn qilib nusxalash (Telegramga tashlash uchun).

### 5.7 Hisobot
Kunlik xarajat ustunlari (14 kun), oylik yig'indi vs byudjet, mahallar bo'yicha taqsimot, eng ko'p pishirilgan / eng arzon / eng qimmat ovqatlar, porsiya o'rtacha narxi, chiqindi (so'm va foiz), "Tashqarida ovqatlanishga nisbatan tejam", savatcha narxi o'zgarishi (inflyatsiya), masalliq narx tarixi. Hammasi jadval ko'rinishida ham.

### 5.8 Sozlamalar
Odamlar soni, vaqt (ish/dam), jihozlar, "yemayman", byudjet, do'konlar, tashqarida bir mahal o'rtacha narxi (30 000), Ramazon rejimi, Payshanba oshi, mavsum koeffitsiyenti on/off, zaxira darajalari, mo'ljal narxlar jadvali (tahrir), mavzu (yorug'/qorong'i/avto), oshxona rejimi shrifti, **Zaxira nusxa (JSON eksport/import)**, "Hammasini tozalash".

---

## 6. Tavsiya mexanizmi

**Kirish:** faol retseptlar, ombor (partiyalar, muddatlar), sana/mahal, 14 kunlik kundalik, qoldiqlar, sozlamalar, mavsum.

**1-qadam. Qattiq filtrlar:** "yemayman" masalliqli, jihozi yo'q, mahalga mutlaqo mos emas (kechqurun ovsyanka emas), vaqt limitidan 2× ortiq.

**2-qadam. Mavjudlik tasnifi** (majburiy masalliqlar bo'yicha; ixtiyoriylar hisobga olinmaydi; o'rnini bosuvchilar jadvali ishlaydi: smetana↔qaymoq, tovuq↔mol go'shti (belgilangan retseptlarda), yasmiq↔mosh, sariyog'↔o'simlik yog'i, spagetti↔lag'mon):
- 🟢 **Hammasi bor** · 🟡 **Deyarli bor** (1–2 ta arzon masalliq yetishmaydi, ≤ 5 000 so'm) · ⚪ **Bozorlik kerak**.

**3-qadam. Ballar (0–100 atrofida):**

| Omil | Ball |
|---|---|
| Hammasi bor / deyarli bor / yo'q | +40 / +25 / 0 |
| Muddati 48 soatda tugaydigan masalliqni ishlatadi | +20 (3–5 kun: +10) |
| Oxirgi 3 kunda yeyilgan / 4–7 kun / 14+ kun yeyilmagan | −25 / −10 / +5 |
| Bir xil asos (guruch, kartoshka, makaron) ketma-ket 2 mahal | −8 |
| Vaqt limit ichida / 1,5× gacha / undan ko'p | +10 / 0 / −20 |
| Porsiya narxi kunlik limit/3 dan past / 1,5× dan yuqori | +8 / −8 (oy oxirida byudjet tugayotgan bo'lsa ×2) |
| Mahal: asosiy / mumkin | +10 / +3 |
| Mavsum mos (yozda okroshka, qishda sho'rva) | +5 |
| Kun davomida oqsil (go'sht/tuxum/dukkakli) bo'lmagan — oqsilli retsept | +8 |
| Sevimli ❤ / "kamroq tavsiya qil" | +5 / −15 |
| Payshanba oshi (yoqilgan bo'lsa, payshanba kechki) | +8 |
| Tasodifiylik (kunlik seed) | ±3 |

**4-qadam. Natija:** eng yuqori ball → **Tavsiya**; qolganlar guruhlangan ro'yxat. **Qoldiq** bor bo'lsa — alohida ustuvor karta (ballardan yuqori), muddati 3 kun.

**5-qadam. Tushuntirish chiplari:** har omil uchun qisqa matn: "Hamma masalliq bor", "Sabzi 2 kunda buziladi", "8 700 so'm — arzon", "50 daqiqa", "4 kundan beri go'sht yemadingiz".

**6-qadam. 3 mahalni muvofiqlashtirish:** ertalab 3 mahal birga hisoblanadi; masalliq ikki mahalga "va'da" qilinmaydi (rezerv); batch retsept keyingi kunlarga qoldiq bo'lib rejalanadi; siz bitta mahalni o'zgartirsangiz — qolganlari qayta hisoblanadi.

**Misol (payshanba kechki, ish kuni 45 daq, omborda: sabzi 600 g (2 kun), piyoz, guruch, mol go'shti 400 g, mosh, kartoshka, tuxum, yog'):**

| Retsept | Bor | Muddat | Vaqt | Narx | Mahal | Oqsil | Boshqa | Jami |
|---|---|---|---|---|---|---|---|---|
| Moshkichiri | +40 | +20 | 0 | +8 | +10 | +8 | | **86 → Tavsiya** |
| Qovurma kartoshka | +40 | 0 | +10 | 0 | +10 | +8 | | 68 |
| Palov | +40 | +20 | −20 | 0 | +10 | +8 | +8 | 66 ("90 daq — bugun vaqt kam") |

---

## 7. Ombor mexanikasi
- **Birliklar:** g / ml / dona. Ko'rsatish avtomatik (1 500 g → 1,5 kg). Uy o'lchovlari: 1 piyola guruch ≈ 200 g, 1 osh qoshiq ≈ 15 ml, 1 choy qoshiq ≈ 5 g, piyoz ≈ 120 g, kartoshka ≈ 150 g, sabzi ≈ 100 g, pomidor ≈ 120 g, tuxum ≈ 55 g, non ≈ 350 g.
- **Partiyalar:** `{masalliq, miqdor, birlik narxi, sana, muddat, joy}`. Sarflash FIFO. Tannarx = Σ(olingan miqdor × partiya narxi). Narxi noma'lum partiya → mo'ljal narx.
- **Qisman ishlatish:** "dona" masalliqlar ichida gramm ekvivalenti yuradi (0,5 piyoz).
- **Ziravorlar:** cheksiz emas — retseptda 5 g tuz ham hisoblanadi (arzimas narx, lekin tugashini sezadi).
- **Tugadi / Tashladim / Tuzatdim:** farq kundalikka "yo'qotish / chiqindi / inventarizatsiya" deb yoziladi — hisobotda ko'rinadi.
- **Muddat:** bazadagi default (ko'kat 3, pomidor 6, ochilgan sut 3, go'sht muzlatgichda 2 / muzlatkichda 90, guruch 365...) + saqlash joyi. 2 kun qolganda "Tez ishlating", o'tganda "Tekshiring" (avtomatik tashlanmaydi).
- **Muzlatish amali:** go'sht/kotlet/chuchvara → muddat uzayadi.
- **Zaxira darajasi:** tuz 300 g, yog' 500 ml, guruch 1 kg, un 1 kg, piyoz 1 kg, kartoshka 1 kg, choy 50 g, shakar 500 g, tuxum 6 dona — pastga tushsa bozorlikka avtomatik.
- **Rezerv:** rejalashtirilgan mahallar masalliqni "band" qiladi, boshqa tavsiyalar qolganidan hisoblanadi.

---

## 8. Narx modeli
- Har masalliqda **mo'ljal narx** (bozor) va supermarket narxi (ma'lum bo'lmasa ×1,15). Xaridda do'kon tanlanadi.
- **O'rganish:** haqiqiy narx kiritilsa → mo'ljal = 0,6×yangi + 0,4×eski; narx tarixi saqlanadi; "Tuxum +12 % o'tgan oyga nisbatan".
- **Mavsum koeffitsiyenti** (pomidor, bodring, bulg'or qalampiri, baqlajon, ko'kat): dek–mar ×1,8 · apr–may ×1,2 · iyun–sen ×0,7 · okt–noy ×1,0. Faqat bashorat uchun; real narx ustun.
- **Qadoqqa yaxlitlash:** tuxum 10/30, yog' 1 L/5 L, un 2/5 kg, guruch 1/5 kg, go'sht va sabzavot 500 g qadam, ziravor 50 g, makaron 400–500 g, sut 1 L, smetana 200/500 g, non 1 dona.
- **Hisoblar:**
  - Retsept mo'ljal narxi = Σ miqdor × mo'ljal narx (kartada).
  - Haqiqiy tannarx = pishirganda FIFO partiyalardan. Porsiya narxi = tannarx / porsiya.
  - **Kunlik xarajat (asosiy)** = shu kuni yeyilgan porsiyalar narxi (qoldiq ham o'z porsiya narxida) + tashqarida yeyilgan (qo'lda).
  - Kunlik "ishlatilgan masalliqlar" = pishirishga ketgan masalliqlar narxi (ikkinchi ko'rsatkich).
  - Hafta/oy = yig'indi vs byudjet. Bozorlik rejasi vs chek farqi.
- **Tejam:** sozlamadagi "tashqarida bir mahal" (30 000) × uyda yeyilgan mahallar − haqiqiy xarajat.

### 8.1 Mo'ljal narxlar (Toshkent, 2026-noyabr; manbalar 19-bo'limda; ilovada tahrirlanadi)
| Masalliq | Narx | Masalliq | Narx |
|---|---|---|---|
| Mol go'shti (suyakli) | 105 000/kg | Guruch (oddiy) | 20 000/kg |
| Mol go'shti (suyaksiz) | 125 000/kg | Guruch (devzira) | 38 000/kg |
| Qo'y go'shti | 130 000/kg | Un | 7 000/kg |
| Qiyma | 120 000/kg | Makaron | 12 000/kg |
| Tovuq (butun) | 38 000/kg | Grechka | 22 000/kg |
| Tovuq oyoqcha | 42 000/kg | Suli yormasi | 18 000/kg |
| Tovuq filesi | 52 000/kg | Mosh / yasmiq | 25 000/kg |
| Tovuq jigari | 28 000/kg | Loviya / no'xat | 30 000/kg |
| Tuxum | 1 700/dona | O'simlik yog'i | 24 000/L |
| Sut | 14 000/L | Shakar | 13 000/kg |
| Qatiq | 13 000/L | Tuz | 3 000/kg |
| Smetana | 36 000/kg | Non (obi) | 5 000/dona |
| Sariyog' | 110 000/kg | Kartoshka | 6 500/kg |
| Pishloq | 100 000/kg | Piyoz | 4 000/kg |
| Tvorog | 45 000/kg | Sabzi | 6 000/kg |
| Kolbasa | 85 000/kg | Pomidor (noyabr) | 15 000/kg |
| Pomidor pastasi | 36 000/kg | Bodring (noyabr) | 18 000/kg |
| Ko'k choy | 200 000/kg | Karam | 5 000/kg |
| Zira / murch | 240–300 000/kg | Sarimsoq | 25 000/kg |

---

## 9. Bozorlik ro'yxati generatsiyasi
1. **Menyu:** gorizont (7/14/30 kun) uchun har kun 3 mahal tavsiya mexanizmi bilan tuziladi (ombor virtual kamayib boradi), batch retseptlar 3–4 porsiya bo'lib keyingi kunlarga qoldiq sifatida taqsimlanadi, haftada go'shtli ovqat soni (default 4–5), nonushtada takror ruxsat.
2. **Yig'indi:** Σ retsept × porsiya (ixtiyoriylar alohida bo'limda).
3. **Ombor ayiriladi** (muddati gorizont ichida tugaydiganlar faqat o'sha kungacha hisobga olinadi) + zaxira darajasi kamchiliklari qo'shiladi.
4. **Qadoqqa yaxlitlash** (yuqoriga) + ortiqcha izohi ("1 kg sabzi — 650 g ishlatiladi, qolgani keyingi haftaga").
5. **Buziluvchanlik:** 30 kunlik ro'yxatda muddati ≤ 7 kun masalliqlar faqat 1-haftaga; qolgani "Haftalik to'ldirish"ga. Go'sht oylik olinsa — "200 g lik bo'lib muzlating" eslatmasi.
6. **Narxlash** (do'kon bo'yicha) + jami. Byudjetdan oshsa — almashtirish takliflari ("Palov → Tovuqli palov: −28 000").
7. **Guruhlash** bozor bo'limlari bo'yicha: Go'sht · Sabzavot-meva · Sut mahsulotlari · Quruq mahsulotlar · Ziravor · Non · Choy/boshqa.
8. **Chiqish:** tahrirlanadigan ro'yxat → "Bozorga ketdim" → "Tugatdim" → omborga partiyalar (narx, sana, muddat avtomatik), xarid tarixi, narxlar o'rganiladi; olinmaganlar keyingi safarga.

**Namuna (1 kishi):** oylik asos ≈ 740 000 (go'sht 2 kg, tovuq 2 kg, qiyma 1 kg, guruch 3 kg, un 2 kg, yog' 2 L, dukkaklilar, ziravor, kartoshka 4 kg, piyoz 3 kg, sabzi 2 kg...) + haftalik yangi ≈ 120–150 000 (tuxum, sut, qatiq, non, pomidor, bodring, ko'kat, meva) → **≈ 1,2–1,35 mln so'm/oy**, kuniga ≈ 40 000.

---

## 10. Kontent bazasi

### 10.1 Masalliqlar (~80) — bo'limlar bo'yicha
- **Go'sht/parranda (11):** mol go'shti suyakli, suyaksiz, qo'y go'shti, qiyma, tovuq butun, oyoqcha, file, jigar, dumba, kolbasa, sosiska.
- **Tuxum/sut (9):** tuxum, sut, qatiq/kefir, smetana, qaymoq, sariyog', pishloq, tvorog, mayonez.
- **Sabzavot (18):** kartoshka, piyoz, sariq sabzi, qizil sabzi, pomidor, bodring, karam, bulg'or qalampiri, sarimsoq, qovoq, lavlagi, baqlajon, qovoqcha, sholg'om, ko'kat (dasta), achchiq qalampir, rediska, tuzlangan bodring.
- **Meva (3):** olma, banan, limon.
- **Quruq mahsulotlar (16):** guruch oddiy, devzira, un, makaron, vermishel, tayyor lag'mon, grechka, suli, manniy, mosh, yasmiq, loviya, no'xat, konserva no'xat, obi non, buxanka.
- **Yog'/ziravor (16):** o'simlik yog'i, paxta yog'i, tuz, shakar, qora murch, zira, qizil qalampir, koriandr, zarchava, lavr bargi, pomidor pastasi, sirka, soya sousi, ketchup, soda, xamirturush.
- **Boshqa (5):** ko'k choy, qora choy, asal, mayiz, yong'oq.
Har birida: o'zbek + rus nomi, birlik, qadoq, mo'ljal narx (bozor/supermarket), muddat (muzlatgich/muzlatkich/xona), saqlash maslahati, bozor bo'limi, zaxira darajasi, o'rnini bosuvchilar, tanlash maslahati ("oshga sariq sabzi").

### 10.2 Retseptlar (52) — ≈ narx/porsiya (mo'ljal narxlardan)
**Nonushta (14):** Tuxum qovurma 6 500 · Sutli omlet 7 000 · Pomidorli tuxum 9 500 · Kartoshkali tuxum 7 500 · Suli bo'tqasi 4 500 · Manniy bo'tqa 4 000 · Shirguruch 4 500 · Grechka sut bilan 5 300 · Quymoq 4 000 · Tuxumli non (grenki) 5 000 · Syrniki 7 800 · Tvorog qaymoq bilan 7 500 · Non-sariyog'-pishloq-choy 7 700 · Qaynatilgan tuxum + sabzavot 9 000.
**Sho'rvalar (9):** Mastava 10 300 · Go'shtli sho'rva 12 500 · Tovuq sho'rva 6 100 · Moshxo'rda 7 800 · Yasmiq sho'rva 2 600 · Loviya sho'rva 3 300 · No'xat sho'rva 9 500 · Chuchvara sho'rva (muzlatilgandan) 9 000 · Okroshka/chalop 12 900 (yoz).
**Asosiy (18):** Palov 14 800 (4 porsiya, batch) · Tovuqli palov 7 800 · Shavla 9 500 · Moshkichiri 8 700 (go'shtsiz 3 200) · Qovurma lag'mon 13 000 · Dimlama 14 000 · Go'shtli qovurma kartoshka 12 800 · Qozon kabob 20 700 · Tovuq qovurma piyoz bilan 9 200 · Guruchli tovuq 8 000 · Qiymali makaron 11 000 · Kotlet 15 100 (batch) · Qiymali kartoshka 11 200 · Jigar qovurma 6 500 · Tuxumli qovurilgan guruch 5 700 · Sabzavotli ragu 4 700 · Qovoq bo'tqa 3 300 · Pishloqli makaron 6 700.
**Katta pishirish (3):** Manti 15 900 · Chuchvara 8 100 (120 dona, muzlatkich) · Duxovka somsa 12 700 (duxovka kerak).
**Garnir/salat (7):** Kartoshka pyure 2 500 · Grechka 2 200 · Qovurilgan kartoshka 3 500 · Achchiq-chuchuk 3 000 · Karam salat 1 500 · Vinegret 3 800 · Olivye 12 500.
**Tez (1):** Kolbasali buterbrod 10 300.
Har retseptda: mahal (asosiy/mumkin), tayyorlov+pishirish vaqti, qiyinlik, porsiya, masalliqlar (majburiy/ixtiyoriy, miqdor g/ml/dona + uy o'lchovi), idishlar, 6–14 ta qadam (har biri: matn, taymer, "nega" izohi, boshlovchi maslahati), batch belgisi, mavsum, teglar, qoldiqdan nima qilish mumkin ("qolgan palov → qovurilgan palov").

---

## 11. Ma'lumotlar modeli (qisqacha)
```ts
Ingredient { id, name, nameRu, category, unit:'g'|'ml'|'dona', gramsPerPiece?, pack:{size,label}, price:{bazaar,market}, shelfLife:{fridge,freezer,room}, storage, section, parLevel?, seasonal?, substitutes:[id], tips }
Recipe { id, name, meals:{breakfast,lunch,dinner:'main'|'ok'|'no'}, prepMin, cookMin, difficulty, servings, batch, equipment:[], ingredients:[{id, qty, optional?, note}], steps:[{text, timerMin?, why?, tip?}], tools:[], tags:[], season?, leftoverIdeas:[] }
Lot { id, ingredientId, qty, unitPrice, boughtAt, expiresAt, place:'fridge'|'freezer'|'room', source }
Plan { date, slot, recipeId|leftoverId, status:'planned'|'cooked'|'eaten'|'skipped', servings }
Leftover { id, recipeId, portions, portionCost, cookedAt, expiresAt, frozen }
LogEvent { ts, type:'cook'|'eat'|'waste'|'adjust'|'buy'|'eat_out', refs, cost }
Purchase { id, date, store, lines:[{ingredientId, qty, price}], total, plannedTotal }
ShoppingList { id, horizonDays, mode, store, lines:[{ingredientId, qty, estPrice, reasons:[], checked, actualQty?, actualPrice?}], status }
Settings { people, timeWeekday, timeWeekend, equipment:[], excluded:[], budgetMonthly, stores:[], eatOutPrice, ramadan, thursdayPlov, seasonal, theme, kitchenFont }
```
Saqlash: `localStorage["qozon:v1"]` (sxema versiyasi + migratsiya), debounce autosave, JSON eksport/import.

---

## 12. Texnik arxitektura
- **React 19 + TypeScript + Vite + Zustand (persist)**. CSS — o'z token tizimi (Tailwindsiz). Ikonkalar — inline SVG.
- **Bitta HTML fayl** (`vite-plugin-singlefile`) → Claude artifact (darhol xususiy havola) va/yoki Netlify / GitHub Pages (doimiy havola, PWA manifest, offline).
- Papkalar: `src/data` (masalliqlar, retseptlar), `src/engine` (tavsiya, ombor FIFO, narx, bozorlik generatori — sof funksiyalar), `src/store`, `src/screens`, `src/components`, `src/styles`.
- **Test:** engine uchun unit testlar (ballar, FIFO, yaxlitlash, tannarx); Playwright smoke: onboarding → bozorlik → pishirish → ombor kamaydi → xarajat ko'rindi.
- **Xavfsizlik/maxfiylik:** backend yo'q, ma'lumot qurilmadan chiqmaydi. v2 Supabase: Telegram/email kirish, jadval = local slice'lar, last-write-wins.
- Hajm < 400 KB, 3 yillik telefonda ham tez.

---

## 13. Dizayn tizimi
- **Rang:** asosiy — chuqur ko'k-yashil "qozon" (#0F5C4C), urg'u — anor qizil (#C8373F, kamdan-kam), fon — iliq oq (#F7F6F2), matn — #1C2321. Holat ranglari alohida: muddat 🟢/🟡/🔴, byudjet. Qorong'i mavzu — alohida tanlangan tokenlar.
- **Shrift:** sarlavha/raqamlar — Unbounded, matn — Golos Text (lotin+kirill), tabular raqamlar narxlarda.
- **Komponentlar:** mahal kartasi, retsept kartasi, masalliq qatori, sabab chipi, muddat belgisi, stepper, taymer, pastki panel, pastdan chiqadigan varaq (sheet), toast + Bekor qilish, byudjet progress, miqdor ±, qidiruv.
- **Oshxona rejimi:** 1,25× shrift, yuqori kontrast, ekran o'chmaydi, surish.
- **Matn ohangi:** do'stona, qisqa, "siz"; tugmalar buyruq fe'li ("Pishirish", "Sotib oldim"). Raqamlar: `12 500 so'm`, taxminda "≈".

---

## 14. Kreativ g'oyalar — brainstorm (MoSCoW)

**MUST (v1):**
1. "Tez ishlating" banneri — buziladigan masalliq + uni ishlatadigan retsept.
2. Qoldiq ovqat tizimi — bir marta pishir, 2–3 kun ye; muzlatkich qoldiqlari.
3. "Nega bu tavsiya?" chiplari — ishonch.
4. Narx o'rganish — har xarid mo'ljal narxni yangilaydi, narx tarixi.
5. Oylik asos + haftalik to'ldirish bozorlik modeli.
6. Chek rejimi (haqiqiy narx kiritish) va "reja vs haqiqat".
7. Pishirish taymerlari va Wake Lock.
8. Porsiya tanlagich (mehmon rejimi).
9. O'rnini bosuvchilar ("Smetana yo'qmi? Qaymoq bo'ladi").
10. "Nima pishiray?" — masalliq tanlab retsept topish.
11. Tashqarida ovqatlanish bilan taqqoslab tejam hisobi.
12. JSON zaxira/import, demo rejim, Bekor qilish.
13. Bozor bo'limlari bo'yicha ro'yxat, matn ko'rinishida nusxalash.

**SHOULD (v1.5):**
14. Payshanba oshi va Ramazon rejimi (saharlik/iftorlik).
15. Masalliq pasporti: narx grafigi, bozorda tanlash maslahati, saqlash.
16. Qoldiqdan yangi ovqat ("qolgan non → grenki", "qolgan pyure → kartoshka kotlet").
17. Mavsumiy kalendar: O'zbekistonda nima qachon arzon (apr–may ko'kat, iyun pomidor/o'rik, iyul–avg qovun, sen–okt uzum/anor/qovoq, qish — karam/sabzi/kartoshka).
18. "Arzon hafta" rejimi (byudjet tig'iz bo'lsa faqat ≤ X so'm retseptlar).
19. Haftalik yakun rituali (3 savol) + streak ("12 kun uyda").
20. Chiqindi hisobi va "eng ko'p buziladigan masalliq" ogohlantirishi.
21. Retsept "qisqa rejim" — 3 marta pishirgach batafsil qadamlar yashirinadi.
22. Inventarizatsiya rejimi (bor/kam/yo'q).

**COULD (v2):**
23. Supabase sinxron (telefon + kompyuter), Telegram orqali kirish.
24. Telegram bot: ertalab "bugungi menyu", bozorlik ro'yxati xabar bo'lib.
25. Qadamlarni ovoz bilan o'qish (qo'l band bo'lganda).
26. Taxminiy kaloriya/oqsil, "bu hafta oqsil kam".
27. Matn/AI orqali yangi retsept import (yopishtir → tahlil).
28. Oila rejimi (har kim o'z "yemayman" ro'yxati bilan).
29. Ovqat fotosi galereyasi, kalendar issiqlik xaritasi.
30. Byudjet "konvertlari" (go'sht / sabzavot / boshqa).

**WON'T (hozircha):** shtrix-kod skaner (O'zbekiston bazasi yo'q), do'kon narxlarini avtomatik tortish (API yo'q), ijtimoiy funksiyalar.

---

## 15. Xavflar va yumshatish
| Xavf | Yumshatish |
|---|---|
| Narxlar eskiradi | Har xariddan o'rganish, tahrirlanadigan jadval, "≈" belgisi, inflyatsiya ogohlantirishi |
| Brauzer ma'lumoti o'chib ketadi | Haftalik eslatma bilan JSON zaxira, v2 sinxron |
| Foydalanuvchi "Pishirdim"ni belgilamaydi | 10 soniyalik oqim, bosh ekranda eslatma, inventarizatsiya bilan tuzatish |
| Birliklar chalkashadi (dona/gramm) | Har masalliqda gramm ekvivalenti, uy o'lchovi izohi |
| Retsept porsiyasi haqiqatdan farq qiladi | "Tayyor" ekranida porsiya sonini tuzatish, retseptni shaxsiylashtirish |
| Hamma retsept yaqinda yeyilgan — tavsiya bo'sh | Jarima normalizatsiyasi, "Qayta aralashtir" |

---

## 16. Yo'l xaritasi
- **v1 (birinchi qurilish):** 5.1–5.9 ekranlar, 6–9 mexanizmlar, 80 masalliq, 52 to'liq retsept, MUST g'oyalar, yorug'/qorong'i mavzu, JSON zaxira, PWA manifest, unit + smoke testlar, Claude artifact + manba kodi (zip / GitHub).
- **v1.5:** SHOULD ro'yxati.
- **v2:** Supabase sinxron, Telegram bot, ovoz, kaloriya.

## 17. v1 qabul mezonlari (men tekshiraman)
1. Birinchi ochilishda onboarding; 52 retseptdan "Yeyman" tanlanadi.
2. "1 oy" bozorlik ro'yxati narxlari va jami bilan chiqadi, bo'limlarga bo'lingan, qadoqqa yaxlitlangan.
3. "Tugatdim" → ombor to'ladi (partiya, narx, muddat).
4. "Bugun" da 3 mahalga tavsiya + variantlar + sabab chiplari; qoldiq va "tez ishlating" bannerlari.
5. Pishirish rejimi: qadamlar, taymer, "Tayyor" → ombor kamayadi, tannarx va porsiya narxi ko'rinadi, qoldiq saqlanadi.
6. Hisobotda kunlik/oylik xarajat, byudjet, chiqindi, tejam — jadval bilan.
7. Yemayman ro'yxatidagi masalliq hech qayerda chiqmaydi (dengiz mahsulotlari bazada umuman yo'q).
8. Telefon kengligida gorizontal aylantirish yo'q; qorong'i mavzu o'qiladi; sahifani yopib ochganda ma'lumot saqlangan.
9. JSON eksport → tozalash → import → hammasi qaytadi.

---

## 18. Sizdan kutilayotgan qarorlar
1. **Nechta odam** uchun? (1 deb oldim.)
2. **Jihozlar:** duxovka bormi? muzlatkich (freezer) bormi? blender?
3. **Oylik ovqat byudjeti?** (1 200 000 so'm deb oldim.)
4. **Qayerda xarid qilasiz:** bozor, Korzinka, ikkalasi? Hudud Toshkentmi?
5. **Sayt qayerda tursin:** (a) Claude artifact — darhol xususiy havola; (b) Netlify / GitHub Pages — doimiy havola (GitHub akkauntingiz bormi?); (c) ikkalasi — tavsiyam.
6. **Ma'lumot:** v1 faqat shu qurilmada (+ JSON zaxira) ma'qulmi, yoki darhol sinxron kerakmi (Supabase — qurilish 1,5× uzoqroq)?
7. **Retseptlar ro'yxati** (10.2): nimani olib tashlaymiz / qo'shamiz? Ramazon rejimi v1 da kerakmi?
8. **Nom:** Qozon ma'qulmi?

## 19. Manbalar (narxlar)
- Zamin.uz, Toshkentda go'sht narxi (2026-sentyabr): mol 112 000, qo'y 129 000 — https://zamin.uz/uz/ozbekiston/222169-toshkentda-gosht-narxi-yana-oshdi-bozordagi-songgi-raqamlar.html
- Kun.uz, mol go'shti narxi (2026-05) — https://kun.uz/news/2026/05/06/ozbekistonda-mol-goshti-narxi-jahon-narxlari-bilan-taqqoslandi
- Gazeta.uz, go'sht 6–8 % qimmatlashdi (2026-07) — https://www.gazeta.uz/oz/2026/07/21/inflation-meat/
- PUL24, Toshkent bozorlarida narxlar (2026-06) — https://pul24.uz/2026/06/02/news/bozorda-narxlar-qanday-ozgardi/
- Kursiv, Toshkent bozorlari tahlili (2026-06) — https://uz.kursiv.media/uz/2026-06-04/bulgor-qalampiri-arzonladi-qoy-goshti-esa-qimmatlashdi-toshkent-bozorlarida-narxlar-tahlili/amp/
- Anhor.uz, Toshkent narxlari (tuxum, kartoshka, guruch, yog') — https://anhor.uz/vzglyad-iznutri/food-prices-tashkent/ , https://anhor.uz/ru/vzglyad-iznutri/compare-3
- Stat.uz, 2026-oktyabr iste'mol narxlari press-relizi — https://stat.uz/img/news/press-reliz-ini-oktyabr-2026-lotin_p73142.pdf
- Spot.uz, oktyabrda oziq-ovqat +1 %, tuxum +5,2 % — https://www.spot.uz/oz/2026/11/06/october-prices/
- gogov.ru, Toshkent (tovuq filesi, supermarket narxlari) — https://gogov.ru/cost-of-living/tashkent
