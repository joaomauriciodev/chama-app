import { Calendar, MapPin, MapPinned, Megaphone, MessageCircle, Moon, Radar } from 'lucide-react'
import { AREAS, cat } from '../../data/catalog'
import { firstName, money, size, whenLabel } from '../../lib/format'
import { useApi } from '../../lib/useApi'
import { useApp } from '../../state/AppContext'
import { Empty, RoleSwitch } from '../../components/ui'

function DemandCard({ d }) {
  const { act } = useApp()
  const c = cat(d.categoria)
  return (
    <article className="dcard">
      <div className="dtop">
        <span className="ic"><c.Icon size={20} /></span>
        <div><b>{d.subs.join(', ')}</b><small>{c.nome}, {size(c, d)}</small></div>
      </div>
      <div className="dmeta">
        <span><Calendar size={14} />{whenLabel(d)}</span>
        <span><MapPin size={14} />{d.endereco.bairro}</span>
        <span>{d.cliente}</span>
      </div>
      <div className="dact">
        <button className="btn ghost sm" onClick={() => act.hide(d.id)}>Passar</button>
        <button className="btn sm" onClick={() => act.startChat(d.id)}><MessageCircle size={16} />Conversar</button>
      </div>
    </article>
  )
}

export default function Opportunities() {
  const { state, go } = useApp()
  const { prov } = state
  const feed = useApi(prov.registered ? '/provider/feed' : null, { poll: 15000 })
  const convs = useApi(prov.registered ? '/me/conversations' : null).data || []
  const earned = convs.filter((m) => m.estado === 'firmado' || m.estado === 'concluido').reduce((sum, m) => sum + m.valor, 0)
  const talking = convs.filter((m) => m.estado === 'conversa').length
  const list = feed.data || []
  const noPlan = feed.error?.code === 'plano'

  return (
    <div className="screen">
      <header className="top">
        <div>
          <small>Olá, {firstName(prov)}</small>
          <span className="loc"><MapPinned size={16} /> {prov.area === 'cidade' ? prov.base.cidade : `${AREAS.find((a) => a.id === prov.area).nome}: ${prov.base.bairro}`}</span>
        </div>
        <RoleSwitch />
      </header>

      <button className={`online ${prov.online ? 'on' : ''}`} onClick={() => go('toggleOnline')} aria-pressed={prov.online}>
        <span className="dot" />
        <span>
          <b>{prov.online ? 'Recebendo pedidos' : 'Pausado'}</b>
          <small>{prov.online ? 'Você aparece nas buscas da região' : 'Toque para voltar a receber pedidos'}</small>
        </span>
        <span className="sw"><i /></span>
      </button>

      <div className="stats3" style={{ marginTop: 10 }}>
        <div><small>Firmados</small><b>{money(earned)}</b></div>
        <div><small>Conversas</small><b>{talking}</b></div>
        <div><small>Sua nota</small><b>{prov.avaliacoes ? prov.nota.toFixed(1).replace('.', ',') : '–'}</b></div>
      </div>

      <h2 className="sec">Pedidos na sua área {prov.online && feed.data && <span className="n">{list.length}</span>}</h2>

      {noPlan ? (
        <Empty icon={Megaphone} title="Seu plano de divulgação não está ativo">Com o plano ativo você aparece para os clientes e recebe pedidos.</Empty>
      ) : !prov.online ? (
        <Empty icon={Moon} title="Você está pausado">Ative a disponibilidade para ver pedidos.</Empty>
      ) : feed.error ? (
        <p className="muted small">{feed.error.message}</p>
      ) : !feed.data ? (
        <p className="muted small">Carregando…</p>
      ) : list.length ? (
        <div className="list">{list.map((d) => <DemandCard key={d.id} d={d} />)}</div>
      ) : (
        <Empty icon={Radar} title="Nenhum pedido novo por enquanto" action={<button className="btn ghost" onClick={() => go('tab', 'pperfil')}>Ajustar perfil</button>}>
          Os pedidos da sua área aparecem aqui. Amplie a área ou adicione serviços no perfil.
        </Empty>
      )}
    </div>
  )
}
