import type { Recipe } from './types'
import { RECIPES_A } from './recipes_a'
import { RECIPES_B } from './recipes_b'

export const RECIPES: Recipe[] = [...RECIPES_A, ...RECIPES_B]
export const RECIPE_MAP: Record<string, Recipe> = Object.fromEntries(RECIPES.map(r => [r.id, r]))

export const RECIPE_CAT_LABEL: Record<string, string> = {
  nonushta: 'Nonushta', shorva: 'Sho\'rvalar', asosiy: 'Asosiy ovqatlar', garnir: 'Garnir va salatlar', tamaddi: 'Tamaddi',
}
export const SLOT_LABEL: Record<string, string> = { nonushta: 'Nonushta', tushlik: 'Tushlik', kechki: 'Kechki ovqat', tamaddi: 'Tamaddi' }

/** foydalanuvchi retseptlarini umumiy ro'yxatga qo'shadi (id 'c_' bilan boshlanadi) */
export function applyCustomRecipes(custom: Recipe[]) {
  for (let i = RECIPES.length - 1; i >= 0; i--) if (RECIPES[i].id.startsWith('c_')) RECIPES.splice(i, 1)
  for (const k of Object.keys(RECIPE_MAP)) if (k.startsWith('c_')) delete RECIPE_MAP[k]
  for (const r of custom ?? []) { RECIPES.push(r); RECIPE_MAP[r.id] = r }
}
export const isCustom = (id: string) => id.startsWith('c_')
