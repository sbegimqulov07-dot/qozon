# Qozon — uy oshxonasi yordamchisi

Har kuni nima pishirishni tavsiya qiladi, qadamma-qadam o'rgatadi, omborni (grocery bank) yuritadi, bozorlik ro'yxatini narxlari bilan tuzadi, xarajat va kaloriyani hisoblaydi. O'zbekiston sharoiti, so'mda.

## Ishga tushirish
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ — statik sayt (GitHub Pages, Netlify)
```

## Joylash (GitHub Pages)
1. Repo → Settings → Pages → Source: **GitHub Actions**.
2. `main`ga push qilinsa `.github/workflows/deploy.yml` o'zi quradi va joylaydi.

## Sinxron
Ma'lumot qurilmada (localStorage) saqlanadi. "Sinxron kodi" kiritilsa, Supabase'dagi `qozon_state` jadvaliga (faqat `qozon_load` / `qozon_save` RPC orqali, kod sha256 bilan xeshlanadi) butun holat yoziladi va boshqa qurilmalar 25 soniyada / ekran ochilganda tortib oladi. Kod — parol: kim bilsa, ko'radi.

## Tuzilma
- `src/data` — 60 masalliq (narx, kcal, muddat, qadoq), 49 retsept (qadamlar, taymerlar)
- `src/engine` — narx/kcal (`pricing`), ombor FIFO (`pantry`), tavsiya ballari (`recommend`), bozorlik generatori (`shopping`)
- `src/store` — Zustand + localStorage + Supabase sinxron
- `src/screens` — Bugun, Retseptlar, Pishirish, Ombor, Bozorlik, Hisobot, Sozlamalar, Onboarding
- `STRATEGIYA.md` — to'liq mahsulot strategiyasi
