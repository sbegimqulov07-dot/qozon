import { useMemo, useState } from 'react'
import { Sheet, Stepper } from '../components/ui'
import { CATEGORY_LABEL, ING_MAP, INGREDIENTS } from '../data/ingredients'
import { daysBetween, todayStr } from '../engine/model'
import { expiryState, pantryValue, stockMap } from '../engine/pantry'
import { refPrice } from '../engine/pricing'
import { priceCtx } from '../engine/recommend'
import { fmtMoney, fmtQty } from '../engine/units'
import { useStore } from '../store/store'

export default function Pantry() {
  const data = useStore(s => s.data)
  const st = useStore()
  const [sel, setSel] = useState<string | null>(null)
  const [add, setAdd] = useState(false)
  const [q, setQ] = useState('')
  const [addIng, setAddIng] = useState<string | null>(null)
  const [addQty, setAddQty] = useState(0)
  const [addPrice, setAddPrice] = useState(0)
  const [editQty, setEditQty] = useState(0)
  const ctx = priceCtx(data)
  const stock = stockMap(data.lots)
  const today = todayStr()
  const groups = useMemo(() => {
    const ids = Object.keys(stock).filter(id => stock[id] > 0.01)
    const g: Record<string, string[]> = {}
    for (const id of ids) (g[ING_MAP[id]?.cat ?? 'boshqa'] ??= []).push(id)
    for (const k in g) g[k].sort((a, b) => ING_MAP[a].name.localeCompare(ING_MAP[b].name))
    return g
  }, [stock])
  const low = INGREDIENTS.filter(i => i.par && (stock[i.id] ?? 0) < i.par)
  const worst = (id: string) => { const ls = data.lots.filter(l => l.ing === id); const states = ls.map(l => expiryState(l, today)); return states.includes('expired') ? 'expired' : states.includes('urgent') ? 'urgent' : states.includes('soon') ? 'soon' : 'ok' }
  const soonest = (id: string) => data.lots.filter(l => l.ing === id).map(l => l.expiresAt).sort()[0]
  const stepFor = (id: string) => { const i = ING_MAP[id]; return i.unit === 'dona' ? 1 : i.pack >= 1000 ? 100 : i.pack >= 200 ? 25 : 5 }

  const openEdit = (id: string) => { setSel(id); setEditQty(stock[id] ?? 0) }
  const startAdd = (id: string) => { setAddIng(id); setAddQty(ING_MAP[id].pack); setAddPrice(refPrice(id, ctx)) }

  return <div className="stack">
    <div className="row between"><h1>Ombor</h1><button className="btn sm primary" onClick={() => { setAdd(true); setAddIng(null); setQ('') }}>+ Qo'shish</button></div>
    <div className="grid2">
      <div className="card"><div className="eyebrow">Ombor qiymati</div><div className="big-num" style={{ fontSize: '1.2rem' }}>{fmtMoney(pantryValue(data.lots))}</div><div className="tiny muted">{Object.keys(groups).reduce((s, k) => s + groups[k].length, 0)} xil masalliq</div></div>
      <div className="card"><div className="eyebrow">Zaxira past</div><div className="big-num" style={{ fontSize: '1.2rem' }}>{low.length}</div><div className="tiny muted">{low.slice(0, 3).map(i => i.name.split(' (')[0]).join(', ')}{low.length > 3 ? '…' : ''}</div></div>
    </div>
    {Object.keys(groups).length === 0 && <div className="card"><b>Ombor bo'sh.</b><p className="small muted">Bozorlik bo'limida ro'yxat tuzing yoki "+ Qo'shish" bilan uyda borini kiriting.</p></div>}
    {Object.entries(CATEGORY_LABEL).map(([cat, label]) => groups[cat]?.length ? <section key={cat} className="section">
      <div className="eyebrow" style={{ marginBottom: 6 }}>{label}</div>
      <div className="list card" style={{ padding: '0 14px' }}>{groups[cat].map(id => { const w = worst(id); const d = daysBetween(today, soonest(id)); const val = data.lots.filter(l => l.ing === id).reduce((s, l) => s + l.qty * l.unitPrice, 0)
        return <button key={id} className="item" style={{ textAlign: 'left', width: '100%' }} onClick={() => openEdit(id)}>
          <span className={'dot ' + (w === 'ok' ? 'ok' : w === 'soon' ? 'warn' : 'bad')} />
          <div className="grow"><div className="title">{ING_MAP[id].name}</div><div className="small muted num">{fmtQty(id, stock[id])} · ≈ {fmtMoney(val)}{data.lots.some(l => l.ing === id && l.place === 'freezer') ? ' · ❄' : ''}</div></div>
          <span className={'chip ' + (w === 'ok' ? '' : w === 'soon' ? 'warn' : 'bad')}>{d < 0 ? 'muddati o\'tgan' : d === 0 ? 'bugun' : d > 365 ? '∞' : d + ' kun'}</span>
        </button> })}</div>
    </section> : null)}

    <Sheet open={!!sel} onClose={() => setSel(null)} title={sel ? ING_MAP[sel].name : ''}>
      {sel && <div className="stack">
        <div className="row between"><span>Hozir bor</span><Stepper value={editQty} min={0} max={99999} step={stepFor(sel)} onChange={setEditQty} fmt={v => fmtQty(sel, v)} /></div>
        <div className="small muted">Partiyalar: {data.lots.filter(l => l.ing === sel).map(l => `${fmtQty(sel, l.qty)} (${l.boughtAt}, ${daysBetween(today, l.expiresAt)} kun${l.place === 'freezer' ? ', ❄' : ''})`).join(' · ')}</div>
        {ING_MAP[sel].tip && <div className="why">{ING_MAP[sel].tip}</div>}
        <button className="btn primary block" onClick={() => { st.adjustLot(sel, editQty); setSel(null) }}>Saqlash</button>
        <div className="grid3">
          <button className="btn" onClick={() => { st.adjustLot(sel, 0, 'Tugadi'); setSel(null) }}>Tugadi</button>
          <button className="btn" onClick={() => { st.wasteIng(sel, stock[sel] - editQty > 0 ? stock[sel] - editQty : stock[sel], 'Buzildi'); setSel(null); st.showToast('Chiqindiga yozildi') }}>Tashladim</button>
          {ING_MAP[sel].shelf.freezer ? <button className="btn" onClick={() => { st.freezeIng(sel); setSel(null); st.showToast('Muzlatkichga — muddat uzaytirildi') }}>❄ Muzlatdim</button> : <span />}
        </div>
        <button className="btn ghost" onClick={() => { setSel(null); setAdd(true); startAdd(sel) }}>Yana sotib oldim (+ partiya)</button>
      </div>}
    </Sheet>

    <Sheet open={add} onClose={() => setAdd(false)} title="Omborga qo'shish">
      {!addIng ? <div className="stack">
        <input type="search" autoFocus placeholder="Masalliq nomi (o'zbek yoki rus)" value={q} onChange={e => setQ(e.target.value)} />
        <div className="list">{INGREDIENTS.filter(i => !data.settings.excluded.includes(i.id) && (!q || i.name.toLowerCase().includes(q.toLowerCase()) || i.ru?.toLowerCase().includes(q.toLowerCase()))).slice(0, 40).map(i => <button key={i.id} className="item" style={{ width: '100%', textAlign: 'left' }} onClick={() => startAdd(i.id)}><div className="grow"><div className="title">{i.name}</div><div className="small muted">{i.ru} · {fmtMoney(refPrice(i.id, ctx))} / {i.unit === 'dona' ? 'dona' : i.unit === 'g' ? 'kg' : 'L'}</div></div>{(stock[i.id] ?? 0) > 0 && <span className="small muted">{fmtQty(i.id, stock[i.id])}</span>}</button>)}</div>
      </div> : <div className="stack">
        <h3>{ING_MAP[addIng].name}</h3>
        <div className="row between"><span>Miqdor</span><Stepper value={addQty} min={0} max={99999} step={stepFor(addIng)} onChange={setAddQty} fmt={v => fmtQty(addIng, v)} /></div>
        <label className="field">Narxi ({ING_MAP[addIng].unit === 'dona' ? '1 dona' : ING_MAP[addIng].unit === 'g' ? '1 kg' : '1 L'} uchun, so'm)<input type="number" value={addPrice} onChange={e => setAddPrice(+e.target.value)} /></label>
        <div className="small muted">Jami ≈ {fmtMoney(ING_MAP[addIng].unit === 'dona' ? addQty * addPrice : addQty / 1000 * addPrice)} · muddat: {ING_MAP[addIng].shelf[ING_MAP[addIng].place]} kun</div>
        <div className="row"><button className="btn ghost" onClick={() => setAddIng(null)}>Orqaga</button><button className="btn primary grow" disabled={addQty <= 0} onClick={() => { st.addLot(addIng, addQty, addPrice, undefined, 'qo\'lda'); setAdd(false); st.showToast('Omborga qo\'shildi') }}>Qo'shish</button></div>
      </div>}
    </Sheet>
  </div>
}
