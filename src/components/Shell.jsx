import {
  Calendar, CalendarCheck, Check, ClipboardList, EyeOff, House, PartyPopper, Radar, Search, Send, User, UserCog, Wallet, Bell,
} from 'lucide-react'
import { useEffect } from 'react'
import { useApp } from '../state/AppContext'

const CLIENT_TABS = [['inicio', House, 'Início'], ['buscar', Search, 'Buscar'], ['pedidos', ClipboardList, 'Pedidos'], ['perfil', User, 'Perfil']]
const PROVIDER_TABS = [['opps', Radar, 'Pedidos'], ['agenda', CalendarCheck, 'Agenda'], ['pperfil', UserCog, 'Perfil']]

export function TabBar() {
  const { state, go } = useApp()
  const isClient = state.role === 'cliente'
  const tabs = isClient ? CLIENT_TABS : PROVIDER_TABS
  const badge = isClient
    ? state.orders.filter((o) => ['buscando', 'avaliar'].includes(o.status)).length
    : state.prov.agenda.filter((a) => a.status === 'aceita').length
  const badgeTab = isClient ? 'pedidos' : 'agenda'

  return (
    <nav className="tabbar">
      {tabs.map(([key, Icon, label]) => (
        <button key={key} className={state.tab === key ? 'on' : ''} onClick={() => go('tab', key)} aria-current={state.tab === key ? 'page' : undefined}>
          <span className="tic"><Icon size={22} /></span>
          {label}
          {key === badgeTab && badge > 0 && <span className="badge">{badge}</span>}
        </button>
      ))}
    </nav>
  )
}

const TOAST_ICONS = { check: Check, bell: Bell, send: Send, 'eye-off': EyeOff, party: PartyPopper, wallet: Wallet, calendar: Calendar }

export function Toast() {
  const { toastMsg } = useApp()
  if (!toastMsg) return <div id="toast" aria-live="polite" />
  const Icon = TOAST_ICONS[toastMsg.icon] || Check
  return (
    <div id="toast" aria-live="polite">
      <div key={toastMsg.key}><Icon size={18} />{toastMsg.text}</div>
    </div>
  )
}

// Fundo escurecido + painel que sobe de baixo.
export function Sheet({ children }) {
  const { go } = useApp()
  return (
    <div className="scrim" onClick={(e) => e.target === e.currentTarget && go('closeSheet')}>
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="handle" />
        {children}
      </div>
    </div>
  )
}

export function useEscape() {
  const { state, go } = useApp()
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (state.sheet) go('closeSheet')
      else if (state.flow) go('closeFlow')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.sheet, state.flow, go])
}
