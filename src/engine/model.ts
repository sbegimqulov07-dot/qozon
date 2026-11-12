import type { Place, Slot } from '../data/types'

export interface Lot { id: string; ing: string; qty: number; unitPrice: number; boughtAt: string; expiresAt: string; place: Place; source?: string }
export interface Leftover { id: string; recipeId: string; name: string; portions: number; portionCost: number; portionKcal: number; cookedAt: string; expiresAt: string; frozen?: boolean }
export interface Plan { date: string; slot: Slot; recipeId?: string; leftoverId?: string; status: 'planned' | 'done' | 'skipped' }
export interface LogEvent {
  id: string; ts: string; date: string; type: 'cook' | 'eat' | 'waste' | 'adjust' | 'buy' | 'eat_out' | 'water'
  recipeId?: string; name?: string; slot?: Slot; portions?: number; cost: number; kcal: number
  ingCost?: number; ing?: string; qty?: number; note?: string
}
export interface ShopLine { ing: string; qty: number; estPrice: number; reasons: string[]; checked?: boolean; actualQty?: number; actualPrice?: number; packs: number; useCost?: number; kind?: 'plan' | 'par' }
export interface ShoppingList { id: string; createdAt: string; horizon: number; mode: 'plan' | 'par' | 'mix'; store: 'bozor' | 'market'; lines: ShopLine[]; status: 'open' | 'done'; menu?: Record<string, Partial<Record<Slot, string>>>; planCost?: number; planKcal?: number }
export interface Purchase { id: string; date: string; store: string; lines: { ing: string; qty: number; price: number }[]; total: number; plannedTotal: number }
export interface Settings {
  name: string; people: number; timeWeekday: number; timeWeekend: number
  equipment: string[]; excluded: string[]; budgetMonthly: number; store: 'bozor' | 'market'
  eatOutPrice: number; kcalTarget: number; waterTarget: number; thursdayPlov: boolean
  meatPerWeek: number; theme: 'auto' | 'light' | 'dark'; bigFont: boolean; syncCode: string
}
export interface AppData {
  v: number; rev: number; updatedAt: string; onboarded: boolean
  settings: Settings
  myRecipes: string[]
  priceOverride: Record<string, number>
  priceHistory: Record<string, { date: string; price: number; store: string }[]>
  lots: Lot[]
  leftovers: Leftover[]
  plans: Plan[]
  logs: LogEvent[]
  purchases: Purchase[]
  shopping: ShoppingList | null
  water: Record<string, number>
  favorites: string[]
  disliked: string[]
  stamps?: Record<string, string>
  dirty?: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  name: '', people: 1, timeWeekday: 45, timeWeekend: 90, equipment: ['plita', 'qozon', 'tova', 'muzlatgich'], excluded: [],
  budgetMonthly: 1200000, store: 'bozor', eatOutPrice: 30000, kcalTarget: 2600, waterTarget: 2000, thursdayPlov: true,
  meatPerWeek: 5, theme: 'auto', bigFont: false, syncCode: '',
}

export const emptyData = (): AppData => ({
  v: 1, rev: 0, updatedAt: new Date().toISOString(), onboarded: false,
  settings: { ...DEFAULT_SETTINGS }, myRecipes: [], priceOverride: {}, priceHistory: {},
  lots: [], leftovers: [], plans: [], logs: [], purchases: [], shopping: null, water: {}, favorites: [], disliked: [], stamps: {}, dirty: false,
})

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
export const todayStr = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return z.toISOString().slice(0, 10)
}
export const addDays = (date: string, n: number) => { const d = new Date(date + 'T12:00:00'); d.setDate(d.getDate() + n); return todayStr(d) }
export const daysBetween = (a: string, b: string) => Math.round((new Date(b + 'T12:00:00').getTime() - new Date(a + 'T12:00:00').getTime()) / 86400000)

const SECTIONS = ['onboarded', 'settings', 'myRecipes', 'priceOverride', 'priceHistory', 'lots', 'leftovers', 'plans', 'logs', 'purchases', 'shopping', 'water', 'favorites', 'disliked'] as const
type Sec = typeof SECTIONS[number]

/** o'zgargan bo'limlarga vaqt muhri qo'yadi */
export function stampChanges(before: AppData, after: AppData, now = new Date().toISOString()) {
  after.stamps = { ...(before.stamps ?? {}) }
  for (const k of SECTIONS) {
    if (JSON.stringify(before[k]) !== JSON.stringify(after[k])) after.stamps[k] = now
  }
}

const byId = <T extends { id: string }>(a: T[], b: T[]) => { const m = new Map<string, T>(); for (const x of a) m.set(x.id, x); for (const x of b) if (!m.has(x.id)) m.set(x.id, x); return [...m.values()] }

/** ikki holatni bo'limma-bo'lim birlashtiradi: yangiroq bo'lim g'olib, kundalik va xaridlar — birlashma */
export function mergeData(local: AppData, remote: AppData, remoteAt: string): AppData {
  void remoteAt
  const out: AppData = { ...remote, stamps: { ...(remote.stamps ?? {}) } }
  const ls = local.stamps ?? {}, rs = remote.stamps ?? {}
  for (const k of SECTIONS) {
    const l = ls[k] ?? '', r = rs[k] ?? ''
    if (k === 'logs') { out.logs = byId(local.logs, remote.logs).sort((a, b) => a.ts.localeCompare(b.ts)); out.stamps![k] = l > r ? l : r; continue }
    if (k === 'purchases') { out.purchases = byId(local.purchases, remote.purchases); out.stamps![k] = l > r ? l : r; continue }
    if (l > r) { (out as unknown as Record<Sec, unknown>)[k] = local[k]; out.stamps![k] = l }
  }
  out.updatedAt = local.updatedAt > remote.updatedAt ? local.updatedAt : remote.updatedAt
  return out
}
