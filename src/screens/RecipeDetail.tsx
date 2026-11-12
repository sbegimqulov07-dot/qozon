import { useState } from 'react'
import { Icons, Sheet } from '../components/ui'
import { ING_MAP } from '../data/ingredients'
import { isCustom, RECIPE_MAP, SLOT_LABEL } from '../data/recipes'
import type { Slot } from '../data/types'
import { availability, stockMap } from '../engine/pantry'
import { portionCost, portionKcal, recipeCost, recipeKcal } from '../engine/pricing'
import { priceCtx } from '../engine/recommend'
import { fmtMoney, fmtNum, fmtQty, homeMeasure } from '../engine/units'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'
import CustomRecipe from './CustomRecipe'

export default function RecipeDetail({ id }: { id: string }) {
  const r = RECIPE_MAP[id]
  const data = useStore(s => s.data)
  const st = useStore()
  const close = () => useUI.getState().openRecipe(null)
  const startCook = useUI(s => s.startCook)
  const [planOpen, setPlanOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  if (!r) return null
  const ctx = priceCtx(data)
  const scale = data.settings.people
  const stock = stockMap(data.lots)
  const av = availability(r, stock, scale, ctx)
  const mine = data.myRecipes.includes(r.id)
  const slots: Slot[] = ['nonushta', 'tushlik', 'kechki', 'tamaddi']
  const defSlot = slots.find(s => r.meals[s] === 'main') ?? 'tushlik'
  return (
    <Sheet open onClose={close} title={r.name}>
      <div className="stack">
        {r.desc && <p className="muted">{r.desc}</p>}
        <div className="chips">
          <span className="chip">{r.time} daqiqa{r.active ? ` (ish ${r.active})` : ''}</span>
          <span className="chip">{['Juda oson', 'Oson', 'O\'rtacha'][r.difficulty - 1]}</span>
          <span className="chip">{r.servings * scale} porsiya</span>
          <span className={'chip ' + (av.status === 'full' ? 'ok' : av.status === 'almost' ? 'warn' : 'bad')}>{av.status === 'full' ? 'Hamma masalliq bor' : av.status === 'almost' ? `${av.missing.length} ta yetishmaydi` : 'Bozorlik kerak'}</span>
          {slots.filter(s => r.meals[s] === 'main').map(s => <span key={s} className="chip acc">{SLOT_LABEL[s]}</span>)}
        </div>
        <div className="grid2">
          <div className="card"><div className="eyebrow">Narx</div><div className="big-num" style={{ fontSize: '1.2rem' }}>{fmtMoney(portionCost(r, ctx))}</div><div className="tiny muted num">1 porsiya · jami {fmtMoney(recipeCost(r, ctx, scale))}</div></div>
          <div className="card"><div className="eyebrow">Kaloriya</div><div className="big-num" style={{ fontSize: '1.2rem' }}>{fmtNum(portionKcal(r))} kcal</div><div className="tiny muted num">1 porsiya · jami {fmtNum(recipeKcal(r, scale))}</div></div>
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Masalliqlar ({scale} kishiga)</div>
          <div className="list">{r.ingredients.map(i => { const q = i.qty * scale; const have = (stock[i.id] ?? 0); const ok = have >= q * 0.9; const hm = homeMeasure(i.id, q)
            return <div key={i.id} className="item" style={{ padding: '7px 0' }}><span className={'dot ' + (ok ? 'ok' : i.opt ? 'off' : 'bad')} /><div className="grow"><span>{ING_MAP[i.id]?.name}</span>{i.opt && <span className="muted small"> (ixtiyoriy)</span>}{i.note && <span className="muted small"> — {i.note}</span>}</div><span className="small num" style={{ textAlign: 'right' }}>{fmtQty(i.id, q)}{hm && <div className="tiny muted">{hm}</div>}</span></div> })}</div>
          {av.missing.length > 0 && <div className="small muted" style={{ marginTop: 6 }}>Yetishmaydiganlar ≈ {fmtMoney(av.missingCost)}</div>}
        </div>
        {r.tools && <div className="small"><b>Idishlar:</b> {r.tools.join(', ')}</div>}
        {r.steps.length > 0 && <details><summary>Qadamlar ({r.steps.length})</summary><ol style={{ paddingLeft: 20, margin: 0 }} className="stack">{r.steps.map((s, i) => <li key={i}>{s.t}{s.timer ? <span className="chip" style={{ marginLeft: 6 }}>⏱ {s.timer} daq</span> : null}{s.why && <div className="small muted">Nega: {s.why}</div>}</li>)}</ol></details>}
        {!r.steps.length && <div className="small muted">Qadamlar yozilmagan — o'zingiz bilganingizcha pishirasiz.</div>}
        {r.leftover && <div className="why">Qoldiq: {r.leftover}</div>}
        <div className="row">
          <button className="btn primary grow" onClick={() => startCook(r.id, defSlot)}>Pishirishni boshlash</button>
          <button className="btn ghost" onClick={() => setPlanOpen(!planOpen)}>Rejaga</button>
        </div>
        {planOpen && <div className="chips">{slots.filter(s => r.meals[s] !== 'no').map(s => <button key={s} className="chip lg" onClick={() => { st.planSlot(s, r.id); st.showToast(`${SLOT_LABEL[s]}ga rejalashtirildi`); close() }}>Bugun {SLOT_LABEL[s].toLowerCase()}</button>)}</div>}
        <div className="row wrap">
          <button className={'btn sm ' + (mine ? '' : 'ghost')} onClick={() => st.toggleRecipe(r.id)}>{mine ? '✓ Yeyman' : 'Ro\'yxatimga qo\'shish'}</button>
          <button className="btn sm ghost row" onClick={() => st.toggleFav(r.id)}><span style={{ width: 16, height: 16, display: 'inline-flex', color: 'var(--pop)' }}>{Icons.heart(data.favorites.includes(r.id))}</span>Sevimli</button>
          <button className={'btn sm ' + (data.disliked.includes(r.id) ? '' : 'ghost')} onClick={() => st.toggleDislike(r.id)}>Kamroq tavsiya qil</button>
          {isCustom(r.id) && <button className="btn sm ghost" onClick={() => setEditOpen(true)}>Tahrirlash</button>}
          {isCustom(r.id) && <button className="btn sm ghost" style={{ color: 'var(--bad)' }} onClick={() => { const snap = r; st.deleteCustomRecipe(r.id); close(); st.showToast('Retsept o\'chirildi', () => st.saveCustomRecipe(snap)) }}>O'chirish</button>}
        </div>
        {isCustom(r.id) && <div className="tiny muted">Sizning retseptingiz · {r.steps.length ? 'qadamlar bilan' : 'qadamlarsiz'}</div>}
      </div>
      {editOpen && <CustomRecipe open={editOpen} onClose={() => setEditOpen(false)} edit={r} />}
    </Sheet>
  )
}
