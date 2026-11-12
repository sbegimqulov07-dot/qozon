import type { Recipe } from './types'
import { RECIPES_A } from './recipes_a'
import { RECIPES_B } from './recipes_b'

export const RECIPES: Recipe[] = [...RECIPES_A, ...RECIPES_B]
export const RECIPE_MAP: Record<string, Recipe> = Object.fromEntries(RECIPES.map(r => [r.id, r]))

export const RECIPE_CAT_LABEL: Record<string, string> = {
  nonushta: 'Nonushta', shorva: 'Sho\'rvalar', asosiy: 'Asosiy ovqatlar', garnir: 'Garnir va salatlar', tamaddi: 'Tamaddi',
}
export const SLOT_LABEL: Record<string, string> = { nonushta: 'Nonushta', tushlik: 'Tushlik', kechki: 'Kechki ovqat', tamaddi: 'Tamaddi' }
