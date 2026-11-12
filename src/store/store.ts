import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ING_MAP } from '../data/ingredients'
import { RECIPE_MAP, RECIPES } from '../data/recipes'
import type { Slot } from '../data/types'
import { addDays, emptyData, mergeData, stampChanges, todayStr, uid, type AppData, type Leftover, type Lot, type LogEvent, type Settings, type ShoppingList } from '../engine/model'
import { consume, defaultExpiry, makeLot } from '../engine/pantry'
import { recipeKcal, unitPrice } from '../engine/pricing'
import { priceCtx } from '../engine/recommend'
import { loadRemote, saveRemote, SUPABASE_KEY, SUPABASE_URL } from './sync'

type SyncState = 'off' | 'idle' | 'syncing' | 'error'
interface Store {
  data: AppData
  toast: { msg: string; undo?: () => void } | null
  sync: SyncState
  syncMsg: string
  set: (fn: (d: AppData) => void, opts?: { silent?: boolean }) => void
  showToast: (msg: string, undo?: () => void) => void
  // actions
  finishOnboarding: (settings: Partial<Settings>, recipes: string[], pantry: { id: string; qty: number }[]) => void
  toggleRecipe: (id: string) => void
  setMyRecipes: (ids: string[]) => void
  toggleFav: (id: string) => void
  toggleDislike: (id: string) => void
  updateSettings: (p: Partial<Settings>) => void
  addLot: (ing: string, qty: number, pricePerRef?: number, place?: Lot['place'], source?: string) => void
  adjustLot: (ing: string, newQty: number, note?: string) => void
  wasteIng: (ing: string, qty: number, note?: string) => void
  freezeIng: (ing: string) => void
  cook: (recipeId: string, scale: number, portionsMade: number, eatNow: number, slot: Slot, date?: string) => { cost: number; kcal: number }
  eatLeftover: (leftoverId: string, portions: number, slot: Slot) => void
  wasteLeftover: (leftoverId: string) => void
  eatOut: (slot: Slot, cost: number, kcal: number, name: string) => void
  skipSlot: (slot: Slot, date?: string) => void
  planSlot: (slot: Slot, recipeId: string, date?: string) => void
  addWater: (ml: number) => void
  setShopping: (l: ShoppingList | null) => void
  toggleShopLine: (ing: string, actualQty?: number, actualPrice?: number) => void
  finishShopping: () => void
  setPriceOverride: (ing: string, price: number | null) => void
  importData: (json: string) => boolean
  // sync
  connectSync: (code: string, prefer: 'remote' | 'local') => Promise<string>
  pushNow: () => Promise<void>
  pullNow: () => Promise<boolean>
}

let pushTimer: ReturnType<typeof setTimeout> | null = null

