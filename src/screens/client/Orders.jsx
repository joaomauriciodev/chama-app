import { ClipboardList } from 'lucide-react'
import { cat } from '../../data/catalog'
import { whenLabel } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { Empty, Pill } from '../../components/ui'

export const ORDER_STATUS = {
  buscando: ['Recebendo propostas', 'wait'],
  confirmado: ['Confirmado', 'ok'],
  caminho: ['A caminho', 'ok'],
  avaliar: ['Avaliar', 'acc'],
  concluido: ['Concluído', 'done'],
}

export default function Orders() {
  const { state, go } = useApp()

  return (
    <div className="screen">
      <h1 className="title">Pedidos</h1>
      {state.orders.length ? (
        <div className="list">
          {state.orders.map((o) => {
            const c = cat(o.cat)
            const [label, tone] = ORDER_STATUS[o.status]
            return (
              <button key={o.id} className="ocard" onClick={() => go('openOrder', o.id)}>
                <span className="ic"><c.Icon size={20} /></span>
                <span className="om">
                  <b>{c.nome}: {o.subs.join(', ').toLowerCase()}</b>
                  <small>{whenLabel(o)}</small>
                </span>
                <Pill tone={tone}>{label}</Pill>
              </button>
            )
          })}
        </div>
      ) : (
        <Empty icon={ClipboardList} title="Nenhum pedido ainda" action={<button className="btn" onClick={() => go('startFlow', { step: 0 })}>Pedir um serviço</button>}>
          Escolha um serviço e receba propostas em minutos.
        </Empty>
      )}
    </div>
  )
}
