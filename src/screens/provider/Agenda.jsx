import { MessagesSquare } from 'lucide-react'
import { cat } from '../../data/catalog'
import { convStatus } from '../../lib/deal'
import { money, whenLabel } from '../../lib/format'
import { useApi } from '../../lib/useApi'
import { useApp } from '../../state/AppContext'
import { Empty, Pill } from '../../components/ui'

// Conversas do prestador com clientes, da negociação até a avaliação.
export default function Agenda() {
  const { state, go } = useApp()
  const { data: items, error } = useApi(state.prov.registered ? '/me/conversations' : null, { poll: 10000 })

  return (
    <div className="screen">
      <h1 className="title">Conversas</h1>
      {error ? (
        <p className="muted small">{error.message}</p>
      ) : !items ? (
        <p className="muted small">Carregando…</p>
      ) : items.length ? (
        <div className="list">
          {items.map((m) => {
            const c = cat(m.pedido.categoria)
            const [label, tone] = convStatus(m, 'prestador')
            return (
              <button key={m.id} className="ocard" onClick={() => go('openConv', m.id)}>
                <span className="ic"><c.Icon size={20} /></span>
                <span className="om">
                  <b>{m.cliente}: {m.pedido.subs.join(', ').toLowerCase()}</b>
                  <small>{whenLabel(m.pedido)}, {m.pedido.endereco.bairro}{m.valor ? `, ${money(m.valor)}` : ''}</small>
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
