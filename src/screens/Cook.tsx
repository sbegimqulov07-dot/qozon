import { useEffect, useRef, useState } from 'react'
import { Check, Icons, Stepper } from '../components/ui'
import { ING_MAP } from '../data/ingredients'
import { RECIPE_MAP, SLOT_LABEL } from '../data/recipes'
import type { Slot } from '../data/types'
import { availability, stockMap } from '../engine/pantry'
import { recipeCost, recipeKcal } from '../engine/pricing'
import { priceCtx } from '../engine/recommend'
import { fmtMoney, fmtNum, fmtQty, homeMeasure } from '../engine/units'
import { useStore } from '../store/store'
import { useUI } from '../store/ui'

export default function Cook({ recipeId, slot }: { recipeId: string; slot: Slot }) {
  const r = RECIPE_MAP[recipeId]
  const data = useStore(s => s.data)
  const cook = useStore(s => s.cook)
  const stop = useUI(s => s.stopCook)
  const [scale, setScale] = useState(data.settings.people)
  const [phase, setPhase] = useState<'prep' | 'steps' | 'done' | 'result'>('prep')
  const [i, setI] = useState(0)
  const [checked, setChecked] = useState<string[]>([])
  const [made, setMade] = useState(r ? r.servings * data.settings.people : 1)
  const [eat, setEat] = useState(data.settings.people)
  const [result, setResult] = useState<{ cost: number; kcal: number } | null>(null)
  const ctx = priceCtx(data)
  const lock = useRef<{ release: () => Promise<void> } | null>(null)

  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } }
    nav.wakeLock?.request('screen').then(l => { lock.current = l }).catch(() => {})
    return () => { lock.current?.release().catch(() => {}) }
  }, [])
  useEffect(() => { setMade(r ? r.servings * scale : 1); setEat(Math.min(scale, r ? r.servings * scale : 1)) }, [scale, r])
  if (!r) return null

  const av = availability(r, stockMap(data.lots), scale, ctx)
  const total = recipeCost(r, ctx, scale), kcal = recipeKcal(r, scale)
  const step = r.steps[i]

  const finish = () => { const res = cook(r.id, scale, made, eat, slot); setResult(res); setPhase('result') }

  return (
    <div className="cook">
      <div className="cook-head">
        <button className="icon-btn" aria-label="Yopish" onClick={stop}>{Icons.close}</button>
        <div className="col" style={{ gap: 0, alignItems: 'center' }}><b style={{ fontSize: '.95rem' }}>{r.name}</b><span className="tiny muted">{SLOT_LABEL[slot]} · {phase === 'steps' ? `${i + 1} / ${r.steps.length}` : phase === 'prep' ? 'Tayyorgarlik' : 'Tayyor'}</span></div>
        <span style={{ width: 40 }} />
      </div>
      {phase === 'steps' && <div className="progress" style={{ margin: '0 16px', borderRadius: 0 }}><i style={{ width: ((i + 1) / r.steps.length * 100) + '%' }} /></div>}

      <div className="cook-body stack">
        {phase === 'prep' && <>
          <div className="card row between"><div><div className="bold">Nechta odamga?</div><div className="small muted num">{r.servings * scale} porsiya chiqadi · {fmtMoney(total)} · {fmtNum(kcal)} kcal</div></div><Stepper value={scale} min={1} max={8} onChange={setScale} /></div>
          {av.status !== 'full' && <div className="card" style={{ borderColor: 'var(--warn)' }}><b>Omborda yetishmaydi:</b> {av.missing.map(m => `${ING_MAP[m.id]?.name.split(' (')[0]} (${fmtQty(m.id, m.need - m.have)})`).join(', ')}<div className="small muted" style={{ marginTop: 4 }}>Baribir pishirsangiz, yo'q qismi mo'ljal narxda hisoblanadi va ombor 0 ga tushadi.</div></div>}
          <div className="eyebrow">Masalliqlarni stol ustiga qo'ying</div>
          <div className="list card" style={{ padding: '0 14px' }}>
            {r.ingredients.map(ing => { const q = ing.qty * scale; const hm = homeMeasure(ing.id, q); const have = (stockMap(data.lots)[ing.id] ?? 0) >= q * 0.9
              return <div key={ing.id} className="item"><Check on={checked.includes(ing.id)} onClick={() => setChecked(c => c.includes(ing.id) ? c.filter(x => x !== ing.id) : [...c, ing.id])} />
                <div className="grow"><div className={'title' + (checked.includes(ing.id) ? ' strike' : '')}>{ING_MAP[ing.id]?.name}{ing.opt && <span className="muted small"> (ixtiyoriy)</span>}{ing.note && <span className="muted small"> — {ing.note}</span>}</div><div className="small muted num">{fmtQty(ing.id, q)}{hm ? ` · ${hm}` : ''}{!have && !ing.opt ? ' · omborda yo\'q' : ''}</div></div>
                <span className={'dot ' + (have ? 'ok' : ing.opt ? 'off' : 'bad')} /></div> })}
          </div>
          {r.tools && <div className="small muted">Kerak: {r.tools.join(', ')}</div>}
        </>}

        {phase === 'steps' && step && <>
          <div className="eyebrow">{i + 1}-qadam</div>
          <p className="step-text">{step.t}</p>
          {step.why && <div className="why">Nega: {step.why}</div>}
          {step.timer && <Timer minutes={step.timer} key={i} />}
        </>}

        {phase === 'done' && <>
          <h2>Tayyor! 🎉</h2>
          <div className="card row between"><div><div className="bold">Necha porsiya chiqdi?</div><div className="small muted">Retsept bo'yicha {r.servings * scale}</div></div><Stepper value={made} min={1} max={20} onChange={v => { setMade(v); setEat(Math.min(eat, v)) }} /></div>
          <div className="card row between"><div><div className="bold">Hozir nechtasini yeysiz?</div><div className="small muted">Qolgani qoldiq sifatida saqlanadi (3 kun)</div></div><Stepper value={eat} min={0} max={made} onChange={setEat} /></div>
          <div className="card">
            <div className="row between"><span>Tannarx (hammasi)</span><b className="num">{fmtMoney(total)}</b></div>
            <div className="row between"><span>1 porsiya</span><b className="num">{fmtMoney(total / made)} · {fmtNum(kcal / made)} kcal</b></div>
            <div className="row between"><span>Hozir yeyilgan</span><b className="num">{fmtMoney(total / made * eat)} · {fmtNum(kcal / made * eat)} kcal</b></div>
          </div>
        </>}

        {phase === 'result' && result && <>
          <h2>Yozib qo'yildi</h2>
          <div className="card stack">
            <div className="row between"><span>Bugungi xarajatga</span><b className="num">+{fmtMoney(result.cost)}</b></div>
            <div className="row between"><span>Kaloriya</span><b className="num">+{fmtNum(result.kcal)} kcal</b></div>
            <div className="row between"><span>Ombordan ayrildi</span><b>{r.ingredients.filter(x => !x.opt).length} ta masalliq</b></div>
            {made - eat > 0 && <div className="row between"><span>Qoldiq</span><b>{made - eat} porsiya</b></div>}
          </div>
          {r.leftover && <div className="why">Maslahat: {r.leftover}</div>}
          <div className="row"><button className="btn sm ghost" onClick={() => useStore.getState().toggleFav(r.id)}>{data.favorites.includes(r.id) ? '❤ Sevimli' : '♡ Sevimliga'}</button><button className="btn sm ghost" onClick={() => useStore.getState().toggleDislike(r.id)}>{data.disliked.includes(r.id) ? 'Kamroq tavsiya: yoqilgan' : 'Kamroq tavsiya qil'}</button></div>
        </>}
      </div>

      <div className="cook-foot">
        {phase === 'prep' && <button className="btn primary xl" onClick={() => setPhase('steps')}>Boshlash</button>}
        {phase === 'steps' && <>
          <button className="btn" onClick={() => i === 0 ? setPhase('prep') : setI(i - 1)}>Orqaga</button>
          <button className="btn primary grow xl" style={{ width: 'auto' }} onClick={() => i >= r.steps.length - 1 ? setPhase('done') : setI(i + 1)}>{i >= r.steps.length - 1 ? 'Tayyor!' : 'Keyingi qadam'}</button>
        </>}
        {phase === 'done' && <><button className="btn" onClick={() => setPhase('steps')}>Orqaga</button><button className="btn primary grow xl" style={{ width: 'auto' }} onClick={finish}>Pishirdim — yozib qo'y</button></>}
        {phase === 'result' && <button className="btn primary xl" onClick={stop}>Yopish</button>}
      </div>
    </div>
  )
}

