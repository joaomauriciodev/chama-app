import { BadgeCheck, Check, MapPin, Minus, Plus, Star } from 'lucide-react'
import { AVATAR_COLORS, cat } from '../data/catalog'
import { initials, km, money } from '../lib/format'
import { useApp } from '../state/AppContext'

export function Avatar({ person, large }) {
  return (
    <span className={`av ${large ? 'lg' : ''}`} style={{ background: AVATAR_COLORS[person.id % AVATAR_COLORS.length] }}>
      {initials(person)}
    </span>
  )
}

export function Rating({ value, count }) {
  return (
    <span>
      <Star size={14} className="st" /> {value.toFixed(1)}
      {count != null && <em> ({count})</em>}
    </span>
  )
}

export function ProCard({ p }) {
  const { go } = useApp()
  return (
    <button className="pcard" onClick={() => go('openPro', p.id)}>
      <Avatar person={p} />
      <span className="pmain">
        <span className="pname">{p.nome}{p.ver && <BadgeCheck size={16} />}</span>
        <span className="pmeta">
          <Rating value={p.nota} count={p.qtd} />
          <span><MapPin size={14} /> {km(p.km)}</span>
        </span>
        <span className="pcats">{p.cats.map((id) => cat(id).nome).join(', ')}</span>
      </span>
      <span className="pprice"><small>a partir de</small>{money(p.desde)}</span>
    </button>
  )
}

export function Chip({ on, onClick, children, icon: Icon, showCheck }) {
  return (
    <button className={`chip ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      {showCheck && on ? <Check size={16} /> : Icon ? <Icon size={16} /> : null}
      {children}
    </button>
  )
}

export function CategoryTile({ c, on, onClick, checkWhenOn }) {
  const Icon = checkWhenOn && on ? Check : c.Icon
  return (
    <button className={`cat ${on ? 'on' : ''}`} onClick={onClick} aria-pressed={on}>
      <span className="ic"><Icon size={22} /></span>
      {c.nome}
    </button>
  )
}

export function Stepper({ value, onChange, step = 1, wide, labels = ['Menos', 'Mais'] }) {
  return (
    <div className="stepper">
      <button onClick={() => onChange(-step)} aria-label={labels[0]}><Minus size={20} /></button>
      <output style={wide ? { minWidth: 110 } : undefined}>{value}</output>
      <button onClick={() => onChange(step)} aria-label={labels[1]}><Plus size={20} /></button>
    </div>
  )
}

export function Empty({ icon: Icon, title, children, action }) {
  return (
    <div className="empty">
      <span className="ic"><Icon size={26} /></span>
      <b>{title}</b>
      {children}
      {action}
    </div>
  )
}

export function RoleSwitch() {
  const { state, go } = useApp()
  return (
    <div className="seg" role="group" aria-label="Modo">
      <button className={state.role === 'cliente' ? 'on' : ''} onClick={() => go('role', 'cliente')}>Contratar</button>
      <button className={state.role === 'prestador' ? 'on' : ''} onClick={() => go('role', 'prestador')}>Trabalhar</button>
    </div>
  )
}

export function Pill({ tone, children, style }) {
  return <span className={`pill ${tone}`} style={style}>{children}</span>
}
