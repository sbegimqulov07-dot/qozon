import { useMemo, useState } from 'react'
import { Check, Sheet, Stepper } from '../components/ui'
import { ING_MAP } from '../data/ingredients'
import { RECIPE_MAP, SLOT_LABEL } from '../data/recipes'
import type { ShoppingList } from '../engine/model'
import { buildShoppingList, listParTotal, listTotal, listUseTotal } from '../engine/shopping'
import { fmtMoney, fmtNum, fmtQty } from '../engine/units'
import { useStore } from '../store/store'
import { go } from '../store/ui'

export default function Shopping() {
  const data = useStore(s => s.data)
  const st = useStore()
  const [horizon, setHorizon] = useState(7)
  const [mode, setMode] = useState<'plan' | 'par' | 'mix'>('mix')
  const [store, setStore] = useState<'bozor' | 'market'>(data.settings.store)
  const [preview, setPreview] = useState<ShoppingList | null>(null)
  const [edit, setEdit] = useState<string | null>(null)
  const [eQty, setEQty] = useState(0); const [ePrice, setEPrice] = useState(0)
  const [showMenu, setShowMenu] = useState(false)
  const list = data.shopping

  const [genErr, setGenErr] = useState('')
  const gen = () => { try { const l = buildShoppingList(data, horizon, mode, store); if (!l.lines.length) { setGenErr('Ro\'yxat bo\'sh chiqdi: omborda hammasi yetarli yoki "Yeyman" retseptlar juda kam. Retseptlar bo\'limini tekshiring.'); return } setGenErr(''); setPreview(l) } catch (e) { setGenErr('Xato: ' + (e as Error).message) } }
  const sections = useMemo(() => { const l = preview ?? list; if (!l) return []; const m: Record<string, typeof l.lines> = {}; for (const x of l.lines) (m[x.kind === 'par' ? 'Zaxira (bir marta olinadi, oylarga yetadi)' : ING_MAP[x.ing].section] ??= []).push(x); return Object.entries(m) }, [preview, list])
  const copyText = () => { const l = list ?? preview; if (!l) return; const t = sections.map(([s, xs]) => `${s}:\n` + xs.map(x => `  • ${ING_MAP[x.ing].name} — ${fmtQty(x.ing, x.qty)} ≈ ${fmtMoney(x.estPrice)}`).join('\n')).join('\n') + `\nJami ≈ ${fmtMoney(listTotal(l))}`; navigator.clipboard?.writeText(t).then(() => st.showToast('Nusxalandi — Telegramga tashlang')).catch(() => st.showToast('Nusxalab bo\'lmadi')) }

  if (!list && !preview) return <div className="stack">
    <h1>Bozorlik</h1>
    <p className="muted">Ilova ovqat rejasini tuzadi, ombordagini ayiradi, qadoqqa yaxlitlaydi va narxlarini ko'rsatadi.</p>
    <div className="card stack">
      <div className="eyebrow">Necha kunga?</div>
      <div className="tabs">{[7, 14, 30].map(h => <button key={h} className={horizon === h ? 'on' : ''} onClick={() => setHorizon(h)}>{h === 30 ? '1 oy' : h === 14 ? '2 hafta' : '1 hafta'}</button>)}</div>
      {horizon === 30 && <p className="small muted">1 oylik ro'yxatda tez buziladiganlar (sut, pomidor, ko'kat) faqat 1-haftaga olinadi — qolganini haftalik to'ldirishda olasiz. Go'shtni 200–300 g lik bo'lib muzlating.</p>}
      <div className="eyebrow">Nima asosida?</div>
      <div className="tabs"><button className={mode === 'mix' ? 'on' : ''} onClick={() => setMode('mix')}>Reja + zaxira</button><button className={mode === 'plan' ? 'on' : ''} onClick={() => setMode('plan')}>Faqat reja</button><button className={mode === 'par' ? 'on' : ''} onClick={() => setMode('par')}>Faqat zaxira</button></div>
      <div className="eyebrow">Qayerdan?</div>
      <div className="tabs"><button className={store === 'bozor' ? 'on' : ''} onClick={() => setStore('bozor')}>Bozor</button><button className={store === 'market' ? 'on' : ''} onClick={() => setStore('market')}>Korzinka / supermarket</button></div>
      <button className="btn primary xl" onClick={gen}>Ro'yxat tuzish</button>
      {genErr && <p className="small" style={{ color: 'var(--bad)' }}>{genErr}</p>}
      <p className="tiny muted">"Yeyman" retseptlar: {data.myRecipes.length} ta · omborda {data.lots.length} partiya</p>
    </div>
    <History />
  </div>

  const L = (preview ?? list)!
  const est = listTotal(L), actual = listTotal(L, true), checked = L.lines.filter(x => x.checked).length
  const dayBudget = data.settings.budgetMonthly / 30 * L.horizon
  const useT = listUseTotal(L), parT = listParTotal(L), restT = Math.max(0, est - useT - parT)
  return <div className="stack">
    <div className="row between"><h1>{preview ? 'Yangi ro\'yxat' : 'Bozorlik ro\'yxati'}</h1>{preview ? <button className="btn sm ghost" onClick={() => setPreview(null)}>Bekor</button> : <button className="btn sm ghost" onClick={copyText}>Nusxalash</button>}</div>
    <div className="card">
      <div className="row between"><span className="eyebrow">{L.horizon} kun · {L.store === 'bozor' ? 'bozor' : 'supermarket'}</span><span className="small muted">{L.lines.length} satr</span></div>
      <div className="row between" style={{ marginTop: 6 }}><div><div className="tiny muted">Taxminiy</div><div className="big-num" style={{ fontSize: '1.3rem' }}>{fmtMoney(est)}</div></div>{!preview && <div style={{ textAlign: 'right' }}><div className="tiny muted">Savatda ({checked})</div><div className="big-num" style={{ fontSize: '1.3rem' }}>{fmtMoney(actual)}</div></div>}</div>
      <div className="stack" style={{ gap: 4, marginTop: 10, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
        <div className="row between small"><span>Shu {L.horizon} kunda yeyiladi</span><b className="num" style={{ color: useT > dayBudget * 1.05 ? 'var(--bad)' : 'var(--ok)' }}>{fmtMoney(useT)}</b></div>
        <div className="row between small muted"><span>{L.horizon} kunlik byudjet</span><span className="num">{fmtMoney(dayBudget)}</span></div>
        {restT > 500 && <div className="row between small muted"><span>Qadoq qoldig'i — keyingi haftaga o'tadi</span><span className="num">{fmtMoney(restT)}</span></div>}
        {parT > 0 && <div className="row between small muted"><span>Zaxira (bir martalik)</span><span className="num">{fmtMoney(parT)}</span></div>}
        {L.planKcal ? <div className="row between small muted"><span>Reja bo'yicha kuniga</span><span className="num">≈ {fmtNum(L.planKcal)} kcal / kishi</span></div> : null}
        <div className="tiny muted">{useT > dayBudget * 1.05 ? 'Yeyiladigan qism byudjetdan oshdi — "Arzonroq reja" tugmasini bosing yoki qimmat satrlarni o\'chiring.' : 'Yeyiladigan qism byudjet ichida. Zaxira va qadoq qoldig\'i bir marta to\'lanadi, keyingi haftalar ro\'yxati shuncha arzon bo\'ladi.'}</div>
      </div>
    </div>
    {preview && useT > dayBudget * 1.05 && <button className="btn block" onClick={() => setPreview(buildShoppingList({ ...data, settings: { ...data.settings, budgetMonthly: data.settings.budgetMonthly * 0.75 } }, L.horizon, L.mode, L.store))}>Arzonroq reja tuzish</button>}
    {L.menu && <details open={showMenu} onToggle={e => setShowMenu((e.target as HTMLDetailsElement).open)}><summary>Ovqat rejasi ({Object.keys(L.menu).length} kun)</summary>
      <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Kun</th><th>Nonushta</th><th>Tushlik</th><th>Kechki</th></tr></thead><tbody>{Object.entries(L.menu).map(([d, m]) => <tr key={d}><td className="num">{d.slice(5)}</td>{(['nonushta', 'tushlik', 'kechki'] as const).map(s => <td key={s} className="small">{m[s] ? RECIPE_MAP[m[s]!]?.name.split(' (')[0] : '—'}</td>)}</tr>)}</tbody></table></div>
      <p className="tiny muted">Bu taxminiy reja — har kuni "Bugun" sahifasi ombor holatiga qarab qayta tavsiya qiladi. {SLOT_LABEL.tamaddi} alohida.</p>
    </details>}
    {sections.map(([s, xs]) => <section key={s} className="section">
      <div className="eyebrow" style={{ marginBottom: 6 }}>{s} · {fmtMoney(xs.reduce((a, x) => a + (x.checked ? (x.actualPrice ?? x.estPrice) : x.estPrice), 0))}</div>
      <div className="list card" style={{ padding: '0 14px' }}>{xs.map(x => <div key={x.ing} className="item">
        {!preview && <Check on={!!x.checked} onClick={() => st.toggleShopLine(x.ing)} />}
        <button className="grow" style={{ textAlign: 'left' }} onClick={() => { if (preview) return; setEdit(x.ing); setEQty(x.actualQty ?? x.qty); setEPrice(x.actualPrice ?? x.estPrice) }}>
          <div className={'title' + (x.checked ? ' strike' : '')}>{ING_MAP[x.ing].name}</div>
          <div className="small muted num">{ING_MAP[x.ing].cat === 'gosht' && (x.actualQty ?? x.qty) >= 500 ? '❄ bo\'lib muzlating · ' : ''}{fmtQty(x.ing, x.actualQty ?? x.qty)}{x.packs > 1 ? ` (${x.packs} × ${ING_MAP[x.ing].packLabel})` : ` (${ING_MAP[x.ing].packLabel})`} · {x.reasons.join(', ')}</div>
        </button>
        <div className="num small" style={{ textAlign: 'right' }}><b>{fmtMoney(x.actualPrice ?? x.estPrice)}</b>{x.actualPrice !== undefined && <div className="tiny muted">reja {fmtMoney(x.estPrice)}</div>}</div>
        {preview && <button className="icon-btn" aria-label="O'chirish" onClick={() => setPreview({ ...L, lines: L.lines.filter(y => y.ing !== x.ing) })}>×</button>}
      </div>)}</div>
    </section>)}
    {preview ? <button className="btn primary xl" onClick={() => { st.setShopping(preview); setPreview(null); st.showToast('Ro\'yxat saqlandi') }}>Saqlash — bozorga tayyor</button>
      : <div className="stack"><button className="btn primary xl" disabled={!checked} onClick={() => { st.finishShopping(); st.showToast('Omborga qo\'shildi'); go('ombor') }}>Tugatdim — {checked} ta omborga ({fmtMoney(actual)})</button>
        <button className="btn ghost block" onClick={() => { if (window.confirm?.('Ro\'yxatni o\'chirasizmi?') !== false) st.setShopping(null) }}>Ro'yxatni o'chirish</button></div>}

    <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit ? ING_MAP[edit].name : ''}>
      {edit && <div className="stack">
        <div className="row between"><span>Olingan miqdor</span><Stepper value={eQty} min={0} max={99999} step={ING_MAP[edit].unit === 'dona' ? 1 : ING_MAP[edit].pack >= 1000 ? 100 : 25} onChange={setEQty} fmt={v => fmtQty(edit, v)} /></div>
        <label className="field">To'langan summa (jami, so'm)<input type="number" value={Math.round(ePrice)} onChange={e => setEPrice(+e.target.value)} /></label>
        <div className="small muted">Bu narx keyingi hisob-kitoblarda o'rganiladi ({ING_MAP[edit].unit === 'dona' ? 'dona' : ING_MAP[edit].unit === 'g' ? 'kg' : 'L'} narxi ≈ {fmtMoney(eQty > 0 ? (ING_MAP[edit].unit === 'dona' ? ePrice / eQty : ePrice / eQty * 1000) : 0)})</div>
        <button className="btn primary block" onClick={() => { st.toggleShopLine(edit, eQty, ePrice); setEdit(null) }}>Savatga ✓</button>
      </div>}
    </Sheet>
  </div>
}

function History() {
  const p = useStore(s => s.data.purchases)
  if (!p.length) return null
  return <section className="section"><div className="eyebrow" style={{ marginBottom: 6 }}>Xaridlar tarixi</div>
    <div className="list card" style={{ padding: '0 14px' }}>{[...p].reverse().slice(0, 10).map(x => <div key={x.id} className="item"><div className="grow"><div className="title num">{x.date} · {x.store}</div><div className="small muted">{x.lines.length} ta masalliq · reja {fmtMoney(x.plannedTotal)}</div></div><b className="num">{fmtMoney(x.total)}</b></div>)}</div></section>
}