function Timer({ minutes }: { minutes: number }) {
  const [left, setLeft] = useState(minutes * 60)
  const [run, setRun] = useState(false)
  useEffect(() => {
    if (!run) return
    const id = setInterval(() => setLeft(l => { if (l <= 1) { clearInterval(id); setRun(false); try { navigator.vibrate?.([300, 100, 300, 100, 600]) } catch { /* yo'q */ } beep(); return 0 } return l - 1 }), 1000)
    return () => clearInterval(id)
  }, [run])
  const m = Math.floor(left / 60), s = left % 60
  return <div className="card col" style={{ alignItems: 'center' }}>
    <div className={'timer' + (left === 0 ? ' glow' : '')} style={{ color: left === 0 ? 'var(--pop)' : undefined }}>{m}:{String(s).padStart(2, '0')}</div>
    <div className="row">
      <button className={'btn ' + (run ? '' : 'primary')} onClick={() => setRun(!run)}>{run ? 'To\'xtatish' : left === 0 ? 'Vaqt tugadi' : 'Taymerni boshlash'}</button>
      <button className="btn ghost" onClick={() => { setRun(false); setLeft(minutes * 60) }}>Qayta</button>
    </div>
  </div>
}
function beep() {
  try { const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; const c = new C(); const o = c.createOscillator(); const g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 880; g.gain.value = .2; o.start(); setTimeout(() => { o.stop(); c.close() }, 700) } catch { /* ovoz yo'q */ }
}
