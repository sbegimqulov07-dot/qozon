export type Unit = 'g' | 'ml' | 'dona'
export type Category = 'gosht' | 'sut' | 'sabzavot' | 'meva' | 'quruq' | 'yog' | 'boshqa'
export type Place = 'fridge' | 'freezer' | 'room'
export type Slot = 'nonushta' | 'tushlik' | 'kechki' | 'tamaddi'
export type RecipeCat = 'nonushta' | 'shorva' | 'asosiy' | 'garnir' | 'tamaddi'
export type Fit = 'main' | 'ok' | 'no'

export interface Ingredient {
  id: string
  name: string
  ru?: string
  cat: Category
  unit: Unit
  /** dona uchun bir donaning grammi */
  piece?: number
  /** xarid qadami (bazaviy birlikda) */
  pack: number
  packLabel: string
  /** narx: 1 kg / 1 L / 1 dona uchun (bozor) */
  price: number
  /** supermarket narxi (bo'lmasa price*1.15) */
  market?: number
  /** kcal / 100 g (dona bo'lsa piece orqali) */
  kcal: number
  shelf: { fridge?: number; freezer?: number; room?: number }
  place: Place
  section: string
  par?: number
  seasonal?: boolean
  subs?: string[]
  tip?: string
}

export interface RecipeIngredient { id: string; qty: number; opt?: boolean; note?: string }
export interface Step { t: string; timer?: number; why?: string }

export interface Recipe {
  id: string
  name: string
  cat: RecipeCat
  meals: { nonushta: Fit; tushlik: Fit; kechki: Fit; tamaddi?: Fit }
  time: number
  active?: number
  difficulty: 1 | 2 | 3
  /** 1 kishi uchun nechta porsiya chiqadi (miqdorlar shunga) */
  servings: number
  ingredients: RecipeIngredient[]
  steps: Step[]
  tools?: string[]
  tags?: string[]
  season?: 'yoz' | 'qish' | 'kuz'
  leftover?: string
  desc?: string
}
