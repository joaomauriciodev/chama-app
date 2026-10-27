import { Check, MapPin, Minus, Plus, Star } from 'lucide-react'
import { AREAS, AVATAR_COLORS, SHIFTS, WEEK, cat } from '../data/catalog'
import { initials } from '../lib/format'
import { useApp } from '../state/AppContext'

// Cor estável por pessoa (ids da API são uuid).
const colorOf = (id) => AVATAR_COLORS[[...String(id)].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7) % AVATAR_COLORS.length]

export function Avatar({ person, large }) {
  return (
    <span className={`av ${large ? 'lg' : ''}`} style={{ background: colorOf(person.id ?? person.nome) }}>
      {initials(person)}
    </span>
  )
}

export function Rating({ value, count }) {
  if (!count) return <span className="novo">Novo no Chama</span>
  return (
    <span>
      <Star size={14} className="st" /> {value.toFixed(1)}
      <em> ({count})</em>
    </span>
  )
}

export function ProCard({ p }) {
  const { go } = useApp()
  return (
    <button className="pcard" onClick={() => go('openPro', p.id)}>
      <Avatar person={p} />
      <span className="pmain">
        <span className="pname">{p.nome}</span>
        <span className="pmeta">
          <Rating value={p.nota} count={p.avaliacoes} />
          <span><MapPin size={14} /> {p.bairro}</span>
        </span>
        <span className="pcats">{p.categorias.map((id) => cat(id)?.nome).filter(Boolean).join(', ')}</span>
      </span>
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

export function AreaPicker({ value, onChange }) {
  return (
    <>
      <div className="seg wide" role="group" aria-label="Área de atendimento">
        {AREAS.map((a) => (
          <button key={a.id} className={value === a.id ? 'on' : ''} onClick={() => onChange(a.id)} aria-pressed={value === a.id}>{a.nome}</button>
        ))}
      </div>
      <p className="muted small" style={{ margin: '8px 2px 0' }}>Você recebe pedidos de CEPs dentro dessa área.</p>
    </>
  )
}

export function AvailGrid({ avail, onToggle }) {
  return (
    <div className="avail">
      <span />
      {WEEK.map((d) => <span key={d}>{d}</span>)}
      {SHIFTS.map(([k, label]) => [
        <span key={k}>{label}</span>,
        ...WEEK.map((d) => {
          const id = d + k
          const on = !!avail[id]
          return <button key={id} className={on ? 'on' : ''} onClick={() => onToggle(id)} aria-label={`${d} ${label}`} aria-pressed={on} />
        }),
      ])}
    </div>
  )
}
