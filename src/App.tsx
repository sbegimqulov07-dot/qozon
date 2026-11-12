import { useEffect, useState } from 'react'
import { Icons } from './components/ui'
import { useStore } from './store/store'
import { useUI } from './store/ui'
import Cook from './screens/Cook'
import Onboarding from './screens/Onboarding'
import Pantry from './screens/Pantry'
import RecipeDetail from './screens/RecipeDetail'
import Recipes from './screens/Recipes'
import Reports from './screens/Reports'
import Settings from './screens/Settings'
import Shopping from './screens/Shopping'
import Today from './screens/Today'

const NAV = [
  { id: 'bugun', label: 'Bugun', icon: Icons.today },
  { id: 'retseptlar', label: 'Retseptlar', icon: Icons.recipes },
  { id: 'ombor', label: 'Ombor', icon: Icons.pantry },
  { id: 'bozorlik', label: 'Bozorlik', icon: Icons.shop },
  { id: 'hisobot', label: 'Hisobot', icon: Icons.report },
]

export default function App() {
  const data = useStore(s => s.data)
  const toast = useStore(s => s.toast)
  const sync = useStore(s => s.sync)
  const cook = useUI(s => s.cook)
  const recipe = useUI(s => s.recipe)
  const [hash, setHash] = useState(() => location.hash.replace('#', '') || 'bugun')
  useEffect(() => { const f = () => { setHash(location.hash.replace('#', '') || 'bugun'); window.scrollTo(0, 0) }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f) }, [])
  useEffect(() => {
    const t = data.settings.theme
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t)
    document.body.classList.toggle('big', data.settings.bigFont)
  }, [data.settings.theme, data.settings.bigFont])

  if (!data.onboarded) return <><Onboarding />{toast && <Toast />}</>

  const page = hash === 'retseptlar' ? <Recipes /> : hash === 'ombor' ? <Pantry /> : hash === 'bozorlik' ? <Shopping /> : hash === 'hisobot' ? <Reports /> : hash === 'sozlamalar' ? <Settings /> : <Today />
  return (
    <div className="app">
      <nav className="nav" aria-label="Asosiy">
        <div className="nav-brand brand">🍲 Qozon</div>
        {NAV.map(n => <a key={n.id} href={'#' + n.id} className={hash === n.id ? 'on' : ''}>{n.icon}<span>{n.label}</span></a>)}
        <a href="#sozlamalar" className={hash === 'sozlamalar' ? 'on' : ''}>{Icons.settings}<span>Sozlamalar</span></a>
      </nav>
      <div className="content">
        <header className="topbar"><div className="topbar-in">
          <div className="brand">Qozon</div>
          <div className="row small muted">
            {data.settings.syncCode && <span className="row" title="Sinxron" style={{ gap: 4, color: sync === 'error' ? 'var(--bad)' : sync === 'syncing' ? 'var(--warn)' : 'var(--ok)' }}><span style={{ width: 16, height: 16, display: 'inline-flex' }}>{Icons.sync}</span>{sync === 'syncing' ? '…' : sync === 'error' ? 'xato' : ''}</span>}
            <span>{data.settings.people} kishi</span>
          </div>
        </div></header>
        <main className="main">{page}</main>
      </div>
      {recipe && <RecipeDetail id={recipe} />}
      {cook && <Cook recipeId={cook.recipeId} slot={cook.slot} />}
      {toast && <Toast />}
    </div>
  )
}

function Toast() {
  const toast = useStore(s => s.toast)
  if (!toast) return null
  return <div className="toast" role="status">{toast.msg}{toast.undo && <button onClick={() => { toast.undo?.(); useStore.setState({ toast: null }) }}>Bekor qilish</button>}</div>
}
