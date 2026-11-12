import { useMemo, useState } from 'react'
import { ING_MAP, INGREDIENTS, QUICK_PANTRY } from '../data/ingredients'
import { RECIPE_CAT_LABEL, RECIPES } from '../data/recipes'
import { fmtMoney, fmtQty } from '../engine/units'
import { portionCost, portionKcal } from '../engine/pricing'
import { Check, Stepper } from '../components/ui'
import { useStore } from '../store/store'
import { go } from '../store/ui'
import { loadRemote } from '../store/sync'

const EXCL = [{ id: 'jigar', l: 'Jigar' }, { id: 'kolbasa', l: 'Kolbasa' }, { id: 'sosiska', l: 'Sosiska' }, { id: 'tvorog', l: 'Tvorog' }, { id: 'qatiq', l: 'Qatiq' }, { id: 'mosh', l: 'Mosh' }, { id: 'yasmiq', l: 'Yasmiq' }, { id: 'qovoq', l: 'Qovoq' }, { id: 'karam', l: 'Karam' }, { id: 'mayonez', l: 'Mayonez' }, { id: 'mol', l: 'Mol go\'shti' }, { id: 'yongoq', l: 'Yong\'oq' }]

export default function Onboarding() {
  const finish = useStore(s => s.finishOnboarding)
  const connectSync = useStore(s => s.connectSync)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [people, setPeople] = useState(1)
  const [excluded, setExcluded] = useState<string[]>([])
  const [recipes, setRecipes] = useState<string[]>(RECIPES.map(r => r.id))
  const [pantry, setPantry] = useState<Record<string, number>>({})
  const [code, setCode] = useState('')
  const [codeMsg, setCodeMsg] = useState('')
  const ctx = { override: {}, store: 'bozor' as const }

  const visibleRecipes = useMemo(() => RECIPES.filter(r => !r.ingredients.some(i => !i.opt && excluded.includes(i.id))), [excluded])
  const toggle = (id: string) => setRecipes(r => r.includes(id) ? r.filter(x => x !== id) : [...r, id])

  const tryCode = async () => {
    if (code.trim().length < 6) { setCodeMsg('Kod kamida 6 ta belgi'); return }
    try { const r = await loadRemote(code.trim()); if (r) { await connectSync(code.trim(), 'remote'); setCodeMsg('Yuklandi!'); go('bugun') } else setCodeMsg('Serverda bu kod bilan ma\'lumot yo\'q — yangi boshlaymiz, kod oxirida saqlanadi') } catch (e) { setCodeMsg('Xato: ' + (e as Error).message) }
  }

  const done = () => {
    finish({ name, people, excluded, syncCode: code.trim().length >= 6 ? code.trim() : '' }, recipes.filter(id => visibleRecipes.some(r => r.id === id)), Object.entries(pantry).map(([id, qty]) => ({ id, qty })))
    go('bozorlik')
  }

  const steps = ['Salom', 'Yemayman', 'Ovqatlarim', 'Uyda nima bor', 'Tayyor']
  return (
    <div className="main stack" style={{ paddingBottom: 40 }}>
      <div className="row between"><div className="brand">🍲 Qozon</div><span className="onb-step">{step + 1} / {steps.length} · {steps[step]}</span></div>
      {step === 0 && <div className="stack">
        <h1>Uy oshxonangiz yordamchisi</h1>
        <p className="muted">Har kuni nima pishirishni tavsiya qiladi, qadamma-qadam o'rgatadi, omborni va xarajatni hisoblab boradi.</p>
        <label className="field">Ismingiz (ixtiyoriy)<input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Masalan, Behruz" /></label>
        <div className="row between card"><div><div className="bold">Nechta odamga pishirasiz?</div><div className="small muted">Barcha miqdorlar shunga ko'paytiriladi</div></div><Stepper value={people} min={1} max={8} onChange={setPeople} /></div>
        <div className="card stack">
          <div className="bold">Boshqa qurilmada allaqachon ishlatganmisiz?</div>
          <p className="small muted">Sinxron kodingizni kiriting — ombor va tarix yuklanadi. Yangi bo'lsangiz, o'zingiz xohlagan kodni o'ylab toping (parol kabi, kamida 6 belgi) — shu kod bilan boshqa qurilmada ham ochasiz.</p>
          <div className="row"><input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="masalan: behruz-oshxona-2026" /><button className="btn sm" onClick={tryCode}>Tekshirish</button></div>
          {codeMsg && <p className="small">{codeMsg}</p>}
        </div>
        <button className="btn primary xl" onClick={() => setStep(1)}>Davom etish</button>
      </div>}
      {step === 1 && <div className="stack">
        <h1>Nimani yemaysiz?</h1>
        <p className="muted">Dengiz mahsulotlari va cho'chqa go'shti bazada umuman yo'q. Quyidagilardan yoqtirmaganingizni belgilang — ular hech qayerda chiqmaydi.</p>
        <div className="chips">{EXCL.map(e => <button key={e.id} className={'chip lg' + (excluded.includes(e.id) ? ' sel' : '')} onClick={() => setExcluded(x => x.includes(e.id) ? x.filter(y => y !== e.id) : [...x, e.id])}>{e.l}</button>)}</div>
        <div className="row"><button className="btn ghost" onClick={() => setStep(0)}>Orqaga</button><button className="btn primary grow" onClick={() => setStep(2)}>Davom etish</button></div>
      </div>}
      {step === 2 && <div className="stack">
        <h1>Ovqatlar ro'yxatingiz</h1>
        <p className="muted">Hammasi yoqilgan. Yemaydiganingizni o'chiring. Narx — 1 porsiya uchun taxminiy, kcal — 1 porsiya.</p>
        {Object.entries(RECIPE_CAT_LABEL).map(([cat, label]) => {
          const rs = visibleRecipes.filter(r => r.cat === cat)
          if (!rs.length) return null
          return <div key={cat} className="section"><div className="eyebrow" style={{ marginBottom: 6 }}>{label} · {rs.filter(r => recipes.includes(r.id)).length}/{rs.length}</div>
            <div className="list card" style={{ padding: '0 14px' }}>{rs.map(r => <div key={r.id} className="item"><Check on={recipes.includes(r.id)} onClick={() => toggle(r.id)} /><div className="grow"><div className="title">{r.name}</div><div className="small muted num">{r.time} daq · {fmtMoney(portionCost(r, ctx))} · {Math.round(portionKcal(r))} kcal</div></div></div>)}</div>
          </div>
        })}
        <div className="row"><button className="btn ghost" onClick={() => setStep(1)}>Orqaga</button><button className="btn primary grow" onClick={() => setStep(3)} disabled={recipes.length < 5}>Davom etish ({recipes.length})</button></div>
      </div>}
      {step === 3 && <div className="stack">
        <h1>Hozir uyda nima bor?</h1>
        <p className="muted">Taxminan bo'lsa ham bo'ladi — keyin omborda tuzatasiz. Hech narsa bo'lmasa, o'tkazib yuboring.</p>
        <div className="list card" style={{ padding: '0 14px' }}>{QUICK_PANTRY.map(id => { const ing = ING_MAP[id]; const q = pantry[id] ?? 0; const step = ing.unit === 'dona' ? 1 : ing.pack >= 1000 ? 250 : ing.pack >= 200 ? 50 : 10
          return <div key={id} className="item"><div className="grow"><div className="title">{ing.name}</div><div className="small muted">{q > 0 ? fmtQty(id, q) : 'yo\'q'}</div></div><Stepper value={q} min={0} max={99999} step={step} onChange={v => setPantry(p => ({ ...p, [id]: v }))} fmt={v => v === 0 ? '0' : fmtQty(id, v).replace(/ (g|ml|dona|kg|L)$/, '')} /></div> })}</div>
        <details><summary>Boshqa masalliq qo'shish</summary><div className="chips" style={{ paddingBottom: 10 }}>{INGREDIENTS.filter(i => !QUICK_PANTRY.includes(i.id)).map(i => <button key={i.id} className={'chip' + ((pantry[i.id] ?? 0) > 0 ? ' sel' : '')} onClick={() => setPantry(p => ({ ...p, [i.id]: (p[i.id] ?? 0) > 0 ? 0 : i.pack }))}>{i.name.split(' (')[0]}</button>)}</div></details>
        <div className="row"><button className="btn ghost" onClick={() => setStep(2)}>Orqaga</button><button className="btn primary grow" onClick={() => setStep(4)}>Davom etish</button></div>
      </div>}
      {step === 4 && <div className="stack">
        <h1>Tayyor{name ? `, ${name}` : ''}!</h1>
        <div className="card stack">
          <div className="row between"><span>Odam soni</span><b>{people}</b></div>
          <div className="row between"><span>Retseptlar</span><b>{recipes.filter(id => visibleRecipes.some(r => r.id === id)).length} ta</b></div>
          <div className="row between"><span>Omborda</span><b>{Object.values(pantry).filter(v => v > 0).length} ta masalliq</b></div>
          <div className="row between"><span>Kunlik maqsad</span><b>2 600 kcal · 2 L suv</b></div>
          <div className="row between"><span>Oylik byudjet</span><b>1 200 000 so'm</b></div>
        </div>
        <p className="muted">Keyingi qadam — birinchi bozorlik ro'yxati. Ilova 1 hafta yoki 1 oyga ovqat rejasini tuzib, nimani qancha pulga olishni ko'rsatadi.</p>
        <button className="btn primary xl" onClick={done}>Bozorlik ro'yxatini tuzish</button>
        <button className="btn ghost" onClick={() => setStep(3)}>Orqaga</button>
      </div>}
    </div>
  )
}
