import { useMemo, useState } from 'react'
import { ING_MAP, INGREDIENTS } from '../data/ingredients'
import { RECIPE_CAT_LABEL, RECIPES } from '../data/recipes'
import { availability, stockMap } from '../engine/pantry'
import { portionCost, portionKcal } from '../engine/pricing'
import { priceCtx } from '../engine/recommend'
import { fmtMoney } from '../engine/units'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import CustomRecipe from './CustomRecipe'

export default function Recipes() {
  const data = useStore(s => s.data)
  const toggle = useStore(s => s.toggleRecipe)
  const setMy = useStore(s => s.setMyRecipes)
  const showToast = useStore(s => s.showToast)
  const open = useUI(s => s.openRecipe)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('all')
  const [f, setF] = useState<{ have?: boolean; quick?: boolean; cheap?: boolean; mine?: boolean }>({ mine: true })
  const [byIng, setByIng] = useState<string[]>([])
  const [custom, setCustom] = useState(false)
  const ctx = priceCtx(data)
  const stock = stockMap(data.lots)
  const ex = new Set(data.settings.excluded)

  const list = useMemo(() => RECIPES.filter(r => {
    if (r.ingredients.some(i => !i.opt && ex.has(i.id))) return false
    if (f.mine && !data.myRecipes.includes(r.id)) return false
    if (cat !== 'all' && r.cat !== cat) return false
    if (q && !r.name.toLowerCase().includes(q.toLowerCase()) && !r.ingredients.some(i => ING_MAP[i.id]?.name.toLowerCase().includes(q.toLowerCase()) || ING_MAP[i.id]?.ru?.toLowerCase().includes(q.toLowerCase()))) return false
    if (f.quick && r.time > 25) return false
    if (f.cheap && portionCost(r, ctx) > 8000) return false
    if (f.have && availability(r, stock, data.settings.people, ctx).status === 'missing') return false
    if (byIng.length && !byIng.every(id => r.ingredients.some(i => i.id === id))) return false
    return true
  }).map(r => ({ r, av: availability(r, stock, data.settings.people, ctx), cost: portionCost(r, ctx), kcal: portionKcal(r) })).sort((a, b) => (a.av.status === 'full' ? 0 : a.av.status === 'almost' ? 1 : 2) - (b.av.status === 'full' ? 0 : b.av.status === 'almost' ? 1 : 2) || a.cost - b.cost), [data, q, cat, f, byIng, ctx, stock, ex])

  const ingOptions = INGREDIENTS.filter(i => (stock[i.id] ?? 0) > 0)
  return <div className="stack">
    <div className="row between"><h1>Retseptlar</h1><button className="btn sm primary" onClick={() => setCustom(true)}>+ O'z retseptim</button></div>
    <div className="row between"><span className="small muted">Sizniki: {(data.customRecipes ?? []).length} ta</span><span className="small muted">{data.myRecipes.length} / {RECIPES.filter(r => !r.ingredients.some(i => !i.opt && ex.has(i.id))).length} yeyman</span></div>
    <input type="search" placeholder="Qidirish: ovqat yoki masalliq (pomidor, smetana…)" value={q} onChange={e => setQ(e.target.value)} />
    <div className="chips">
      <button className={'chip lg' + (f.mine ? ' sel' : '')} onClick={() => setF({ ...f, mine: !f.mine })}>Mening ro'yxatim</button>
      <button className={'chip lg' + (f.have ? ' sel' : '')} onClick={() => setF({ ...f, have: !f.have })}>Hozir bor</button>
      <button className={'chip lg' + (f.quick ? ' sel' : '')} onClick={() => setF({ ...f, quick: !f.quick })}>≤ 25 daq</button>
      <button className={'chip lg' + (f.cheap ? ' sel' : '')} onClick={() => setF({ ...f, cheap: !f.cheap })}>≤ 8 000 so'm</button>
    </div>
    <div className="chips">
      <button className={'chip' + (cat === 'all' ? ' sel' : '')} onClick={() => setCat('all')}>Hammasi</button>
      {Object.entries(RECIPE_CAT_LABEL).map(([k, v]) => <button key={k} className={'chip' + (cat === k ? ' sel' : '')} onClick={() => setCat(k)}>{v}</button>)}
    </div>
    <details><summary>Nima pishiray? — masalliq bo'yicha ({byIng.length})</summary>
      <p className="small muted">Ombordagi masalliqlardan tanlang, mos retseptlar qoladi.</p>
      <div className="chips" style={{ paddingBlock: 8 }}>{ingOptions.map(i => <button key={i.id} className={'chip' + (byIng.includes(i.id) ? ' sel' : '')} onClick={() => setByIng(b => b.includes(i.id) ? b.filter(x => x !== i.id) : [...b, i.id])}>{i.name.split(' (')[0]}</button>)}{!ingOptions.length && <span className="small muted">Ombor bo'sh</span>}</div>
    </details>
    <div className="row between"><span className="small muted">{list.length} ta retsept</span>{data.myRecipes.length < 10 && <button className="btn sm ghost" onClick={() => { setMy(RECIPES.filter(r => !r.ingredients.some(i => !i.opt && ex.has(i.id))).map(r => r.id)); showToast('Barcha retseptlar "Yeyman" qilindi') }}>Hammasini yeyman</button>}</div>
    <div className="list card" style={{ padding: '0 14px' }}>
      {list.map(({ r, av, cost, kcal }) => <div key={r.id} className="item">
        <span className={'dot ' + (av.status === 'full' ? 'ok' : av.status === 'almost' ? 'warn' : 'off')} />
        <button className="grow" style={{ textAlign: 'left' }} onClick={() => open(r.id)}><div className="title">{r.name}</div><div className="small muted num">{r.time} daq · {fmtMoney(cost)} · {Math.round(kcal)} kcal{av.status !== 'full' ? ` · ${av.missing.length} ta yetishmaydi` : ''}</div></button>
        <button className={'btn sm ' + (data.myRecipes.includes(r.id) ? '' : 'ghost')} title={data.myRecipes.includes(r.id) ? 'Ro\'yxatimdan olib tashlash' : 'Ro\'yxatimga qo\'shish'} onClick={() => { const was = data.myRecipes.includes(r.id); toggle(r.id); showToast(was ? `${r.name.split(' (')[0]} ro'yxatdan olindi` : `${r.name.split(' (')[0]} ro'yxatga qo'shildi`, () => toggle(r.id)) }}>{data.myRecipes.includes(r.id) ? 'Yeyman ✓' : '+ Qo\'shish'}</button>
      </div>)}
      {!list.length && f.mine && !q && cat === 'all' && !byIng.length && <div className="item col" style={{ alignItems: 'flex-start' }}><b>"Yeyman" ro'yxatingiz bo'sh</b><span className="small muted">"Yeyman ✓" tugmasi retseptni ro'yxatdan chiqaradi. Hammasini qaytarish uchun:</span><button className="btn primary sm" onClick={() => { setMy(RECIPES.filter(r => !r.ingredients.some(i => !i.opt && ex.has(i.id))).map(r => r.id)); showToast('Barcha retseptlar qaytarildi') }}>Hammasini qaytarish</button></div>}
      {custom && <CustomRecipe open={custom} onClose={() => setCustom(false)} />}
      {!list.length && !(f.mine && !q && cat === 'all' && !byIng.length) && <div className="item muted">Hech narsa topilmadi{f.mine ? ' — "Mening ro\'yxatim" filtrini o\'chirib ko\'ring' : ''}</div>}
    </div>
  </div>
}
