import { ING_MAP, INGREDIENTS } from '../data/ingredients'
import { RECIPE_MAP } from '../data/recipes'
import type { Slot } from '../data/types'
import { addDays, todayStr, uid, type AppData, type ShopLine, type ShoppingList } from './model'
import { stockMap } from './pantry'
import { portionCost, portionKcal, roundToPack, unitPrice } from './pricing'
import { priceCtx, recommend } from './recommend'

const SLOTS: Slot[] = ['nonushta', 'tushlik', 'kechki']

/** gorizont uchun menyu: har kun 3 mahal, batch retseptlar qoldiq bo'lib keyingi kunlarga */
export function generateMenu(data: AppData, horizon: number, start = todayStr(), budgetFactor = 0.9) {
  const menu: Record<string, Partial<Record<Slot, string>>> = {}
  const need: Record<string, number> = {}
  const ctx = priceCtx(data)
  const dayBudget = data.settings.budgetMonthly / 30 * budgetFactor
  let spent = 0, kcalSum = 0
  const hist: { date: string; recipeId: string }[] = data.logs.filter(l => l.type === 'eat' && l.recipeId).map(l => ({ date: l.date, recipeId: l.recipeId! }))
  const pending: { recipeId: string; portions: number; until: string }[] = data.leftovers.map(l => ({ recipeId: l.recipeId, portions: l.portions, until: l.expiresAt }))
  const people = data.settings.people
  let meatDays = 0, weekStart = start
  for (let i = 0; i < horizon; i++) {
    const date = addDays(start, i)
    if ((i % 7) === 0) { meatDays = 0; weekStart = date }
    menu[date] = {}
    for (const slot of SLOTS) {
      // avval qoldiq
      const lf = pending.find(p => p.portions >= people && p.until >= date && slot !== 'nonushta' && RECIPE_MAP[p.recipeId]?.meals[slot] !== 'no')
      if (lf) { lf.portions -= people; menu[date][slot] = lf.recipeId; hist.push({ date, recipeId: lf.recipeId }); const lr = RECIPE_MAP[lf.recipeId]; if (lr) { spent += portionCost(lr, ctx) * people; kcalSum += portionKcal(lr) * people }; continue }
      // virtual ombor: masalliq bo'yicha emas, xilma-xillik bo'yicha tanlaymiz (ombor keyin ayriladi)
      const list = recommend(data, slot, date, { history: hist, lots: [] })
        .filter(s => !(meatDays >= data.settings.meatPerWeek && s.recipe.ingredients.some(x => !x.opt && ING_MAP[x.id]?.cat === 'gosht')) || slot === 'nonushta')
      // byudjet nazorati: shu kungacha sarf rejadan oshsa — arzon variantlar
      const over = spent > (i + 0.34 * (SLOTS.indexOf(slot) + 1)) * dayBudget
      const slotCap = dayBudget * (slot === 'nonushta' ? 0.22 : 0.39)
      const minKcal = slot === 'nonushta' ? 450 : 600
      let cands = list
      if (over) { const c = list.filter(s => s.cost * people <= slotCap && s.kcal >= minKcal); if (c.length) cands = c }
      else { const c = list.filter(s => s.cost * people <= slotCap * 1.4); if (c.length >= 3) cands = c }
      // arzon va to'yimli (kcal / so'm) retseptlarga ustunlik
      const pick = [...cands].sort((a, b) => (b.score + Math.min(14, b.kcal / Math.max(1, b.cost) * 40)) - (a.score + Math.min(14, a.kcal / Math.max(1, a.cost) * 40)))[0]
      if (!pick) continue
      const r = pick.recipe
      spent += portionCost(r, ctx) * people
      kcalSum += portionKcal(r) * people
      menu[date][slot] = r.id
      hist.push({ date, recipeId: r.id })
      if (slot !== 'nonushta' && r.ingredients.some(x => !x.opt && ING_MAP[x.id]?.cat === 'gosht')) meatDays++
      for (const ing of r.ingredients) if (!ing.opt) need[ing.id] = (need[ing.id] ?? 0) + ing.qty * people
      if (r.servings > 1) pending.push({ recipeId: r.id, portions: r.servings * people - people, until: addDays(date, 3) })
    }
  }
  void weekStart
  return { menu, need, planCost: spent, planKcalPerDay: kcalSum / Math.max(1, horizon) / people }
}

