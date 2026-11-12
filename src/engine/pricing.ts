import { ING_MAP } from '../data/ingredients'
import type { Recipe } from '../data/types'
import { grams } from './units'

export type PriceCtx = { override: Record<string, number>; store: 'bozor' | 'market' }

/** 1 kg / 1 L / 1 dona narxi */
export function refPrice(ingId: string, ctx: PriceCtx): number {
  const ing = ING_MAP[ingId]
  if (!ing) return 0
  if (ctx.override[ingId]) return ctx.override[ingId]
  if (ctx.store === 'market') return ing.market ?? Math.round(ing.price * 1.15)
  return ing.price
}
/** bazaviy birlik (g / ml / dona) narxi */
export function unitPrice(ingId: string, ctx: PriceCtx): number {
  const ing = ING_MAP[ingId]
  if (!ing) return 0
  const p = refPrice(ingId, ctx)
  return ing.unit === 'dona' ? p : p / 1000
}
export function seasonalFactor(ingId: string, date = new Date()): number {
  const ing = ING_MAP[ingId]
  if (!ing?.seasonal) return 1
  const m = date.getMonth() + 1
  if (m <= 3 || m === 12) return 1.8
  if (m <= 5) return 1.2
  if (m <= 9) return 0.7
  return 1
}

export function recipeCost(r: Recipe, ctx: PriceCtx, scale = 1, withOptional = false): number {
  return r.ingredients.filter(i => withOptional || !i.opt).reduce((s, i) => s + i.qty * scale * unitPrice(i.id, ctx), 0)
}
export function recipeKcal(r: Recipe, scale = 1, withOptional = false): number {
  return r.ingredients.filter(i => withOptional || !i.opt).reduce((s, i) => {
    const ing = ING_MAP[i.id]; if (!ing) return s
    return s + grams(i.id, i.qty * scale) * ing.kcal / 100
  }, 0)
}
export const portionCost = (r: Recipe, ctx: PriceCtx) => recipeCost(r, ctx) / r.servings
export const portionKcal = (r: Recipe) => recipeKcal(r) / r.servings

/** xarid qadamiga yaxlitlash */
export function roundToPack(ingId: string, qty: number): { qty: number; packs: number } {
  const ing = ING_MAP[ingId]
  if (!ing || qty <= 0) return { qty: 0, packs: 0 }
  const packs = Math.max(1, Math.ceil(qty / ing.pack - 0.02))
  return { qty: packs * ing.pack, packs }
}