export const useStore = create<Store>()(persist((set, get) => ({
  data: emptyData(), toast: null, sync: 'off', syncMsg: '',
  set: (fn, opts) => {
    const before = get().data
    const d = structuredClone(before)
    fn(d)
    d.updatedAt = new Date().toISOString()
    stampChanges(before, d, d.updatedAt)
    d.dirty = true
    set({ data: d })
    if (!opts?.silent && d.settings.syncCode) schedulePush()
  },
  showToast: (msg, undo) => { set({ toast: { msg, undo } }); setTimeout(() => { if (get().toast?.msg === msg) set({ toast: null }) }, 4000) },

  finishOnboarding: (settings, recipes, pantry) => get().set(d => {
    d.settings = { ...d.settings, ...settings }
    d.myRecipes = recipes
    const ctx = priceCtx(d)
    for (const p of pantry) if (p.qty > 0) d.lots.push(makeLot(p.id, p.qty, ctx, { source: 'boshlang\'ich' }))
    d.onboarded = true
  }),
  setMyRecipes: ids => get().set(d => { d.myRecipes = ids }),
  toggleRecipe: id => get().set(d => { d.myRecipes = d.myRecipes.includes(id) ? d.myRecipes.filter(x => x !== id) : [...d.myRecipes, id] }),
  toggleFav: id => get().set(d => { d.favorites = d.favorites.includes(id) ? d.favorites.filter(x => x !== id) : [...d.favorites, id]; d.disliked = d.disliked.filter(x => x !== id) }),
  toggleDislike: id => get().set(d => { d.disliked = d.disliked.includes(id) ? d.disliked.filter(x => x !== id) : [...d.disliked, id]; d.favorites = d.favorites.filter(x => x !== id) }),
  updateSettings: p => get().set(d => { d.settings = { ...d.settings, ...p } }),

  addLot: (ing, qty, pricePerRef, place, source) => get().set(d => {
    const ctx = priceCtx(d)
    const I = ING_MAP[ing]
    const up = pricePerRef !== undefined ? (I.unit === 'dona' ? pricePerRef : pricePerRef / 1000) : unitPrice(ing, ctx)
    d.lots.push(makeLot(ing, qty, ctx, { unitPrice: up, place, source }))
    if (pricePerRef !== undefined && pricePerRef > 0) learnPrice(d, ing, pricePerRef)
  }),
  adjustLot: (ing, newQty, note) => get().set(d => {
    const ctx = priceCtx(d)
    const cur = d.lots.filter(l => l.ing === ing).reduce((s, l) => s + l.qty, 0)
    if (newQty < cur) {
      const r = consume(d.lots, ing, cur - newQty, ctx); d.lots = r.lots
      d.logs.push(log({ type: 'adjust', ing, qty: cur - newQty, cost: r.cost, kcal: 0, note: note ?? 'Tuzatish' }))
    } else if (newQty > cur) {
      const last = [...d.lots].reverse().find(l => l.ing === ing)
      d.lots.push(makeLot(ing, newQty - cur, ctx, { unitPrice: last?.unitPrice, place: last?.place, source: 'tuzatish' }))
    }
  }),
  wasteIng: (ing, qty, note) => get().set(d => {
    const ctx = priceCtx(d)
    const r = consume(d.lots, ing, qty, ctx); d.lots = r.lots
    d.logs.push(log({ type: 'waste', ing, qty, cost: r.cost, kcal: 0, note: note ?? 'Buzildi' }))
  }),
  freezeIng: ing => get().set(d => {
    for (const l of d.lots) if (l.ing === ing && l.place !== 'freezer' && ING_MAP[ing]?.shelf.freezer) { l.place = 'freezer'; l.expiresAt = defaultExpiry(ing, 'freezer').expiresAt }
  }),

  cook: (recipeId, scale, portionsMade, eatNow, slot, date = todayStr()) => {
    let cost = 0, kcal = 0
    get().set(d => {
      const r = RECIPE_MAP[recipeId]; if (!r) return
      const ctx = priceCtx(d)
      let ingCost = 0
      for (const i of r.ingredients) {
        if (i.opt) continue
        const res = consume(d.lots, i.id, i.qty * scale, ctx)
        d.lots = res.lots; ingCost += res.cost
      }
      const totalKcal = recipeKcal(r, scale)
      const pm = Math.max(1, portionsMade)
      const pCost = ingCost / pm, pKcal = totalKcal / pm
      cost = pCost * eatNow; kcal = pKcal * eatNow
      d.logs.push(log({ type: 'cook', recipeId, name: r.name, slot, portions: pm, cost: ingCost, kcal: totalKcal, ingCost, date }))
      if (eatNow > 0) d.logs.push(log({ type: 'eat', recipeId, name: r.name, slot, portions: eatNow, cost, kcal, date }))
      const left = pm - eatNow
      if (left > 0) d.leftovers.push({ id: uid(), recipeId, name: r.name, portions: left, portionCost: pCost, portionKcal: pKcal, cookedAt: date, expiresAt: addDays(date, 3) })
      setPlan(d, date, slot, { recipeId, status: 'done' })
    })
    return { cost, kcal }
  },
  eatLeftover: (leftoverId, portions, slot) => get().set(d => {
    const lf = d.leftovers.find(l => l.id === leftoverId); if (!lf) return
    const p = Math.min(portions, lf.portions)
    lf.portions -= p
    d.logs.push(log({ type: 'eat', recipeId: lf.recipeId, name: lf.name + ' (qoldiq)', slot, portions: p, cost: lf.portionCost * p, kcal: lf.portionKcal * p }))
    if (lf.portions <= 0.01) d.leftovers = d.leftovers.filter(l => l.id !== leftoverId)
    setPlan(d, todayStr(), slot, { leftoverId, recipeId: lf.recipeId, status: 'done' })
  }),
  wasteLeftover: leftoverId => get().set(d => {
    const lf = d.leftovers.find(l => l.id === leftoverId); if (!lf) return
    d.logs.push(log({ type: 'waste', name: lf.name, cost: lf.portionCost * lf.portions, kcal: 0, note: 'Qoldiq tashlandi' }))
    d.leftovers = d.leftovers.filter(l => l.id !== leftoverId)
  }),
  eatOut: (slot, cost, kcal, name) => get().set(d => {
    d.logs.push(log({ type: 'eat_out', slot, name, cost, kcal }))
    setPlan(d, todayStr(), slot, { status: 'done' })
  }),
  skipSlot: (slot, date = todayStr()) => get().set(d => setPlan(d, date, slot, { status: 'skipped' })),
  planSlot: (slot, recipeId, date = todayStr()) => get().set(d => setPlan(d, date, slot, { recipeId, status: 'planned' })),
  addWater: ml => get().set(d => { const t = todayStr(); d.water[t] = Math.max(0, (d.water[t] ?? 0) + ml) }),

  setShopping: l => get().set(d => { d.shopping = l }),
  toggleShopLine: (ing, actualQty, actualPrice) => get().set(d => {
    const line = d.shopping?.lines.find(x => x.ing === ing); if (!line) return
    if (actualQty === undefined && actualPrice === undefined) line.checked = !line.checked
    else { line.checked = true; if (actualQty !== undefined) line.actualQty = actualQty; if (actualPrice !== undefined) line.actualPrice = actualPrice }
  }),
  finishShopping: () => get().set(d => {
    const l = d.shopping; if (!l) return
    const ctx = { ...priceCtx(d), store: l.store }
    const bought = l.lines.filter(x => x.checked)
    let total = 0
    for (const x of bought) {
      const qty = x.actualQty ?? x.qty
      const price = x.actualPrice ?? x.estPrice
      total += price
      const up = qty > 0 ? price / qty : unitPrice(x.ing, ctx)
      d.lots.push(makeLot(x.ing, qty, ctx, { unitPrice: up, source: l.store }))
      if (x.actualPrice !== undefined && qty > 0) learnPrice(d, x.ing, ING_MAP[x.ing].unit === 'dona' ? up : up * 1000, l.store)
    }
    d.purchases.push({ id: uid(), date: todayStr(), store: l.store, lines: bought.map(x => ({ ing: x.ing, qty: x.actualQty ?? x.qty, price: x.actualPrice ?? x.estPrice })), total, plannedTotal: l.lines.reduce((s, x) => s + x.estPrice, 0) })
    d.logs.push(log({ type: 'buy', name: `Bozorlik (${bought.length} ta)`, cost: total, kcal: 0 }))
    const rest = l.lines.filter(x => !x.checked)
    d.shopping = rest.length ? { ...l, id: uid(), lines: rest, createdAt: new Date().toISOString() } : null
  }),
  setPriceOverride: (ing, price) => get().set(d => { if (price && price > 0) d.priceOverride[ing] = price; else delete d.priceOverride[ing] }),
  importData: json => {
    try {
      const p = JSON.parse(json) as AppData
      if (!p || typeof p !== 'object' || !p.settings || !Array.isArray(p.lots)) return false
      const merged = { ...emptyData(), ...p, settings: { ...emptyData().settings, ...p.settings } }
      set({ data: merged })
      if (merged.settings.syncCode) schedulePush()
      return true
    } catch { return false }
  },

  connectSync: async (code, prefer) => {
    set({ sync: 'syncing', syncMsg: 'Ulanmoqda…' })
    try {
      const remote = await loadRemote(code)
      if (remote && prefer === 'remote') {
        const st = { ...emptyData(), ...remote.state, rev: remote.rev }
        st.settings = { ...st.settings, syncCode: code }
        set({ data: st, sync: 'idle', syncMsg: 'Serverdagi ma\'lumot yuklandi' })
        return 'remote'
      }
      const d = structuredClone(get().data)
      d.settings.syncCode = code
      let base = remote ? remote.rev : 0
      let res = await saveRemote(code, d, base)
      if (!res.ok && res.conflict) { base = res.rev; res = await saveRemote(code, d, base) }
      d.rev = res.ok ? res.rev : base
      set({ data: d, sync: 'idle', syncMsg: 'Ulandi' })
      return 'local'
    } catch (e) { set({ sync: 'error', syncMsg: 'Xato: ' + (e as Error).message }); throw e }
  },
  pushNow: async () => {
    const { data } = get(); const code = data.settings.syncCode
    if (!code) return
    set({ sync: 'syncing' })
    try {
      let res = await saveRemote(code, data, data.rev)
      if (!res.ok && res.conflict && res.state) {
        // boshqa qurilma ham yozgan: bo'limma-bo'lim birlashtiramiz va qayta yuboramiz
        const merged = mergeData(get().data, { ...emptyData(), ...res.state }, res.updated_at ?? res.state.updatedAt)
        merged.settings = { ...merged.settings, syncCode: code }
        merged.rev = res.rev
        set({ data: merged })
        res = await saveRemote(code, merged, res.rev)
        get().showToast('Boshqa qurilmadagi o\'zgarishlar birlashtirildi')
      }
      if (res.ok) set({ data: { ...get().data, rev: res.rev, dirty: false }, sync: 'idle', syncMsg: 'Saqlandi ' + new Date().toLocaleTimeString('uz', { hour: '2-digit', minute: '2-digit' }) })
      else set({ sync: 'error', syncMsg: 'Saqlanmadi, qayta urinaman' })
    } catch (e) { set({ sync: 'error', syncMsg: 'Sinxron xatosi: ' + (e as Error).message }) }
  },
  pullNow: async () => {
    const { data } = get(); const code = data.settings.syncCode
    if (!code || pushTimer) return false
    try {
      const remote = await loadRemote(code)
      if (remote && remote.rev > data.rev) {
        const r: AppData = { ...emptyData(), ...remote.state, settings: { ...emptyData().settings, ...remote.state.settings, syncCode: code } }
        if (data.dirty) {
          const merged = mergeData(get().data, r, remote.updated_at)
          merged.settings = { ...merged.settings, syncCode: code }
          merged.rev = remote.rev
          set({ data: merged, sync: 'idle', syncMsg: 'Birlashtirildi' })
          schedulePush()
        } else {
          set({ data: { ...r, rev: remote.rev, dirty: false }, sync: 'idle', syncMsg: 'Yangilandi' })
        }
        return true
      }
      set({ sync: 'idle' })
    } catch (e) { set({ sync: 'error', syncMsg: 'Sinxron xatosi: ' + (e as Error).message }) }
    return false
  },
}), {
  name: 'qozon:v1',
  partialize: s => ({ data: s.data }),
}))

