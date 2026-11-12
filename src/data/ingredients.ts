import type { Ingredient } from './types'

const kg = 1000
const I = (o: Ingredient) => o

export const INGREDIENTS: Ingredient[] = [
  // ---- Go'sht / parranda ----
  I({ id: 'tovuq', name: 'Tovuq go\'shti (butun/bo\'lak)', ru: 'курица', cat: 'gosht', unit: 'g', pack: 500, packLabel: '500 g', price: 38000, market: 42000, kcal: 215, shelf: { fridge: 2, freezer: 90 }, place: 'fridge', section: 'Go\'sht rastasi', tip: 'Son va oyoqcha qismi palov va qovurmaga eng mazali va arzon.' }),
  I({ id: 'oyoqcha', name: 'Tovuq oyoqcha', ru: 'куриные окорочка', cat: 'gosht', unit: 'g', pack: 500, packLabel: '500 g', price: 42000, market: 46000, kcal: 210, shelf: { fridge: 2, freezer: 90 }, place: 'fridge', section: 'Go\'sht rastasi', subs: ['tovuq'] }),
  I({ id: 'file', name: 'Tovuq filesi', ru: 'куриное филе', cat: 'gosht', unit: 'g', pack: 500, packLabel: '500 g', price: 52000, market: 55000, kcal: 110, shelf: { fridge: 2, freezer: 90 }, place: 'fridge', section: 'Go\'sht rastasi', subs: ['tovuq'] }),
  I({ id: 'tovuq_qiyma', name: 'Tovuq qiymasi', ru: 'куриный фарш', cat: 'gosht', unit: 'g', pack: 500, packLabel: '500 g', price: 45000, market: 48000, kcal: 150, shelf: { fridge: 1, freezer: 60 }, place: 'fridge', section: 'Go\'sht rastasi', subs: ['qiyma'] }),
  I({ id: 'jigar', name: 'Tovuq jigari', ru: 'куриная печень', cat: 'gosht', unit: 'g', pack: 500, packLabel: '500 g', price: 28000, market: 32000, kcal: 135, shelf: { fridge: 1, freezer: 60 }, place: 'fridge', section: 'Go\'sht rastasi' }),
  I({ id: 'mol', name: 'Mol go\'shti', ru: 'говядина', cat: 'gosht', unit: 'g', pack: 500, packLabel: '500 g', price: 110000, market: 125000, kcal: 220, shelf: { fridge: 2, freezer: 90 }, place: 'fridge', section: 'Go\'sht rastasi', tip: 'Palovga yog\'li qismi (qovurg\'a, qorin) — shirali chiqadi.' }),
  I({ id: 'qiyma', name: 'Mol qiymasi', ru: 'говяжий фарш', cat: 'gosht', unit: 'g', pack: 500, packLabel: '500 g', price: 120000, market: 130000, kcal: 250, shelf: { fridge: 1, freezer: 60 }, place: 'fridge', section: 'Go\'sht rastasi', subs: ['tovuq_qiyma'] }),
  I({ id: 'kolbasa', name: 'Kolbasa (pishirilgan)', ru: 'варёная колбаса', cat: 'gosht', unit: 'g', pack: 400, packLabel: '400 g', price: 85000, market: 90000, kcal: 300, shelf: { fridge: 7 }, place: 'fridge', section: 'Sut mahsulotlari' }),
  I({ id: 'sosiska', name: 'Sosiska', ru: 'сосиски', cat: 'gosht', unit: 'g', pack: 400, packLabel: '400 g', price: 70000, market: 75000, kcal: 260, shelf: { fridge: 7, freezer: 60 }, place: 'fridge', section: 'Sut mahsulotlari', subs: ['kolbasa'] }),
  // ---- Tuxum / sut ----
  I({ id: 'tuxum', name: 'Tuxum', ru: 'яйца', cat: 'sut', unit: 'dona', piece: 55, pack: 10, packLabel: '10 dona', price: 1700, market: 2000, kcal: 155, shelf: { fridge: 21, room: 10 }, place: 'fridge', section: 'Sut mahsulotlari', par: 6 }),
  I({ id: 'sut', name: 'Sut', ru: 'молоко', cat: 'sut', unit: 'ml', pack: 1000, packLabel: '1 L', price: 14000, market: 15000, kcal: 60, shelf: { fridge: 5 }, place: 'fridge', section: 'Sut mahsulotlari' }),
  I({ id: 'qatiq', name: 'Qatiq / kefir', ru: 'кефир', cat: 'sut', unit: 'ml', pack: 1000, packLabel: '1 L', price: 13000, market: 14000, kcal: 55, shelf: { fridge: 7 }, place: 'fridge', section: 'Sut mahsulotlari' }),
  I({ id: 'smetana', name: 'Smetana (qaymoq)', ru: 'сметана', cat: 'sut', unit: 'g', pack: 500, packLabel: '500 g', price: 36000, market: 40000, kcal: 200, shelf: { fridge: 10 }, place: 'fridge', section: 'Sut mahsulotlari' }),
  I({ id: 'sariyog', name: 'Sariyog\'', ru: 'сливочное масло', cat: 'sut', unit: 'g', pack: 200, packLabel: '200 g', price: 110000, market: 120000, kcal: 720, shelf: { fridge: 30, freezer: 180 }, place: 'fridge', section: 'Sut mahsulotlari', par: 100 }),
  I({ id: 'pishloq', name: 'Pishloq (qattiq)', ru: 'сыр', cat: 'sut', unit: 'g', pack: 250, packLabel: '250 g', price: 100000, market: 110000, kcal: 350, shelf: { fridge: 20 }, place: 'fridge', section: 'Sut mahsulotlari' }),
  I({ id: 'tvorog', name: 'Tvorog', ru: 'творог', cat: 'sut', unit: 'g', pack: 500, packLabel: '500 g', price: 45000, market: 50000, kcal: 160, shelf: { fridge: 5 }, place: 'fridge', section: 'Sut mahsulotlari' }),
  I({ id: 'mayonez', name: 'Mayonez', ru: 'майонез', cat: 'sut', unit: 'g', pack: 400, packLabel: '400 g', price: 55000, market: 55000, kcal: 650, shelf: { fridge: 60, room: 90 }, place: 'fridge', section: 'Sut mahsulotlari' }),
  // ---- Sabzavot ----
  I({ id: 'kartoshka', name: 'Kartoshka', ru: 'картофель', cat: 'sabzavot', unit: 'g', pack: 500, packLabel: '500 g', price: 6500, market: 7500, kcal: 80, shelf: { room: 30, fridge: 45 }, place: 'room', section: 'Sabzavot-meva', par: 1000, tip: 'Qorong\'i, salqin joyda saqlang; ko\'karganini olmang.' }),
  I({ id: 'piyoz', name: 'Piyoz', ru: 'лук', cat: 'sabzavot', unit: 'g', piece: 120, pack: 500, packLabel: '500 g', price: 4000, market: 5000, kcal: 40, shelf: { room: 30 }, place: 'room', section: 'Sabzavot-meva', par: 800 }),
  I({ id: 'sabzi', name: 'Sabzi (sariq, oshbop)', ru: 'морковь', cat: 'sabzavot', unit: 'g', piece: 100, pack: 500, packLabel: '500 g', price: 6000, market: 7000, kcal: 35, shelf: { fridge: 21, room: 7 }, place: 'fridge', section: 'Sabzavot-meva', par: 500, tip: 'Palovga sariq sabzi, salatga qizil.' }),
  I({ id: 'pomidor', name: 'Pomidor', ru: 'помидоры', cat: 'sabzavot', unit: 'g', piece: 120, pack: 500, packLabel: '500 g', price: 15000, market: 18000, kcal: 20, shelf: { fridge: 6, room: 3 }, place: 'fridge', section: 'Sabzavot-meva', seasonal: true }),
  I({ id: 'bodring', name: 'Bodring', ru: 'огурцы', cat: 'sabzavot', unit: 'g', piece: 100, pack: 500, packLabel: '500 g', price: 18000, market: 20000, kcal: 15, shelf: { fridge: 5 }, place: 'fridge', section: 'Sabzavot-meva', seasonal: true }),
  I({ id: 'karam', name: 'Karam (oq)', ru: 'капуста', cat: 'sabzavot', unit: 'g', pack: 500, packLabel: '500 g (yarim bosh)', price: 5000, market: 6000, kcal: 28, shelf: { fridge: 21 }, place: 'fridge', section: 'Sabzavot-meva' }),
  I({ id: 'bulgor', name: 'Bulg\'or qalampiri', ru: 'болгарский перец', cat: 'sabzavot', unit: 'g', piece: 120, pack: 500, packLabel: '500 g', price: 20000, market: 24000, kcal: 27, shelf: { fridge: 7 }, place: 'fridge', section: 'Sabzavot-meva', seasonal: true }),
  I({ id: 'sarimsoq', name: 'Sarimsoq', ru: 'чеснок', cat: 'sabzavot', unit: 'g', piece: 40, pack: 100, packLabel: '100 g (2–3 bosh)', price: 25000, market: 28000, kcal: 150, shelf: { room: 60 }, place: 'room', section: 'Sabzavot-meva', par: 80 }),
  I({ id: 'qovoq', name: 'Qovoq', ru: 'тыква', cat: 'sabzavot', unit: 'g', pack: 500, packLabel: '500 g (bo\'lak)', price: 6000, market: 7000, kcal: 26, shelf: { room: 60, fridge: 5 }, place: 'room', section: 'Sabzavot-meva' }),
  I({ id: 'kokat', name: 'Ko\'kat (ukrop, kashnich)', ru: 'зелень', cat: 'sabzavot', unit: 'g', piece: 50, pack: 50, packLabel: '1 dasta', price: 50000, market: 60000, kcal: 30, shelf: { fridge: 3 }, place: 'fridge', section: 'Sabzavot-meva', tip: 'Nam sochiqqa o\'rab saqlasangiz 5 kun turadi.' }),
  I({ id: 'tuzlangan_bodring', name: 'Tuzlangan bodring', ru: 'солёные огурцы', cat: 'sabzavot', unit: 'g', pack: 500, packLabel: '500 g banka', price: 36000, market: 36000, kcal: 12, shelf: { room: 90, fridge: 30 }, place: 'room', section: 'Konserva' }),
  // ---- Meva ----
  I({ id: 'olma', name: 'Olma', ru: 'яблоки', cat: 'meva', unit: 'g', piece: 150, pack: 500, packLabel: '500 g', price: 12000, market: 14000, kcal: 52, shelf: { fridge: 21, room: 7 }, place: 'room', section: 'Sabzavot-meva' }),
  I({ id: 'banan', name: 'Banan', ru: 'бананы', cat: 'meva', unit: 'dona', piece: 120, pack: 5, packLabel: '5 dona (≈0,6 kg)', price: 3500, market: 3800, kcal: 90, shelf: { room: 5 }, place: 'room', section: 'Sabzavot-meva' }),
  I({ id: 'limon', name: 'Limon', ru: 'лимон', cat: 'meva', unit: 'dona', piece: 100, pack: 2, packLabel: '2 dona', price: 2500, market: 3000, kcal: 30, shelf: { fridge: 21, room: 10 }, place: 'room', section: 'Sabzavot-meva' }),
  // ---- Quruq mahsulotlar ----
  I({ id: 'guruch', name: 'Guruch (lazer)', ru: 'рис', cat: 'quruq', unit: 'g', pack: 1000, packLabel: '1 kg', price: 20000, market: 22000, kcal: 350, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar', par: 1000, tip: 'Palovga lazer yoki devzira; bo\'tqaga oddiy kraxmalli guruch.' }),
  I({ id: 'un', name: 'Un (oliy nav)', ru: 'мука', cat: 'quruq', unit: 'g', pack: 1000, packLabel: '1 kg', price: 7000, market: 8000, kcal: 340, shelf: { room: 180 }, place: 'room', section: 'Quruq mahsulotlar', par: 500 }),
  I({ id: 'makaron', name: 'Makaron / spagetti', ru: 'макароны', cat: 'quruq', unit: 'g', pack: 500, packLabel: '500 g', price: 12000, market: 13000, kcal: 350, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar', par: 500 }),
  I({ id: 'vermishel', name: 'Vermishel (mayda)', ru: 'вермишель', cat: 'quruq', unit: 'g', pack: 400, packLabel: '400 g', price: 12000, market: 13000, kcal: 350, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar', subs: ['makaron'] }),
  I({ id: 'grechka', name: 'Grechka', ru: 'гречка', cat: 'quruq', unit: 'g', pack: 900, packLabel: '900 g', price: 22000, market: 24000, kcal: 340, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar' }),
  I({ id: 'suli', name: 'Suli yormasi (gerkules)', ru: 'овсяные хлопья', cat: 'quruq', unit: 'g', pack: 500, packLabel: '500 g', price: 18000, market: 20000, kcal: 370, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar' }),
  I({ id: 'manniy', name: 'Manniy yorma (manka)', ru: 'манка', cat: 'quruq', unit: 'g', pack: 900, packLabel: '900 g', price: 12000, market: 13000, kcal: 340, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar' }),
  I({ id: 'mosh', name: 'Mosh', ru: 'маш', cat: 'quruq', unit: 'g', pack: 500, packLabel: '500 g', price: 25000, market: 28000, kcal: 330, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar', subs: ['yasmiq'] }),
  I({ id: 'yasmiq', name: 'Yasmiq (qizil)', ru: 'чечевица', cat: 'quruq', unit: 'g', pack: 500, packLabel: '500 g', price: 25000, market: 28000, kcal: 330, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar', subs: ['mosh'] }),
  I({ id: 'noxat_konserva', name: 'Yashil no\'xat (konserva)', ru: 'зелёный горошек', cat: 'quruq', unit: 'g', pack: 400, packLabel: '400 g banka', price: 35000, market: 35000, kcal: 80, shelf: { room: 365, fridge: 3 }, place: 'room', section: 'Konserva' }),
  I({ id: 'non', name: 'Non (obi non)', ru: 'лепёшка', cat: 'quruq', unit: 'g', piece: 350, pack: 350, packLabel: '1 dona', price: 14300, market: 14300, kcal: 260, shelf: { room: 3, freezer: 30 }, place: 'room', section: 'Non', par: 350, tip: '1 dona ≈ 350 g ≈ 5 000 so\'m. Qotgan non — grenkiga.' }),
  // ---- Yog' / ziravor ----
  I({ id: 'yog', name: 'O\'simlik yog\'i', ru: 'растительное масло', cat: 'yog', unit: 'ml', pack: 1000, packLabel: '1 L', price: 24000, market: 26000, kcal: 900, shelf: { room: 365 }, place: 'room', section: 'Quruq mahsulotlar', par: 500 }),
  I({ id: 'tuz', name: 'Tuz', ru: 'соль', cat: 'yog', unit: 'g', pack: 1000, packLabel: '1 kg', price: 3000, market: 3500, kcal: 0, shelf: { room: 9999 }, place: 'room', section: 'Ziravorlar', par: 300 }),
  I({ id: 'shakar', name: 'Shakar', ru: 'сахар', cat: 'yog', unit: 'g', pack: 1000, packLabel: '1 kg', price: 13000, market: 14000, kcal: 400, shelf: { room: 9999 }, place: 'room', section: 'Quruq mahsulotlar', par: 400 }),
  I({ id: 'murch', name: 'Qora murch (maydalangan)', ru: 'чёрный перец', cat: 'yog', unit: 'g', pack: 50, packLabel: '50 g', price: 300000, market: 320000, kcal: 250, shelf: { room: 365 }, place: 'room', section: 'Ziravorlar', par: 15 }),
  I({ id: 'zira', name: 'Zira', ru: 'зира', cat: 'yog', unit: 'g', pack: 50, packLabel: '50 g', price: 240000, market: 260000, kcal: 350, shelf: { room: 365 }, place: 'room', section: 'Ziravorlar', par: 15 }),
  I({ id: 'qizil_qalampir', name: 'Qizil qalampir (maydalangan)', ru: 'красный перец', cat: 'yog', unit: 'g', pack: 50, packLabel: '50 g', price: 160000, market: 180000, kcal: 280, shelf: { room: 365 }, place: 'room', section: 'Ziravorlar', par: 15 }),
  I({ id: 'koriandr', name: 'Koriandr (maydalangan)', ru: 'кориандр', cat: 'yog', unit: 'g', pack: 50, packLabel: '50 g', price: 160000, market: 180000, kcal: 300, shelf: { room: 365 }, place: 'room', section: 'Ziravorlar', par: 10 }),
  I({ id: 'zarchava', name: 'Zarchava (kurkuma)', ru: 'куркума', cat: 'yog', unit: 'g', pack: 50, packLabel: '50 g', price: 160000, market: 180000, kcal: 310, shelf: { room: 365 }, place: 'room', section: 'Ziravorlar' }),
  I({ id: 'lavr', name: 'Lavr bargi', ru: 'лавровый лист', cat: 'yog', unit: 'g', pack: 10, packLabel: '10 g', price: 500000, market: 500000, kcal: 0, shelf: { room: 365 }, place: 'room', section: 'Ziravorlar' }),
  I({ id: 'pasta', name: 'Pomidor pastasi', ru: 'томатная паста', cat: 'yog', unit: 'g', pack: 500, packLabel: '500 g banka', price: 36000, market: 36000, kcal: 80, shelf: { room: 365, fridge: 14 }, place: 'room', section: 'Konserva', par: 100 }),
  I({ id: 'sirka', name: 'Sirka (9%)', ru: 'уксус', cat: 'yog', unit: 'ml', pack: 500, packLabel: '500 ml', price: 12000, market: 12000, kcal: 0, shelf: { room: 9999 }, place: 'room', section: 'Ziravorlar' }),
  I({ id: 'soya', name: 'Soya sousi', ru: 'соевый соус', cat: 'yog', unit: 'ml', pack: 250, packLabel: '250 ml', price: 60000, market: 60000, kcal: 60, shelf: { room: 180 }, place: 'room', section: 'Ziravorlar' }),
  I({ id: 'ketchup', name: 'Ketchup', ru: 'кетчуп', cat: 'yog', unit: 'g', pack: 400, packLabel: '400 g', price: 40000, market: 40000, kcal: 100, shelf: { fridge: 60 }, place: 'fridge', section: 'Konserva' }),
  I({ id: 'soda', name: 'Ichimlik sodasi', ru: 'сода', cat: 'yog', unit: 'g', pack: 500, packLabel: '500 g', price: 10000, market: 10000, kcal: 0, shelf: { room: 9999 }, place: 'room', section: 'Ziravorlar' }),
  // ---- Boshqa ----
  I({ id: 'choy', name: 'Ko\'k choy', ru: 'зелёный чай', cat: 'boshqa', unit: 'g', pack: 100, packLabel: '100 g', price: 200000, market: 220000, kcal: 0, shelf: { room: 365 }, place: 'room', section: 'Choy va boshqa', par: 30 }),
  I({ id: 'asal', name: 'Asal', ru: 'мёд', cat: 'boshqa', unit: 'g', pack: 500, packLabel: '500 g', price: 120000, market: 130000, kcal: 320, shelf: { room: 9999 }, place: 'room', section: 'Choy va boshqa' }),
  I({ id: 'mayiz', name: 'Mayiz', ru: 'изюм', cat: 'boshqa', unit: 'g', pack: 500, packLabel: '500 g', price: 40000, market: 45000, kcal: 300, shelf: { room: 180 }, place: 'room', section: 'Quruq meva' }),
  I({ id: 'yongoq', name: 'Yong\'oq (mag\'iz)', ru: 'грецкий орех', cat: 'boshqa', unit: 'g', pack: 500, packLabel: '500 g', price: 90000, market: 100000, kcal: 650, shelf: { room: 90, fridge: 180 }, place: 'room', section: 'Quruq meva' }),
]

export const ING_MAP: Record<string, Ingredient> = Object.fromEntries(INGREDIENTS.map(i => [i.id, i]))

export const CATEGORY_LABEL: Record<string, string> = {
  gosht: 'Go\'sht va parranda', sut: 'Tuxum va sut mahsulotlari', sabzavot: 'Sabzavotlar', meva: 'Mevalar',
  quruq: 'Quruq mahsulotlar', yog: 'Yog\' va ziravorlar', boshqa: 'Boshqa',
}

/** Tez kiritish uchun eng ko'p uchraydigan masalliqlar */
export const QUICK_PANTRY = ['tuz', 'yog', 'guruch', 'un', 'piyoz', 'kartoshka', 'sabzi', 'tuxum', 'choy', 'shakar', 'makaron', 'non', 'sut', 'tovuq', 'sarimsoq', 'pasta', 'zira', 'murch', 'sariyog', 'pomidor']
