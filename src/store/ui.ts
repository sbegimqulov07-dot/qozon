import { create } from 'zustand'
import type { Slot } from '../data/types'

interface UI { recipe: string | null; cook: { recipeId: string; slot: Slot } | null; openRecipe: (id: string | null) => void; startCook: (recipeId: string, slot: Slot) => void; stopCook: () => void }
export const useUI = create<UI>(set => ({
  recipe: null, cook: null,
  openRecipe: id => set({ recipe: id }),
  startCook: (recipeId, slot) => set({ cook: { recipeId, slot }, recipe: null }),
  stopCook: () => set({ cook: null }),
}))

export const useHash = () => {
  const h = typeof location !== 'undefined' ? location.hash.replace('#', '') : ''
  return h || 'bugun'
}
export const go = (h: string) => { location.hash = h }
