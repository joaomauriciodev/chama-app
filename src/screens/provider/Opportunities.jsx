import { Calendar, Image, MapPin, MapPinned, MessageCircle, Mic, Moon, Radar } from 'lucide-react'
import { AREAS, DEMANDS, cat, inArea } from '../../data/catalog'
import { firstName, money, size, whenLabel } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { Empty, RoleSwitch } from '../../components/ui'

function DemandCard({ d }) {
  const { act } = useApp()
  const c = cat(d.cat)
  return (
    <article className="dcard">
      <div className="dtop">
        <span className="ic"><c.Icon size={20} /></span>
        <div><b>{d.subs.join(', ')}</b><small>{c.nome}, {size(c, d)}</small></div>
        <span className="val">
          {money(d.est[0])}<br />
          <small className="muted" style={{ fontFamily: 'var(--body)', fontWeight: 500 }}>até {money(d.est[1])}</small>
        </span>
      </div>
      <div className="dmeta">
        <span><Calendar size={14} />{whenLabel(d)}</span>
        <span><MapPin size={14} />{d.bairro}</span>
        {d.foto && <span><Image size={14} />Com fotos</span>}
        {d.audio && <span><Mic size={14} />Com áudio</span>}
      </div>
      <div className="dact">
        <button className="btn ghost sm" onClick={() => act.pass(d.id)}>Passar</button>
        <button className="btn sm" onClick={() => act.startChat(d.id)}><MessageCircle size={16} />Conversar</button>
      </div>
    </article>
  )
}

export default function Opportunities() {
  const { state, go } = useApp()
  const { prov } = state
  const list = prov.online
    ? DEMANDS.filter((d) => prov.cats.includes(d.cat) && inArea(prov.base, prov.area, d) && !prov.hidden.includes(d.id))
    : []
  const earned = prov.matches.filter((m) => m.status !== 'conversa').reduce((sum, m) => sum + m.chat.valor, 0)
  const talking = prov.matches.filter((m) => m.status === 'conversa').length

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
        <div><small>Sua nota</small><b>4,9</b></div>
      </div>

      <h2 className="sec">Pedidos na sua área {prov.online && <span className="n">{list.length}</span>}</h2>

      {!prov.online ? (
        <Empty icon={Moon} title="Você está pausado">Ative a disponibilidade para ver pedidos.</Empty>
      ) : list.length ? (
        <div className="list">{list.map((d) => <DemandCard key={d.id} d={d} />)}</div>
      ) : (
        <Empty icon={Radar} title="Nenhum pedido novo por enquanto" action={<button className="btn ghost" onClick={() => go('tab', 'pperfil')}>Ajustar perfil</button>}>
          Amplie sua área ou adicione serviços no perfil.
        </Empty>
      )}
    </div>
  )
}