export function buildShoppingList(data: AppData, horizon: number, mode: 'plan' | 'par' | 'mix', store: 'bozor' | 'market'): ShoppingList {
  const ctx = { ...priceCtx(data), store }
  const stock = stockMap(data.lots)
  const need: Record<string, number> = {}
  const reasons: Record<string, Set<string>> = {}
  let menu: ShoppingList['menu']
  let planCost = 0, planKcal = 0
  const parIds = new Set<string>()
  if (mode !== 'par') {
    const g = generateMenu(data, horizon)
    menu = g.menu; planCost = g.planCost; planKcal = g.planKcalPerDay
    for (const [id, q] of Object.entries(g.need)) { need[id] = q; reasons[id] = new Set() }
    for (const day of Object.values(g.menu)) for (const rid of Object.values(day)) { const r = RECIPE_MAP[rid!]; if (r) for (const i of r.ingredients) if (!i.opt) reasons[i.id]?.add(r.name.split(' (')[0]) }
  }
  if (mode !== 'plan') {
    for (const ing of INGREDIENTS) if (ing.par) {
      const have = stock[ing.id] ?? 0
      const target = ing.par * (horizon >= 20 ? 2 : 1)
      if (have < target) { if (!need[ing.id]) parIds.add(ing.id); need[ing.id] = Math.max(need[ing.id] ?? 0, target - have + (need[ing.id] ?? 0)); (reasons[ing.id] ??= new Set()).add('Zaxira') }
    }
  }
  const lines: ShopLine[] = []
  for (const [id, q] of Object.entries(need)) {
    const ing = ING_MAP[id]; if (!ing) continue
    if (data.settings.excluded.includes(id)) continue
    const have = stock[id] ?? 0
    let missing = q - have
    // 30 kunlik ro'yxatda tez buziladiganlar faqat 1 haftaga
    const shelf = ing.shelf[ing.place] ?? 30
    if (horizon > 10 && shelf <= 7) missing = Math.min(missing, q * 7 / horizon - have)
    if (missing <= 0) continue
    const rp = roundToPack(id, missing)
    const useQty = Math.min(rp.qty, Math.max(0, missing))
    lines.push({ ing: id, qty: rp.qty, packs: rp.packs, estPrice: rp.qty * unitPrice(id, ctx), useCost: parIds.has(id) ? 0 : useQty * unitPrice(id, ctx), kind: parIds.has(id) ? 'par' : 'plan', reasons: [...(reasons[id] ?? [])].slice(0, 4) })
  }
  const order = ['Go\'sht rastasi', 'Sabzavot-meva', 'Sut mahsulotlari', 'Quruq mahsulotlar', 'Konserva', 'Ziravorlar', 'Non', 'Quruq meva', 'Choy va boshqa']
  lines.sort((a, b) => order.indexOf(ING_MAP[a.ing].section) - order.indexOf(ING_MAP[b.ing].section) || b.estPrice - a.estPrice)
  return { id: uid(), createdAt: new Date().toISOString(), horizon, mode, store, lines, status: 'open', menu, planCost, planKcal }
}
/** shu davrda yeyiladigan qism (zaxira va qadoq qoldig'isiz) */
export const listUseTotal = (l: ShoppingList) => l.lines.reduce((s, x) => s + (x.useCost ?? x.estPrice), 0)
export const listParTotal = (l: ShoppingList) => l.lines.filter(x => x.kind === 'par').reduce((s, x) => s + x.estPrice, 0)

export const listTotal = (l: ShoppingList, actual = false) => l.lines.reduce((s, x) => s + (actual ? (x.checked ? (x.actualPrice ?? x.estPrice) : 0) : x.estPrice), 0)
