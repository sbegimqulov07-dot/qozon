import { ING_MAP } from '../data/ingredients'
import { RECIPE_MAP } from '../data/recipes'
import type { Recipe, Slot } from '../data/types'
import { daysBetween, todayStr, type AppData, type Lot } from './model'
import { availability, stockMap, type Availability } from './pantry'
import { portionCost, portionKcal, type PriceCtx } from './pricing'

export interface Scored { recipe: Recipe; score: number; avail: Availability; reasons: string[]; warns: string[]; cost: number; kcal: number }

const seed = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return ((h >>> 0) % 1000) / 1000 }

export function season(d = new Date()): 'yoz' | 'qish' | 'kuz' | 'bahor' {
  const m = d.getMonth() + 1
  if (m >= 6 && m <= 8) return 'yoz'
  if (m >= 9 && m <= 11) return 'kuz'
  if (m === 12 || m <= 2) return 'qish'
  return 'bahor'
}

export function priceCtx(data: AppData): PriceCtx { return { override: data.priceOverride, store: data.settings.store } }

export function activeRecipes(data: AppData): Recipe[] {
  const ex = new Set(data.settings.excluded)
  return data.myRecipes.map(id => RECIPE_MAP[id]).filter(Boolean).filter(r => !r.ingredients.some(i => !i.opt && ex.has(i.id)))
}

/** kun davomida yeyilgan kcal */
export function dayKcal(data: AppData, date: string) {
  return data.logs.filter(l => l.date === date && (l.type === 'eat' || l.type === 'eat_out')).reduce((s, l) => s + l.kcal, 0)
}
export function dayCost(data: AppData, date: string) {
  return data.logs.filter(l => l.date === date && (l.type === 'eat' || l.type === 'eat_out')).reduce((s, l) => s + l.cost, 0)
}

