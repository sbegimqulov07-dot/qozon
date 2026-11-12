import type { Scored } from '../engine/recommend'
import { fmtMoney } from '../engine/units'
import { useUI } from '../store/ui'

export function RecipeCard({ s, hero, onPick, pickLabel, slotLabel }: { s: Scored; hero?: boolean; onPick?: () => void; pickLabel?: string; slotLabel?: string }) {
  const open = useUI(x => x.openRecipe)
  const dot = s.avail.status === 'full' ? 'ok' : s.avail.status === 'almost' ? 'warn' : 'off'
  return (
    <div className={'card' + (hero ? ' hero' : '')}>
      {hero && slotLabel && <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: 4 }}>Tavsiya · {slotLabel}</div>}
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <button className="grow" style={{ textAlign: 'left' }} onClick={() => open(s.recipe.id)}>
          <div className="row" style={{ gap: 8 }}><span className={'dot ' + dot} /><h3 style={{ fontSize: hero ? '1.15rem' : '1rem' }}>{s.recipe.name}</h3></div>
          <div className="small muted num" style={{ marginTop: 2 }}>{s.recipe.time} daq · {fmtMoney(s.cost)} / porsiya · {Math.round(s.kcal)} kcal</div>
        </button>
      </div>
      {(s.reasons.length > 0 || s.warns.length > 0) && <div className="chips" style={{ marginTop: 8 }}>
        {s.reasons.map(r => <span key={r} className="chip ok">{r}</span>)}
        {s.warns.map(w => <span key={w} className={'chip ' + (s.avail.status === 'missing' && w.startsWith('Bozorlik') ? 'bad' : 'warn')}>{w}</span>)}
      </div>}
      {onPick && <div className="row" style={{ marginTop: 10 }}>
        <button className={'btn grow ' + (hero ? 'primary' : '')} onClick={onPick}>{pickLabel ?? 'Pishirish'}</button>
        <button className="btn ghost" onClick={() => open(s.recipe.id)}>Retsept</button>
      </div>}
    </div>
  )
}
