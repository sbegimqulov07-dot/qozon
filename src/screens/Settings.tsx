import { useState } from 'react'
import { Stepper } from '../components/ui'
import { INGREDIENTS } from '../data/ingredients'
import { emptyData } from '../engine/model'
import { refPrice } from '../engine/pricing'
import { priceCtx } from '../engine/recommend'
import { fmtMoney } from '../engine/units'
import { useStore } from '../store/store'

export default function Settings() {
  const data = useStore(s => s.data)
  const st = useStore()
  const s = data.settings
  const up = st.updateSettings
  const [code, setCode] = useState(s.syncCode)
  const [msg, setMsg] = useState('')
  const [pq, setPq] = useState('')
  const [imp, setImp] = useState('')
  const ctx = priceCtx(data)
  const EXCL = ['jigar', 'kolbasa', 'sosiska', 'tvorog', 'qatiq', 'mosh', 'yasmiq', 'qovoq', 'karam', 'mayonez', 'mol', 'yongoq', 'smetana', 'pishloq', 'bulgor', 'baqlajon']

  const connect = async (prefer: 'remote' | 'local') => {
    if (code.trim().length < 6) { setMsg('Kod kamida 6 ta belgi bo\'lsin'); return }
    try { const r = await st.connectSync(code.trim(), prefer); setMsg(r === 'remote' ? 'Serverdagi ma\'lumot yuklandi' : 'Ulandi — bu qurilmadagi ma\'lumot serverga yuborildi') } catch (e) { setMsg('Xato: ' + (e as Error).message) }
  }
  const exportJson = () => { const t = JSON.stringify(data); navigator.clipboard?.writeText(t).then(() => st.showToast('JSON nusxalandi — xavfsiz joyga saqlang')).catch(() => { setImp(t); st.showToast('Pastdagi maydondan nusxalang') }) }

  return <div className="stack">
    <h1>Sozlamalar</h1>
    <div className="card stack">
      <h2>Sinxronizatsiya</h2>
      <p className="small muted">Bitta kod — hamma qurilmada bir xil ombor. Kodni parol kabi saqlang: kim bilsa, ma'lumotni ko'radi. Holat: <b>{st.sync === 'off' ? 'ulanmagan' : st.syncMsg || st.sync}</b></p>
      <input type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="Sinxron kodi (kamida 6 belgi)" />
      <div className="row wrap"><button className="btn primary grow" onClick={() => connect('local')}>Ulash (mendagini yuborish)</button><button className="btn grow" onClick={() => connect('remote')}>Serverdagini yuklash</button></div>
      {msg && <p className="small">{msg}</p>}
      {s.syncCode && <div className="row"><button className="btn sm ghost" onClick={() => st.pullNow().then(ch => st.showToast(ch ? 'Yangilandi' : 'Hammasi yangi'))}>Hozir tekshirish</button><button className="btn sm ghost" onClick={() => { up({ syncCode: '' }); setCode(''); setMsg('Uzildi') }}>Uzish</button></div>}
    </div>

    <div className="card stack">
      <h2>Oshxona</h2>
      <div className="row between"><div><b>Odam soni</b><div className="small muted">Masalliqlar shunga ko'paytiriladi</div></div><Stepper value={s.people} min={1} max={8} onChange={v => up({ people: v })} /></div>
      <div className="row between"><div><b>Ish kuni vaqt</b><div className="small muted">daqiqa</div></div><Stepper value={s.timeWeekday} min={10} max={180} step={5} onChange={v => up({ timeWeekday: v })} /></div>
      <div className="row between"><div><b>Dam olish kuni vaqt</b></div><Stepper value={s.timeWeekend} min={10} max={240} step={10} onChange={v => up({ timeWeekend: v })} /></div>
      <div className="row between"><div><b>Haftada go'shtli ovqat</b><div className="small muted">reja tuzishda</div></div><Stepper value={s.meatPerWeek} min={0} max={14} onChange={v => up({ meatPerWeek: v })} /></div>
      <label className="row between"><span><b>Payshanba oshi</b><div className="small muted">payshanba kechqurun palovga ustunlik</div></span><input type="checkbox" checked={s.thursdayPlov} onChange={e => up({ thursdayPlov: e.target.checked })} style={{ width: 22, height: 22 }} /></label>
      <label className="field">Ismingiz<input type="text" value={s.name} onChange={e => up({ name: e.target.value })} /></label>
    </div>

    <div className="card stack">
      <h2>Maqsadlar va byudjet</h2>
      <label className="field">Oylik ovqat byudjeti (so'm)<input type="number" value={s.budgetMonthly} onChange={e => up({ budgetMonthly: +e.target.value })} /></label>
      <label className="field">Kunlik kaloriya maqsadi<input type="number" value={s.kcalTarget} onChange={e => up({ kcalTarget: +e.target.value })} /></label>
      <label className="field">Kunlik suv (ml)<input type="number" value={s.waterTarget} step={250} onChange={e => up({ waterTarget: +e.target.value })} /></label>
      <label className="field">Tashqarida bir mahal o'rtacha (so'm) — tejam hisobi uchun<input type="number" value={s.eatOutPrice} onChange={e => up({ eatOutPrice: +e.target.value })} /></label>
      <div className="eyebrow">Asosiy do'kon (narxlar shunga)</div>
      <div className="tabs"><button className={s.store === 'bozor' ? 'on' : ''} onClick={() => up({ store: 'bozor' })}>Bozor</button><button className={s.store === 'market' ? 'on' : ''} onClick={() => up({ store: 'market' })}>Korzinka / supermarket</button></div>
    </div>

    <div className="card stack">
      <h2>Yemayman</h2>
      <div className="chips">{EXCL.map(id => { const i = INGREDIENTS.find(x => x.id === id); if (!i) return null; return <button key={id} className={'chip lg' + (s.excluded.includes(id) ? ' sel' : '')} onClick={() => up({ excluded: s.excluded.includes(id) ? s.excluded.filter(x => x !== id) : [...s.excluded, id] })}>{i.name.split(' (')[0]}</button> })}</div>
    </div>

    <div className="card stack">
      <h2>Narxlar</h2>
      <p className="small muted">Mo'ljal narxlar (Toshkent, 2026-noyabr). Har xaridda haqiqiy narx kiritsangiz, o'zi o'rganadi. Bu yerda qo'lda ham tuzatish mumkin.</p>
      <input type="search" placeholder="Masalliq qidirish" value={pq} onChange={e => setPq(e.target.value)} />
      <div className="list">{INGREDIENTS.filter(i => !pq || i.name.toLowerCase().includes(pq.toLowerCase()) || i.ru?.toLowerCase().includes(pq.toLowerCase())).slice(0, pq ? 30 : 12).map(i => <div key={i.id} className="item" style={{ padding: '6px 0' }}><div className="grow"><div>{i.name}</div><div className="tiny muted">{i.unit === 'dona' ? '1 dona' : i.unit === 'g' ? '1 kg' : '1 L'}{data.priceOverride[i.id] ? ` · asl ${fmtMoney(i.price)}` : ''}</div></div><input type="number" style={{ width: 120 }} value={refPrice(i.id, ctx)} onChange={e => st.setPriceOverride(i.id, +e.target.value)} /></div>)}</div>
    </div>

    <div className="card stack">
      <h2>Ko'rinish</h2>
      <div className="tabs"><button className={s.theme === 'auto' ? 'on' : ''} onClick={() => up({ theme: 'auto' })}>Avto</button><button className={s.theme === 'light' ? 'on' : ''} onClick={() => up({ theme: 'light' })}>Yorug'</button><button className={s.theme === 'dark' ? 'on' : ''} onClick={() => up({ theme: 'dark' })}>Qorong'i</button></div>
      <label className="row between"><span><b>Katta shrift</b><div className="small muted">oshxona rejimi uchun</div></span><input type="checkbox" checked={s.bigFont} onChange={e => up({ bigFont: e.target.checked })} style={{ width: 22, height: 22 }} /></label>
    </div>

    <div className="card stack">
      <h2>Zaxira nusxa</h2>
      <div className="row"><button className="btn grow" onClick={exportJson}>JSON nusxalash</button><button className="btn grow" onClick={() => { if (st.importData(imp)) st.showToast('Yuklandi'); else st.showToast('Noto\'g\'ri JSON') }} disabled={!imp}>JSON yuklash</button></div>
      <textarea rows={3} placeholder="Import uchun JSON shu yerga" value={imp} onChange={e => setImp(e.target.value)} />
      <button className="btn ghost" style={{ color: 'var(--bad)' }} onClick={() => { if (window.confirm?.('Hamma ma\'lumot o\'chadi (serverdagi emas). Davom etasizmi?') !== false) { useStore.setState({ data: emptyData() }); location.hash = '' } }}>Hammasini tozalash</button>
      <p className="tiny muted">Qozon v1 · {data.myRecipes.length} retsept · {data.lots.length} partiya · {data.logs.length} yozuv</p>
    </div>
  </div>
}