export function recommend(data: AppData, slot: Slot, date = todayStr(), opts: { quick?: boolean; cheap?: boolean; noMeat?: boolean; reserved?: Record<string, number>; lots?: Lot[]; history?: { date: string; recipeId: string }[]; allowToday?: boolean } = {}): Scored[] {
  const ctx = priceCtx(data)
  const lots = opts.lots ?? data.lots
  const stock = stockMap(lots)
  const s = data.settings
  const d = new Date(date + 'T12:00:00')
  const weekend = d.getDay() === 0 || d.getDay() === 6
  const timeLimit = opts.quick ? 20 : (weekend ? s.timeWeekend : s.timeWeekday)
  const dayLimit = s.budgetMonthly / 30
  const hist = opts.history ?? data.logs.filter(l => (l.type === 'eat' || l.type === 'cook') && l.recipeId).map(l => ({ date: l.date, recipeId: l.recipeId! }))
  const lastEaten: Record<string, number> = {}
  for (const h of hist) { const dd = daysBetween(h.date, date); if (dd >= 0 && (lastEaten[h.recipeId] === undefined || dd < lastEaten[h.recipeId])) lastEaten[h.recipeId] = dd }
  const todayEaten = hist.filter(h => h.date === date).map(h => RECIPE_MAP[h.recipeId]).filter(Boolean)
  const hadProtein = todayEaten.some(r => r.ingredients.some(i => !i.opt && (ING_MAP[i.id]?.cat === 'gosht' || i.id === 'tuxum' || i.id === 'mosh' || i.id === 'yasmiq')))
  const lastBase = todayEaten.flatMap(r => r.ingredients.filter(i => ['guruch', 'kartoshka', 'makaron'].includes(i.id)).map(i => i.id))
  const urgentIngs = new Set(lots.filter(l => daysBetween(date, l.expiresAt) <= 2).map(l => l.ing))
  const soonIngs = new Set(lots.filter(l => { const x = daysBetween(date, l.expiresAt); return x > 2 && x <= 5 }).map(l => l.ing))
  const seas = season(d)
  const monthDay = d.getDate()
  const budgetTight = monthDay > 20 && (data.logs.filter(l => l.date.slice(0, 7) === date.slice(0, 7) && (l.type === 'eat' || l.type === 'eat_out')).reduce((a, l) => a + l.cost, 0) > s.budgetMonthly * monthDay / 30 * 1.05)

  const out: Scored[] = []
  for (const r of activeRecipes(data)) {
    const fit = r.meals[slot] ?? 'no'
    if (fit === 'no') continue
    if (r.time > timeLimit * 2 && !(slot !== 'nonushta' && weekend)) continue
    if (opts.noMeat && r.ingredients.some(i => !i.opt && ING_MAP[i.id]?.cat === 'gosht')) continue
    const reasons: string[] = [], warns: string[] = []
    let score = 0
    const av = availability(r, stock, s.people, ctx, opts.reserved)
    if (av.status === 'full') { score += 40; reasons.push(Object.keys(av.subs ?? {}).length ? `Hamma masalliq bor (${Object.entries(av.subs!).map(([a, b]) => `${ING_MAP[a]?.name.split(' (')[0]} → ${ING_MAP[b]?.name.split(' (')[0]}`).join(', ')})` : 'Hamma masalliq bor') }
    else if (av.status === 'almost') { score += 25; warns.push(`${av.missing.length} ta yetishmaydi: ${av.missing.map(m => ING_MAP[m.id]?.name.split(' (')[0]).join(', ')}`) }
    else warns.push(`Bozorlik kerak: ${av.missing.slice(0, 3).map(m => ING_MAP[m.id]?.name.split(' (')[0]).join(', ')}${av.missing.length > 3 ? '…' : ''}`)
    const used = r.ingredients.filter(i => !i.opt).map(i => i.id)
    const urg = used.filter(i => urgentIngs.has(i))
    if (urg.length) { score += 20; reasons.push(`${ING_MAP[urg[0]]?.name.split(' (')[0]} 2 kunda buziladi`) }
    else { const so = used.filter(i => soonIngs.has(i)); if (so.length) { score += 10; reasons.push(`${ING_MAP[so[0]]?.name.split(' (')[0]} tez ishlatilishi kerak`) } }
    const le = lastEaten[r.id]
    if (le === 0 && !opts.allowToday) continue // bugun yeyilgan ovqat boshqa mahalga tavsiya qilinmaydi
    if (le !== undefined && le <= 2 && slot !== 'nonushta') { score -= 25; warns.push(`${le} kun oldin yedingiz`) }
    else if (le !== undefined && le <= 6 && slot !== 'nonushta') score -= 10
    else if (le === undefined || le >= 14) { score += 5; if (le !== undefined) reasons.push('Anchadan beri yemadingiz') }
    if (lastBase.length && r.ingredients.some(i => lastBase.includes(i.id)) && slot !== 'nonushta') score -= 8
    if (r.time <= timeLimit) { score += 10; reasons.push(`${r.time} daqiqa`) }
    else if (r.time <= timeLimit * 1.5) warns.push(`${r.time} daqiqa`)
    else { score -= 20; warns.push(`${r.time} daqiqa — bugun vaqt kam`) }
    const pc = portionCost(r, ctx)
    const pricW = budgetTight || opts.cheap ? 2 : 1
    if (pc < dayLimit / 3) { score += 8 * pricW; reasons.push('Arzon') }
    else if (pc > dayLimit / 3 * 1.5) { score -= 8 * pricW; warns.push('Qimmatroq') }
    score += fit === 'main' ? 10 : 3
    if (r.season && r.season === seas) { score += 5; reasons.push('Mavsumga mos') }
    if (r.season === 'yoz' && seas === 'qish') score -= 10
    const protein = r.ingredients.some(i => !i.opt && (ING_MAP[i.id]?.cat === 'gosht' || i.id === 'tuxum' || i.id === 'mosh' || i.id === 'yasmiq' || i.id === 'tvorog'))
    if (!hadProtein && protein && slot !== 'nonushta') { score += 8; reasons.push('Oqsil kerak') }
    if (data.favorites.includes(r.id)) { score += 5; reasons.push('Sevimli') }
    if (data.disliked.includes(r.id)) score -= 15
    if (r.cat === 'garnir' && slot !== 'tamaddi') { score -= 12; warns.push('Garnir — asosiy ovqat emas') }
    if (s.thursdayPlov && d.getDay() === 4 && slot === 'kechki' && r.id.includes('palov')) { score += 8; reasons.push('Payshanba oshi') }
    const kcal = portionKcal(r)
    if (slot !== 'tamaddi' && kcal >= 650) { score += 4; reasons.push(`${Math.round(kcal)} kcal`) }
    if (r.servings > 1 && weekend) score += 3
    score += (seed(date + r.id) - 0.5) * 6
    out.push({ recipe: r, score, avail: av, reasons: reasons.slice(0, 4), warns: warns.slice(0, 3), cost: pc, kcal })
  }
  // avval omborda bori: hammasi bor → deyarli bor → bozorlik kerak; ichida ball bo'yicha
  const rank = (s: Scored) => (s.avail.status === 'full' ? 0 : s.avail.status === 'almost' ? 1 : 2) + (s.recipe.cat === 'garnir' && slot !== 'tamaddi' ? 1 : 0)
  return out.sort((a, b) => rank(a) - rank(b) || b.score - a.score)
}

/** kaloriya yetmasa tamaddi takliflari */
export function snackIdeas(data: AppData, deficit: number): Scored[] {
  return recommend(data, 'tamaddi').filter(s => s.avail.status !== 'missing').sort((a, b) => Math.abs(a.kcal - deficit) - Math.abs(b.kcal - deficit)).slice(0, 3)
}