function schedulePush() {
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => { pushTimer = null; useStore.getState().pushNow() }, 1500)
}

function log(p: Partial<LogEvent> & { type: LogEvent['type']; cost: number; kcal: number }): LogEvent {
  return { id: uid(), ts: new Date().toISOString(), date: p.date ?? todayStr(), ...p }
}
function setPlan(d: AppData, date: string, slot: Slot, p: Partial<AppData['plans'][number]>) {
  const i = d.plans.findIndex(x => x.date === date && x.slot === slot)
  const base = i >= 0 ? d.plans[i] : { date, slot, status: 'planned' as const }
  const np = { ...base, ...p }
  if (i >= 0) d.plans[i] = np; else d.plans.push(np)
  if (d.plans.length > 400) d.plans = d.plans.slice(-400)
}
function learnPrice(d: AppData, ing: string, pricePerRef: number, store = d.settings.store) {
  const old = d.priceOverride[ing] ?? (store === 'market' ? (ING_MAP[ing].market ?? ING_MAP[ing].price) : ING_MAP[ing].price)
  d.priceOverride[ing] = Math.round(0.6 * pricePerRef + 0.4 * old)
  const h = (d.priceHistory[ing] ??= [])
  h.push({ date: todayStr(), price: pricePerRef, store })
  if (h.length > 30) d.priceHistory[ing] = h.slice(-30)
}

export const ALL_RECIPE_IDS = RECIPES.map(r => r.id)
export const useData = () => useStore(s => s.data)

// sinxron: sahifa ko'ringanda va har 25 soniyada tortish
if (typeof window !== 'undefined') {
  setTimeout(() => { const s = useStore.getState(); if (s.data.settings.syncCode) { useStore.setState({ sync: 'idle' }); s.pullNow() } }, 200)
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') useStore.getState().pullNow() })
  setInterval(() => { if (document.visibilityState === 'visible') useStore.getState().pullNow() }, 25000)
  window.addEventListener('pagehide', () => {
    if (!pushTimer) return
    clearTimeout(pushTimer); pushTimer = null
    const s = useStore.getState(); const code = s.data.settings.syncCode
    if (!code) return
    fetch(`${SUPABASE_URL}/rest/v1/rpc/qozon_save`, { method: 'POST', keepalive: true, headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_code: code, p_state: s.data, p_base_rev: s.data.rev }) }).catch(() => {})
  })
}
