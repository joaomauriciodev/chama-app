import { BadgeCheck } from 'lucide-react'
import { AREAS, CATS, SHIFTS, WEEK } from '../../data/catalog'
import { useApp } from '../../state/AppContext'
import { Avatar, CategoryTile } from '../../components/ui'
import CepField from '../../components/CepField'

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

      <h2 className="sec">Onde você atende</h2>
      <div className="card">
        <CepField value={prov.base} onFound={(a) => a && go('provBase', a)} />
        <div className="seg wide" role="group" aria-label="Área de atendimento">
          {AREAS.map((a) => (
            <button key={a.id} className={prov.area === a.id ? 'on' : ''} onClick={() => go('area', a.id)} aria-pressed={prov.area === a.id}>{a.nome}</button>
          ))}
        </div>
        <p className="muted small" style={{ margin: '8px 2px 0' }}>Você recebe pedidos de CEPs dentro dessa área.</p>
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
