import { useMemo, useState } from 'react'
import { RecipeCard } from '../components/RecipeCard'
import { Icons, Progress, Sheet, Stepper } from '../components/ui'
import { ING_MAP } from '../data/ingredients'
import { RECIPE_MAP, SLOT_LABEL } from '../data/recipes'
import type { Slot } from '../data/types'
import { daysBetween, todayStr } from '../engine/model'
import { expiringSoon } from '../engine/pantry'
import { dayCost, dayKcal, recommend, snackIdeas } from '../engine/recommend'
import { fmtMoney, fmtNum, fmtQty } from '../engine/units'
import { useStore } from '../store/store'
import { go, useUI } from '../store/ui'

const SLOTS: Slot[] = ['nonushta', 'tushlik', 'kechki']
const DAYS = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']
const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr']

export default function Today() {
  const data = useStore(s => s.data)
  const st = useStore()
  const startCook = useUI(s => s.startCook)
  const today = todayStr()
  const d = new Date()
  const [filters, setFilters] = useState<{ quick?: boolean; cheap?: boolean; noMeat?: boolean }>({})
  const [openSlot, setOpenSlot] = useState<Slot | null>(null)
  const [other, setOther] = useState<{ slot: Slot; kind: 'out' | 'leftover'; lf?: string } | null>(null)
  const [outCost, setOutCost] = useState(30000); const [outKcal, setOutKcal] = useState(900); const [lfPortions, setLfPortions] = useState(1)

  const kcal = dayKcal(data, today), cost = dayCost(data, today)
  const water = data.water[today] ?? 0
  const month = today.slice(0, 7)
  const monthCost = data.logs.filter(l => l.date.startsWith(month) && (l.type === 'eat' || l.type === 'eat_out')).reduce((s, l) => s + l.cost, 0)
  const expiring = expiringSoon(data.lots, 2)
  const leftovers = data.leftovers.filter(l => l.portions > 0)
  const plans = Object.fromEntries(data.plans.filter(p => p.date === today).map(p => [p.slot, p]))

  const recs = useMemo(() => {
    const reserved: Record<string, number> = {}
    const out: Record<string, ReturnType<typeof recommend>> = {}
    for (const slot of SLOTS) {
      const list = recommend(data, slot, today, { ...filters, reserved })
      out[slot] = list
      const top = list[0]
      if (top && !plans[slot]) for (const i of top.recipe.ingredients) if (!i.opt) reserved[i.id] = (reserved[i.id] ?? 0) + i.qty * data.settings.people
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, filters])

  const deficit = data.settings.kcalTarget - kcal
  const snacks = useMemo(() => deficit > 150 ? snackIdeas(data, deficit) : [], [data, deficit])
  const hour = d.getHours()

  return (
    <div className="stack">
      <div>
        <div className="eyebrow">{DAYS[d.getDay()]}, {d.getDate()}-{MONTHS[d.getMonth()]}</div>
        <h1>{hour < 11 ? 'Xayrli tong' : hour < 17 ? 'Xayrli kun' : 'Xayrli kech'}{data.settings.name ? ', ' + data.settings.name : ''}</h1>
      </div>

      <div className="grid2">
        <div className="card col" style={{ gap: 6 }}>
          <div className="row between"><span className="eyebrow row" style={{ gap: 4 }}><span style={{ width: 14, height: 14, display: 'inline-flex', color: 'var(--pop)' }}>{Icons.flame}</span>Kaloriya</span><span className="tiny muted num">{fmtNum(data.settings.kcalTarget)}</span></div>
          <div className="big-num">{fmtNum(kcal)}</div>
          <Progress value={kcal} max={data.settings.kcalTarget} tone={kcal >= data.settings.kcalTarget ? 'ok' : hour >= 20 ? 'pop' : undefined} />
          <div className="tiny muted">{kcal >= data.settings.kcalTarget ? 'Maqsadga yetdingiz' : `Yana ${fmtNum(deficit)} kcal kerak`}</div>
        </div>
        <div className="card col" style={{ gap: 6 }}>
          <div className="row between"><span className="eyebrow">Bugun xarajat</span><span className="tiny muted num">kun ≈ {fmtNum(data.settings.budgetMonthly / 30)}</span></div>
          <div className="big-num">{fmtNum(cost)}</div>
          <Progress value={monthCost} max={data.settings.budgetMonthly} tone={monthCost > data.settings.budgetMonthly * d.getDate() / 30 * 1.1 ? 'warn' : undefined} />
          <div className="tiny muted num">Oy: {fmtNum(monthCost)} / {fmtNum(data.settings.budgetMonthly)}</div>
        </div>
      </div>

      <div className="card row between wrap">
        <div className="row" style={{ gap: 6 }}><span style={{ width: 18, height: 18, display: 'inline-flex', color: '#4A90D9' }}>{Icons.drop}</span><b className="num">{(water / 1000).toFixed(2).replace('.00', '')} L</b><span className="small muted">/ {data.settings.waterTarget / 1000} L</span></div>
        <div className="water" aria-label="Suv stakanlari">{Array.from({ length: Math.round(data.settings.waterTarget / 250) }).map((_, i) => <i key={i} className={water >= (i + 1) * 250 ? 'on' : ''} />)}</div>
        <div className="row"><button className="btn sm" onClick={() => st.addWater(250)}>+1 stakan</button><button className="btn sm ghost" onClick={() => st.addWater(-250)} aria-label="Kamaytirish">−</button></div>
      </div>

      {expiring.length > 0 && <div className="card" style={{ borderColor: 'var(--warn)' }}>
        <div className="eyebrow" style={{ color: 'var(--warn)' }}>Tez ishlating</div>
        <div className="small" style={{ marginTop: 4 }}>{expiring.slice(0, 5).map(l => { const dd = daysBetween(today, l.expiresAt); return <span key={l.id} style={{ marginRight: 10 }}>{ING_MAP[l.ing]?.name.split(' (')[0]} <span className="muted num">({fmtQty(l.ing, l.qty)}, {dd < 0 ? 'muddati o\'tgan' : dd === 0 ? 'bugun' : dd + ' kun'})</span></span> })}</div>
        <button className="btn sm" style={{ marginTop: 8 }} onClick={() => go('ombor')}>Omborni ko'rish</button>
      </div>}

      {leftovers.length > 0 && <div className="card" style={{ borderColor: 'var(--accent)' }}>
        <div className="eyebrow" style={{ color: 'var(--accent)' }}>Qoldiq ovqat — avval shuni yeng</div>
        <div className="list">{leftovers.map(l => <div key={l.id} className="item"><div className="grow"><div className="title">{l.name}</div><div className="small muted num">{l.portions} porsiya · {fmtMoney(l.portionCost)} / porsiya · {Math.round(l.portionKcal)} kcal · {daysBetween(today, l.expiresAt) <= 0 ? 'bugun yeng' : daysBetween(today, l.expiresAt) + ' kun'}</div></div>
          <button className="btn sm primary" onClick={() => { setLfPortions(Math.min(l.portions, data.settings.people)); setOther({ slot: hour < 11 ? 'nonushta' : hour < 16 ? 'tushlik' : 'kechki', kind: 'leftover', lf: l.id }) }}>Yedim</button>
          <button className="btn sm ghost" onClick={() => { if (window.confirm?.('Tashlab yuborasizmi?') !== false) st.wasteLeftover(l.id) }}>Tashladim</button></div>)}</div>
      </div>}

      <div className="chips">
        <button className={'chip lg' + (filters.quick ? ' sel' : '')} onClick={() => setFilters(f => ({ ...f, quick: !f.quick }))}>⚡ 20 daqiqa</button>
        <button className={'chip lg' + (filters.cheap ? ' sel' : '')} onClick={() => setFilters(f => ({ ...f, cheap: !f.cheap }))}>Arzon</button>
        <button className={'chip lg' + (filters.noMeat ? ' sel' : '')} onClick={() => setFilters(f => ({ ...f, noMeat: !f.noMeat }))}>Go'shtsiz</button>
      </div>

      {SLOTS.map(slot => {
        const plan = plans[slot]
        const list = recs[slot]
        const top = list[0]
        const eaten = data.logs.filter(l => l.date === today && l.slot === slot && (l.type === 'eat' || l.type === 'eat_out'))
        return <section key={slot} className="section">
          <div className="section-title"><h2>{SLOT_LABEL[slot]}</h2>{plan?.status === 'done' && <span className="chip ok">Bajarildi</span>}{plan?.status === 'skipped' && <span className="chip">O'tkazildi</span>}</div>
          {plan?.status === 'done' && eaten.length > 0 && <div className="card">{eaten.map(e => <div key={e.id} className="row between"><span>{e.name}</span><span className="small muted num">{fmtMoney(e.cost)} · {Math.round(e.kcal)} kcal</span></div>)}
            <button className="btn sm ghost" style={{ marginTop: 8 }} onClick={() => setOpenSlot(slot)}>Yana biror narsa yedim</button></div>}
          {plan?.status === 'skipped' && <div className="card row between"><span className="muted">O'tkazib yuborildi</span><button className="btn sm" onClick={() => st.planSlot(slot, top?.recipe.id ?? '')}>Qaytarish</button></div>}
          {plan?.status !== 'done' && plan?.status !== 'skipped' && <>
            {plan?.recipeId && RECIPE_MAP[plan.recipeId] && plan.recipeId !== top?.recipe.id ? (() => { const s = list.find(x => x.recipe.id === plan.recipeId); return s ? <RecipeCard s={s} hero slotLabel="Siz tanlagan" onPick={() => startCook(s.recipe.id, slot)} /> : null })() : top ? <RecipeCard s={top} hero slotLabel={SLOT_LABEL[slot]} onPick={() => startCook(top.recipe.id, slot)} /> : <div className="card muted">Mos retsept topilmadi. Retseptlar bo'limida "Yeyman"ni tekshiring.</div>}
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn sm grow" onClick={() => setOpenSlot(slot)}>Boshqa variantlar ({list.length - 1})</button>
              <button className="btn sm ghost" onClick={() => setOther({ slot, kind: 'out' })}>Tashqarida yedim</button>
              <button className="btn sm ghost" onClick={() => st.skipSlot(slot)}>O'tkazish</button>
            </div>
          </>}
        </section>
      })}

      {snacks.length > 0 && hour >= 15 && <section className="section">
        <div className="section-title"><h2>Tamaddi</h2><span className="small muted num">yana {fmtNum(deficit)} kcal</span></div>
        <p className="small muted" style={{ marginBottom: 8 }}>Kunlik 2 600 kcal ga yetish uchun tez variantlar:</p>
        <div className="stack">{snacks.map(s => <RecipeCard key={s.recipe.id} s={s} onPick={() => startCook(s.recipe.id, 'tamaddi')} pickLabel="Yedim / tayyorlash" />)}</div>
      </section>}

      <Sheet open={!!openSlot} onClose={() => setOpenSlot(null)} title={openSlot ? SLOT_LABEL[openSlot] + ' — variantlar' : ''}>
        {openSlot && <Variants list={recs[openSlot]} slot={openSlot} onPick={(id) => { startCook(id, openSlot); setOpenSlot(null) }} onPlan={(id) => { st.planSlot(openSlot, id); setOpenSlot(null) }} />}
      </Sheet>

      <Sheet open={!!other} onClose={() => setOther(null)} title={other?.kind === 'out' ? 'Tashqarida ovqatlandim' : 'Qoldiqni yedim'}>
        {other?.kind === 'out' && <div className="stack">
          <label className="field">Qancha to'ladingiz (so'm)<input type="number" value={outCost} onChange={e => setOutCost(+e.target.value)} /></label>
          <label className="field">Taxminan kcal<input type="number" value={outKcal} onChange={e => setOutKcal(+e.target.value)} /></label>
          <div className="chips">{[['Lavash', 25000, 800], ['Osh (bozorda)', 40000, 1000], ['Somsa 2 ta', 20000, 700], ['Shaurma', 30000, 850], ['Burger menyu', 55000, 1100]].map(([n, c, k]) => <button key={n as string} className="chip lg" onClick={() => { setOutCost(c as number); setOutKcal(k as number) }}>{n as string}</button>)}</div>
          <button className="btn primary block" onClick={() => { st.eatOut(other.slot, outCost, outKcal, 'Tashqarida'); setOther(null) }}>Saqlash</button>
        </div>}
        {other?.kind === 'leftover' && other.lf && (() => { const lf = data.leftovers.find(l => l.id === other.lf); if (!lf) return null; return <div className="stack">
          <div className="row between"><span>Necha porsiya?</span><Stepper value={lfPortions} min={1} max={lf.portions} onChange={setLfPortions} /></div>
          <div className="tabs">{SLOTS.map(s => <button key={s} className={other.slot === s ? 'on' : ''} onClick={() => setOther({ ...other, slot: s })}>{SLOT_LABEL[s]}</button>)}</div>
          <button className="btn primary block" onClick={() => { st.eatLeftover(lf.id, lfPortions, other.slot); setOther(null) }}>Yedim — {fmtMoney(lf.portionCost * lfPortions)} · {Math.round(lf.portionKcal * lfPortions)} kcal</button>
        </div> })()}
      </Sheet>
    </div>
  )
}

function Variants({ list, slot, onPick, onPlan }: { list: ReturnType<typeof recommend>; slot: Slot; onPick: (id: string) => void; onPlan: (id: string) => void }) {
  const groups = [['Hozir pishirsa bo\'ladi', list.filter(s => s.avail.status === 'full')], ['1–2 ta narsa yetishmaydi', list.filter(s => s.avail.status === 'almost')], ['Bozorlik kerak', list.filter(s => s.avail.status === 'missing')]] as const
  void slot
  return <div className="stack">{groups.map(([t, g]) => g.length ? <div key={t} className="stack"><div className="eyebrow">{t} · {g.length}</div>{g.map(s => <div key={s.recipe.id}><RecipeCard s={s} onPick={s.avail.status === 'missing' ? undefined : () => onPick(s.recipe.id)} /><div className="row" style={{ marginTop: -6, marginBottom: 6 }}><button className="btn sm ghost grow" onClick={() => onPlan(s.recipe.id)}>Bugunga tanlash</button>{s.avail.status === 'missing' && <button className="btn sm ghost grow" onClick={() => go('bozorlik')}>Bozorlikka</button>}</div></div>)}</div> : null)}</div>
}
