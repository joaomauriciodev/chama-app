import { BadgeCheck } from 'lucide-react'
import { CATS, SHIFTS, WEEK } from '../../data/catalog'
import { useApp } from '../../state/AppContext'
import { Avatar, CategoryTile } from '../../components/ui'

export default function ProviderProfile() {
  const { state, go } = useApp()
  const { prov } = state

  return (
    <div className="screen">
      <h1 className="title">Seu perfil</h1>
      <div className="me">
        <Avatar person={{ id: 5, nome: 'Lucas Prado' }} large />
        <div>
          <b>Lucas Prado</b>
          <span className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BadgeCheck size={15} /> Identidade verificada</span>
        </div>
      </div>

      <h2 className="sec">Serviços que você faz</h2>
      <div className="catgrid">
        {CATS.map((c) => (
          <CategoryTile key={c.id} c={c} on={prov.cats.includes(c.id)} checkWhenOn onClick={() => go('toggleProvCat', c.id)} />
        ))}
      </div>

      <h2 className="sec">Até onde você vai</h2>
      <div className="card">
        <div className="rrow"><span>Raio de atendimento</span><b>{prov.radius} km</b></div>
        <input type="range" min="2" max="30" step="1" value={prov.radius} onChange={(e) => go('radius', +e.target.value)} aria-label="Raio em km" />
      </div>

      <h2 className="sec">Quando você trabalha</h2>
      <div className="avail">
        <span />
        {WEEK.map((d) => <span key={d}>{d}</span>)}
        {SHIFTS.map(([k, label]) => [
          <span key={k}>{label}</span>,
          ...WEEK.map((d) => {
            const id = d + k
            const on = !!prov.avail[id]
            return <button key={id} className={on ? 'on' : ''} onClick={() => go('toggleAvail', id)} aria-label={`${d} ${label}`} aria-pressed={on} />
          }),
        ])}
      </div>
      <p className="muted small" style={{ marginTop: 14 }}>Tudo é salvo na hora.</p>
    </div>
  )
}
