import { MessagesSquare } from 'lucide-react'
import { cat } from '../../data/catalog'
import { dealStatus } from '../../lib/deal'
import { money, whenLabel } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { Empty, Pill } from '../../components/ui'

// Conversas do prestador com clientes, da negociação até a avaliação.
export default function Agenda() {
  const { state, go } = useApp()
  const items = state.prov.matches

  return (
    <div className="screen">
      <h1 className="title">Conversas</h1>
      {items.length ? (
        <div className="list">
          {items.map((m) => {
            const c = cat(m.d.cat)
            const [label, tone] = dealStatus(m)
            return (
              <button key={m.id} className="ocard" onClick={() => go('openMatch', m.id)}>
                <span className="ic"><c.Icon size={20} /></span>
                <span className="om">
                  <b>{m.d.cliente}: {m.d.subs.join(', ').toLowerCase()}</b>
                  <small>{whenLabel(m.d)}, {m.d.bairro}{m.chat.valor ? `, ${money(m.chat.valor)}` : ''}</small>
                </span>
                <Pill tone={tone}>{label}</Pill>
              </button>
            )
          })}
        </div>
      ) : (
        <Empty icon={MessagesSquare} title="Nenhuma conversa ainda">Toque em Conversar num pedido da sua área.</Empty>
      )}
    </div>
  )
}
