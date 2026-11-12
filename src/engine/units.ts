import { ING_MAP } from '../data/ingredients'

export const fmtMoney = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ') + ' so\'m'
export const fmtNum = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/,/g, ' ')

export function fmtQty(ingId: string, qty: number): string {
  const ing = ING_MAP[ingId]
  if (!ing) return String(qty)
  if (ing.unit === 'dona') {
    const r = Math.round(qty * 10) / 10
    return `${r} dona`
  }
  if (qty >= 1000) return `${(Math.round(qty / 50) * 50 / 1000).toLocaleString('ru-RU')} ${ing.unit === 'g' ? 'kg' : 'L'}`
  return `${Math.round(qty)} ${ing.unit}`
}

/** uy o'lchovi izohi */
export function homeMeasure(ingId: string, qty: number): string | null {
  const ing = ING_MAP[ingId]
  if (!ing) return null
  if (ing.unit === 'dona') return null
  if (ing.piece) { const n = qty / ing.piece; if (n >= 0.4) return `≈ ${n < 1 ? n.toFixed(1) : Math.round(n * 2) / 2} dona` }
  if (['guruch', 'un', 'grechka', 'mosh', 'yasmiq', 'suli', 'manniy', 'shakar', 'makaron'].includes(ingId) && qty >= 100) return `≈ ${(qty / 200).toFixed(1).replace('.0', '')} piyola`
  if (ing.unit === 'ml' && qty <= 60) return `≈ ${Math.round(qty / 15)} osh qoshiq`
  if (ing.unit === 'ml' && qty >= 200) return `≈ ${(qty / 250).toFixed(1).replace('.0', '')} piyola`
  if (['tuz', 'zira', 'murch', 'qizil_qalampir', 'koriandr', 'zarchava'].includes(ingId)) return qty <= 6 ? `≈ ${qty <= 2 ? 'chimdim–½' : Math.round(qty / 5 * 2) / 2} choy qoshiq` : `≈ ${Math.round(qty / 15 * 2) / 2} osh qoshiq`
  if (['sariyog', 'smetana', 'pasta', 'asal', 'mayonez'].includes(ingId) && qty <= 80) return `≈ ${Math.round(qty / 20)} osh qoshiq`
  return null
}

/** gramm ekvivalenti (kcal hisoblash uchun) */
export function grams(ingId: string, qty: number): number {
  const ing = ING_MAP[ingId]
  if (!ing) return 0
  if (ing.unit === 'dona') return qty * (ing.piece ?? 100)
  return qty
}
