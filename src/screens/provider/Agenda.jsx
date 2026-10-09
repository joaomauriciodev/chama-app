import { Calendar, CheckCheck, Navigation, Wallet } from 'lucide-react'
import { cat } from '../../data/catalog'
import { money, whenLabel } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { Empty, Pill } from '../../components/ui'

const STATUS = {
  enviada: ['Aguardando cliente', 'wait'],
  aceita: ['Confirmado', 'ok'],
  caminho: ['A caminho', 'ok'],
  feito: ['Concluído', 'done'],
}

export default function Agenda() {
  const { state, act } = useApp()
  const items = state.prov.agenda

  return (
    <div className="screen">
      <h1 className="title">Agenda</h1>
      {items.length ? (
        <div className="list">
          {items.map((a) => {
            const c = cat(a.d.cat)
            const [label, tone] = STATUS[a.status]
            const active = a.status === 'aceita' || a.status === 'caminho'
            return (
              <div key={a.key} className="card">
                <div className="dtop">
                  <span className="ic"><c.Icon size={20} /></span>
                  <div><b>{a.d.subs.join(', ')}</b><small>{whenLabel(a.d)}, {a.d.bairro}</small></div>
                  <Pill tone={tone} style={{ marginLeft: 'auto' }}>{label}</Pill>
                </div>
                <div className="dmeta" style={{ marginBottom: active ? 12 : 0 }}>
                  <span><Wallet size={14} />{money(a.valor)} combinado</span>
                </div>
                {a.status === 'aceita' && (
                  <button className="btn sm" onClick={() => act.agendaStep(a)}><Navigation size={16} />Iniciar trajeto</button>
                )}
                {a.status === 'caminho' && (
                  <button className="btn sm" onClick={() => act.agendaStep(a)}><CheckCheck size={16} />Concluir serviço</button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <Empty icon={Calendar} title="Agenda vazia">Envie propostas para os pedidos perto de você.</Empty>
      )}
    </div>
  )
}
