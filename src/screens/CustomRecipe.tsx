import { useMemo, useState } from 'react'
import { Sheet, Stepper } from '../components/ui'
import { ING_MAP, INGREDIENTS } from '../data/ingredients'
import { RECIPE_CAT_LABEL, SLOT_LABEL } from '../data/recipes'
import type { Fit, Recipe, RecipeCat, Slot } from '../data/types'
import { recipeCost, recipeKcal } from '../engine/pricing'
import { priceCtx } from '../engine/recommend'
import { fmtMoney, fmtNum, fmtQty } from '../engine/units'
import { useStore } from '../store/store'

const SLOTS: Slot[] = ['nonushta', 'tushlik', 'kechki', 'tamaddi']

export default function CustomRecipe({ open, onClose, edit }: { open: boolean; onClose: () => void; edit?: Recipe }) {
  const data = useStore(s => s.data)
  const save = useStore(s => s.saveCustomRecipe)
  const showToast = useStore(s => s.showToast)
  const [name, setName] = useState(edit?.name ?? '')
  const [cat, setCat] = useState<RecipeCat>(edit?.cat ?? 'asosiy')
  const [slots, setSlots] = useState<Slot[]>(edit ? SLOTS.filter(s => edit.meals[s] && edit.meals[s] !== 'no') : ['tushlik', 'kechki'])
  const [time, setTime] = useState(edit?.time ?? 30)
  const [servings, setServings] = useState(edit?.servings ?? 1)
  const [ings, setIngs] = useState<{ id: string; qty: number; opt?: boolean }[]>(edit?.ingredients.map(i => ({ id: i.id, qty: i.qty, opt: i.opt })) ?? [])
  const [stepsText, setStepsText] = useState(edit?.steps.map(s => s.t).join('\n') ?? '')
  const [desc, setDesc] = useState(edit?.desc ?? '')
  const [q, setQ] = useState('')
  const ctx = priceCtx(data)

  const draft: Recipe = useMemo(() => ({
    id: edit?.id ?? 'c_' + Math.random().toString(36).slice(2, 8),
    name: name.trim() || 'Nomsiz', cat,
    meals: { nonushta: fit('nonushta'), tushlik: fit('tushlik'), kechki: fit('kechki'), tamaddi: fit('tamaddi') },
    time, difficulty: 2, servings: Math.max(1, servings),
    ingredients: ings.filter(i => i.qty > 0),
    steps: stepsText.split('\n').map(s => s.trim()).filter(Boolean).map(t => { const m = t.match(/(\d+)\s*(daq|min)/i); return m ? { t, timer: +m[1] } : { t } }),
    tags: ['mening'], desc: desc.trim() || undefined,
  }), [name, cat, slots, time, servings, ings, stepsText, desc, edit])
  function fit(s: Slot): Fit { return slots.includes(s) ? 'main' : 'no' }

  const stepFor = (id: string) => { const i = ING_MAP[id]; return i.unit === 'dona' ? 1 : i.pack >= 1000 ? 50 : i.pack >= 200 ? 25 : 1 }
  const found = INGREDIENTS.filter(i => !ings.some(x => x.id === i.id) && !data.settings.excluded.includes(i.id) && (!q || i.name.toLowerCase().includes(q.toLowerCase()) || i.ru?.toLowerCase().includes(q.toLowerCase()))).slice(0, q ? 12 : 0)
  const valid = name.trim().length >= 2 && ings.some(i => i.qty > 0) && slots.length > 0

  return <Sheet open={open} onClose={onClose} title={edit ? 'Retseptni tahrirlash' : 'O\'z retseptim'}>
    <div className="stack">
      <label className="field">Ovqat nomi<input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Masalan, Onamning qovurmasi" /></label>
      <label className="field">Qisqa izoh (ixtiyoriy)<input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Nima bilan yeyiladi, kimning retsepti…" /></label>
      <div className="eyebrow">Turi</div>
      <div className="chips">{Object.entries(RECIPE_CAT_LABEL).map(([k, v]) => <button key={k} className={'chip lg' + (cat === k ? ' sel' : '')} onClick={() => setCat(k as RecipeCat)}>{v}</button>)}</div>
      <div className="eyebrow">Qaysi mahalga tavsiya qilinsin</div>
      <div className="chips">{SLOTS.map(s => <button key={s} className={'chip lg' + (slots.includes(s) ? ' sel' : '')} onClick={() => setSlots(x => x.includes(s) ? x.filter(y => y !== s) : [...x, s])}>{SLOT_LABEL[s]}</button>)}</div>
      <div className="row between"><div><b>Vaqt</b><div className="small muted">daqiqa</div></div><Stepper value={time} min={1} max={300} step={5} onChange={setTime} /></div>
      <div className="row between"><div><b>Necha porsiya chiqadi</b><div className="small muted">1 kishi uchun pishirganda; odam soniga o'zi ko'paytiradi</div></div><Stepper value={servings} min={1} max={12} onChange={setServings} /></div>

      <div className="eyebrow">Masalliqlar (1 kishi uchun)</div>
      {ings.length > 0 && <div className="list">{ings.map(i => <div key={i.id} className="item" style={{ padding: '7px 0' }}>
        <div className="grow"><div>{ING_MAP[i.id]?.name}</div><button className="tiny muted" onClick={() => setIngs(x => x.map(y => y.id === i.id ? { ...y, opt: !y.opt } : y))}>{i.opt ? 'ixtiyoriy ✓ (bosib majburiy qiling)' : 'majburiy (bosib ixtiyoriy qiling)'}</button></div>
        <Stepper value={i.qty} min={0} max={99999} step={stepFor(i.id)} onChange={v => setIngs(x => x.map(y => y.id === i.id ? { ...y, qty: v } : y))} fmt={v => fmtQty(i.id, v)} />
        <button className="icon-btn" aria-label="O'chirish" onClick={() => setIngs(x => x.filter(y => y.id !== i.id))}>×</button>
      </div>)}</div>}
      <input type="search" placeholder="Masalliq qidirish va qo'shish (piyoz, лук…)" value={q} onChange={e => setQ(e.target.value)} />
      {found.length > 0 && <div className="chips">{found.map(i => <button key={i.id} className="chip lg" onClick={() => { setIngs(x => [...x, { id: i.id, qty: i.unit === 'dona' ? 1 : i.pack >= 1000 ? 200 : i.pack >= 200 ? 50 : 5 }]); setQ('') }}>+ {i.name.split(' (')[0]}</button>)}</div>}
      {q && !found.length && <div className="small muted">Bunday masalliq bazada yo'q. Eng yaqinini tanlang yoki yozing — qo'shib beraman.</div>}

      <label className="field">Qadamlar (ixtiyoriy — har qatorda bitta qadam; "20 daq" yozsangiz taymer chiqadi)
        <textarea rows={5} value={stepsText} onChange={e => setStepsText(e.target.value)} placeholder={'Piyozni to\'g\'rab 5 daq qovuring\nGo\'shtni qo\'shib 10 daq\n…'} /></label>

      {ings.some(i => i.qty > 0) && <div className="card row between"><span className="small">1 porsiya</span><b className="num">{fmtMoney(recipeCost(draft, ctx) / draft.servings)} · {fmtNum(recipeKcal(draft) / draft.servings)} kcal</b></div>}
      <button className="btn primary xl" disabled={!valid} onClick={() => { save(draft); showToast(edit ? 'Retsept yangilandi' : 'Retsept qo\'shildi va "Yeyman" ro\'yxatiga kirdi'); onClose() }}>{edit ? 'Saqlash' : 'Retseptni qo\'shish'}</button>
      {!valid && <div className="tiny muted">Nom (kamida 2 harf), kamida 1 ta masalliq va 1 ta mahal kerak.</div>}
    </div>
  </Sheet>
}
