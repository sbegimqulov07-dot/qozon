import { ING_MAP } from '../data/ingredients'
import type { Recipe } from '../data/types'
import { addDays, daysBetween, todayStr, uid, type Lot } from './model'
import { unitPrice, type PriceCtx } from './pricing'

export const stockOf = (lots: Lot[], ingId: string) => lots.filter(l => l.ing === ingId).reduce((s, l) => s + l.qty, 0)
export const stockMap = (lots: Lot[]) => { const m: Record<string, number> = {}; for (const l of lots) m[l.ing] = (m[l.ing] ?? 0) + l.qty; return m }

export function defaultExpiry(ingId: string, place?: Lot['place'], from = todayStr()): { expiresAt: string; place: Lot['place'] } {
  const ing = ING_MAP[ingId]
  const p = place ?? ing?.place ?? 'room'
  const days = ing?.shelf[p] ?? ing?.shelf.room ?? ing?.shelf.fridge ?? 30
  return { expiresAt: addDays(from, Math.min(days, 3650)), place: p }
}

export function makeLot(ingId: string, qty: number, ctx: PriceCtx, opts: Partial<Lot> = {}): Lot {
  const ing = ING_MAP[ingId]
  // go'sht ko'p miqdorda olinsa (3 kundan ortiq yetadigan) — muzlatkichga deb hisoblaymiz
  let place = opts.place
  if (!place && ing?.cat === 'gosht' && ing.shelf.freezer && qty >= 500) place = 'freezer'
  const d = defaultExpiry(ingId, place)
  const ref = unitPrice(ingId, ctx)
  // narx kg/L/dona uchun berilgan bo'lsa -> birlik narxiga
  const up = opts.unitPrice ?? ref
  return { id: uid(), ing: ingId, qty, unitPrice: up, boughtAt: todayStr(), expiresAt: d.expiresAt, place: d.place, ...opts, ...(ing ? {} : {}) }
}

/** FIFO sarflash. Qaytaradi: yangi lotlar, sarflangan narx, yetishmagan miqdor */
export function consume(lots: Lot[], ingId: string, qty: number, ctx: PriceCtx): { lots: Lot[]; cost: number; missing: number } {
  let need = qty, cost = 0
  const mine = lots.filter(l => l.ing === ingId).sort((a, b) => a.expiresAt.localeCompare(b.expiresAt) || a.boughtAt.localeCompare(b.boughtAt))
  const others = lots.filter(l => l.ing !== ingId)
  const kept: Lot[] = []
  for (const l of mine) {
    if (need <= 0) { kept.push(l); continue }
    const take = Math.min(l.qty, need)
    cost += take * l.unitPrice
    need -= take
    if (l.qty - take > 0.001) kept.push({ ...l, qty: l.qty - take })
  }
  if (need > 0) cost += need * unitPrice(ingId, ctx) // yo'q narsani ham mo'ljal narxda hisoblaymiz
  return { lots: [...others, ...kept], cost, missing: need }
}

export type Availability = { status: 'full' | 'almost' | 'missing'; missing: { id: string; need: number; have: number }[]; missingCost: number }

export function availability(r: Recipe, stock: Record<string, number>, scale: number, ctx: PriceCtx, reserved: Record<string, number> = {}): Availability {
  const missing: Availability['missing'] = []
  let missingCost = 0
  for (const i of r.ingredients) {
    if (i.opt) continue
    const ing = ING_MAP[i.id]
    const need = i.qty * scale
    const have = Math.max(0, (stock[i.id] ?? 0) - (reserved[i.id] ?? 0))
    // mayda ziravorlar uchun 20% chidam
    const tol = ing && ['tuz', 'murch', 'zira', 'qizil_qalampir', 'koriandr', 'zarchava', 'lavr', 'sirka', 'soda'].includes(i.id) ? 0.5 : 0.9
    if (have < need * tol) {
      missing.push({ id: i.id, need, have })
      missingCost += (need - have) * unitPrice(i.id, ctx)
    }
  }
  if (missing.length === 0) return { status: 'full', missing, missingCost: 0 }
  const hasCore = missing.some(m => ING_MAP[m.id]?.cat === 'gosht' || ING_MAP[m.id]?.cat === 'quruq' && m.have === 0)
  if (missing.length <= 2 && missingCost <= 8000 && !hasCore) return { status: 'almost', missing, missingCost }
  return { status: 'missing', missing, missingCost }
}

export function expiringSoon(lots: Lot[], days = 2, today = todayStr()) {
  return lots.filter(l => daysBetween(today, l.expiresAt) <= days && l.qty > 0).sort((a, b) => a.expiresAt.localeCompare(b.expiresAt))
}
export function expiryState(l: Lot, today = todayStr()): 'ok' | 'soon' | 'urgent' | 'expired' {
  const d = daysBetween(today, l.expiresAt)
  if (d < 0) return 'expired'
  if (d <= 2) return 'urgent'
  if (d <= 5) return 'soon'
  return 'ok'
}
export const pantryValue = (lots: Lot[]) => lots.reduce((s, l) => s + l.qty * l.unitPrice, 0)
