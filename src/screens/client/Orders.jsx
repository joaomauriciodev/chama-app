import { ClipboardList, LogIn } from 'lucide-react'
import { cat } from '../../data/catalog'
import { orderStatus } from '../../lib/deal'
import { whenLabel } from '../../lib/format'
import { useApi } from '../../lib/useApi'
import { useApp } from '../../state/AppContext'
import { Empty, Pill } from '../../components/ui'

export default function Orders() {
  const { state, go } = useApp()
  const { data: orders, error } = useApi(state.auth ? '/me/orders' : null, { poll: 10000 })

  return (
    <div className="screen">
      <h1 className="title">Pedidos</h1>
      {!state.auth ? (
        <Empty icon={LogIn} title="Entre para ver seus pedidos" action={<button className="btn" onClick={() => go('openLogin', 'orders')}>Entrar</button>}>
          Seus pedidos e conversas ficam salvos na sua conta.
        </Empty>
      ) : error ? (
        <p className="muted small">{error.message}</p>
      ) : !orders ? (
        <p className="muted small">Carregando…</p>
      ) : orders.length ? (
        <div className="list">
          {orders.map((o) => {
            const c = cat(o.categoria)
            const [label, tone] = orderStatus(o)
            return (
              <button key={o.id} className="ocard" onClick={() => go('openOrder', o.id)}>
                <span className="ic"><c.Icon size={20} /></span>
                <span className="om">
                  <b>{c.nome}: {o.subs.join(', ').toLowerCase()}</b>
                  <small>{whenLabel(o)}, {o.endereco.bairro}</small>
                </span>
                <Pill tone={tone}>{label}</Pill>
              </button>
            )
          })}
        </div>
      ) : (
        <Empty icon={ClipboardList} title="Nenhum pedido ainda" action={<button className="btn" onClick={() => go('startFlow', { step: 0 })}>Pedir um serviço</button>}>
          Escolha um serviço e os profissionais da sua região são avisados.
        </Empty>
      )}
    </div>
  )
}
