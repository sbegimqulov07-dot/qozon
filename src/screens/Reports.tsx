import { useMemo, useState } from 'react'
import { ING_MAP } from '../data/ingredients'
import { addDays, todayStr } from '../engine/model'
import { fmtMoney, fmtNum } from '../engine/units'
import { useStore } from '../store/store'

export default function Reports() {
  const data = useStore(s => s.data)
  const [tab, setTab] = useState<'xarajat' | 'kcal'>('xarajat')
  const today = todayStr()
  const days = useMemo(() => Array.from({ length: 14 }).map((_, i) => addDays(today, i - 13)).map(d => {
    const ls = data.logs.filter(l => l.date === d)
    return { d, cost: ls.filter(l => l.type === 'eat' || l.type === 'eat_out').reduce((s, l) => s + l.cost, 0), kcal: ls.filter(l => l.type === 'eat' || l.type === 'eat_out').reduce((s, l) => s + l.kcal, 0), water: data.water[d] ?? 0, out: ls.filter(l => l.type === 'eat_out').length, home: ls.filter(l => l.type === 'eat').length }
  }), [data, today])
  const month = today.slice(0, 7)
  const ml = data.logs.filter(l => l.date.startsWith(month))
  const mCost = ml.filter(l => l.type === 'eat' || l.type === 'eat_out').reduce((s, l) => s + l.cost, 0)
  const mWaste = ml.filter(l => l.type === 'waste').reduce((s, l) => s + l.cost, 0)
  const mBuy = ml.filter(l => l.type === 'buy').reduce((s, l) => s + l.cost, 0)
  const homeMeals = ml.filter(l => l.type === 'eat').reduce((s, l) => s + (l.portions ?? 1), 0)
  const outMeals = ml.filter(l => l.type === 'eat_out').length
  const saved = homeMeals * data.settings.eatOutPrice - ml.filter(l => l.type === 'eat').reduce((s, l) => s + l.cost, 0)
  const dayBudget = data.settings.budgetMonthly / 30
  const dim = new Date().getDate()
  const dishes = useMemo(() => { const m: Record<string, { n: number; cost: number; kcal: number; name: string }> = {}; for (const l of data.logs) if (l.type === 'cook' && l.recipeId) { const x = (m[l.recipeId] ??= { n: 0, cost: 0, kcal: 0, name: l.name ?? l.recipeId }); x.n++; x.cost += l.cost / (l.portions ?? 1); x.kcal += l.kcal / (l.portions ?? 1) } return Object.values(m).map(x => ({ ...x, cost: x.cost / x.n, kcal: x.kcal / x.n })).sort((a, b) => b.n - a.n) }, [data.logs])
  const maxV = Math.max(1, ...days.map(x => tab === 'xarajat' ? x.cost : x.kcal), tab === 'xarajat' ? dayBudget : data.settings.kcalTarget)
  const avgKcal = days.filter(x => x.kcal > 0).reduce((s, x) => s + x.kcal, 0) / Math.max(1, days.filter(x => x.kcal > 0).length)

  return <div className="stack">
    <h1>Hisobot</h1>
    <div className="grid2">
      <div className="card"><div className="eyebrow">Bu oy yeyildi</div><div className="big-num" style={{ fontSize: '1.2rem' }}>{fmtMoney(mCost)}</div><div className="tiny muted num">byudjet {fmtNum(data.settings.budgetMonthly)} · kutilgan {fmtNum(dayBudget * dim)}</div></div>
      <div className="card"><div className="eyebrow">Tejaldi</div><div className="big-num" style={{ fontSize: '1.2rem', color: 'var(--ok)' }}>{fmtMoney(Math.max(0, saved))}</div><div className="tiny muted">{homeMeals} mahal uyda vs tashqarida {fmtNum(data.settings.eatOutPrice)}</div></div>
      <div className="card"><div className="eyebrow">Bozorlikka</div><div className="big-num" style={{ fontSize: '1.2rem' }}>{fmtMoney(mBuy)}</div><div className="tiny muted">{data.purchases.filter(p => p.date.startsWith(month)).length} ta xarid</div></div>
      <div className="card"><div className="eyebrow">Chiqindi</div><div className="big-num" style={{ fontSize: '1.2rem', color: mWaste > 0 ? 'var(--bad)' : undefined }}>{fmtMoney(mWaste)}</div><div className="tiny muted">{mCost > 0 ? Math.round(mWaste / (mCost + mWaste) * 100) : 0} % · tashqarida {outMeals} mahal</div></div>
    </div>

    <div className="card stack">
      <div className="row between"><h2>Oxirgi 14 kun</h2><div className="tabs" style={{ width: 200 }}><button className={tab === 'xarajat' ? 'on' : ''} onClick={() => setTab('xarajat')}>So'm</button><button className={tab === 'kcal' ? 'on' : ''} onClick={() => setTab('kcal')}>kcal</button></div></div>
      <div style={{ position: 'relative' }}>
        <div className="bar-chart" role="img" aria-label={tab === 'xarajat' ? 'Kunlik xarajat' : 'Kunlik kaloriya'}>
          {days.map(x => { const v = tab === 'xarajat' ? x.cost : x.kcal; const lim = tab === 'xarajat' ? dayBudget : data.settings.kcalTarget
            return <div key={x.d} className={'b' + (tab === 'xarajat' && v > lim * 1.2 ? ' over' : '') + (x.d === today ? ' today' : '')} style={{ height: (v / maxV * 100) + '%', opacity: v === 0 ? .25 : undefined }} title={`${x.d}: ${tab === 'xarajat' ? fmtMoney(v) : fmtNum(v) + ' kcal'}`} /> })}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: ((tab === 'xarajat' ? dayBudget : data.settings.kcalTarget) / maxV * 100) + '%', borderTop: '1px dashed var(--muted)' }}><span className="tiny muted" style={{ position: 'absolute', right: 0, top: -16 }}>{tab === 'xarajat' ? 'kunlik byudjet' : 'maqsad'}</span></div>
      </div>
      <div className="row between tiny muted num"><span>{days[0].d.slice(5)}</span><span>bugun</span></div>
      <div className="small muted">{tab === 'kcal' ? `O'rtacha ${fmtNum(avgKcal)} kcal/kun (maqsad ${fmtNum(data.settings.kcalTarget)}). Suv o'rtacha ${(days.reduce((s, x) => s + x.water, 0) / 14 / 1000).toFixed(1)} L.` : `O'rtacha ${fmtMoney(days.reduce((s, x) => s + x.cost, 0) / 14)} / kun.`}</div>
      <details><summary>Jadval</summary><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Kun</th><th className="r">So'm</th><th className="r">kcal</th><th className="r">Suv</th><th className="r">Uyda/tashqarida</th></tr></thead><tbody>{[...days].reverse().map(x => <tr key={x.d}><td className="num">{x.d.slice(5)}</td><td className="r">{fmtNum(x.cost)}</td><td className="r">{fmtNum(x.kcal)}</td><td className="r">{(x.water / 1000).toFixed(1)}</td><td className="r">{x.home}/{x.out}</td></tr>)}</tbody></table></div></details>
    </div>

    {dishes.length > 0 && <div className="card stack"><h2>Pishirilgan ovqatlar</h2><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Ovqat</th><th className="r">Marta</th><th className="r">Porsiya narxi</th><th className="r">kcal</th></tr></thead><tbody>{dishes.slice(0, 15).map(x => <tr key={x.name}><td>{x.name}</td><td className="r">{x.n}</td><td className="r">{fmtNum(x.cost)}</td><td className="r">{fmtNum(x.kcal)}</td></tr>)}</tbody></table></div></div>}

    {Object.keys(data.priceHistory).length > 0 && <div className="card stack"><h2>Narxlar o'zgarishi</h2><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Masalliq</th><th className="r">Birinchi</th><th className="r">Oxirgi</th><th className="r">Farq</th></tr></thead><tbody>{Object.entries(data.priceHistory).map(([id, h]) => { const a = h[0].price, b = h[h.length - 1].price; return <tr key={id}><td>{ING_MAP[id]?.name.split(' (')[0]}</td><td className="r">{fmtNum(a)}</td><td className="r">{fmtNum(b)}</td><td className="r" style={{ color: b > a ? 'var(--bad)' : b < a ? 'var(--ok)' : undefined }}>{a ? (b > a ? '+' : '') + Math.round((b - a) / a * 100) + ' %' : ''}</td></tr> })}</tbody></table></div></div>}

    {data.logs.length === 0 && <div className="card muted">Hali ma'lumot yo'q. Birinchi ovqatni pishirganingizdan keyin bu yerda xarajat, kaloriya va tejam ko'rinadi.</div>}
  </div>
}
