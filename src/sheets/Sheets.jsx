import { Calendar, Hand, Lock, MessageCircle, RotateCcw, Star, X } from 'lucide-react'
import { CLIENT_TAGS, PRO_QUICK, QUICK_REPLIES, RATING_TAGS, REVIEWS, ROOMS, cat, place, pro } from '../data/catalog'
import { firstName, money, size, whenLabel } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Avatar } from '../components/ui'
import { Conversation, RateBlock, SimulateDay, WhatsAppCard } from '../components/Chat'
import { Sheet } from '../components/Shell'
import { repeatOrder } from '../screens/client/Home'

function SheetHead({ media, title, subtitle }) {
  const { go } = useApp()
  return (
    <div className="sh-head">
      {media}
      <div><h3>{title}</h3>{subtitle && <p className="muted">{subtitle}</p>}</div>
      <button className="iconbtn" onClick={() => go('closeSheet')} aria-label="Fechar"><X size={20} /></button>
    </div>
  )
}

function Stars({ n = 5, size = 13 }) {
  return Array.from({ length: n }, (_, i) => <Star key={i} size={size} className="st" />)
}

/* Perfil do prestador, aberto pela busca ou pela home */
function ProSheet({ id }) {
  const { state, go } = useApp()
  const p = pro(id)
  const reviews = [REVIEWS[p.id % 4], REVIEWS[(p.id + 1) % 4]]
  const tags = RATING_TAGS.slice(p.id % 2, (p.id % 2) + 3)

  const call = () => {
    const preferred = state.search.cat && p.cats.includes(state.search.cat) ? state.search.cat : null
    if (preferred || p.cats.length === 1) go('startFlow', { cat: preferred || p.cats[0], pro: p.id, step: 1 })
    else go('startFlow', { pro: p.id, step: 0, only: p.cats })
  }

  return (
    <>
      <SheetHead media={<Avatar person={p} large />} title={p.nome} subtitle={p.ver ? 'Identidade e antecedentes verificados' : 'Verificação em andamento'} />
      <div className="stats3">
        <div><small>Nota</small><b>{p.nota.toFixed(1)}</b></div>
        <div><small>Serviços</small><b>{p.qtd}</b></div>
        <div><small>Responde em</small><b>{p.resp}</b></div>
      </div>
      <h4>O que os clientes destacam</h4>
      <div className="chips wrap">
        {tags.map((t, i) => <span key={t} className="chip">{t} <span className="muted">{Math.round(p.qtd * (0.6 - i * 0.15))}</span></span>)}
      </div>
      <h4>Serviços</h4>
      <div className="chips wrap">
        {p.cats.map((cid) => { const c = cat(cid); return <span key={cid} className="chip"><c.Icon size={16} />{c.nome}</span> })}
      </div>
      <h4>Avaliações recentes</h4>
      {reviews.map(([name, text]) => (
        <div key={name} className="review"><b>{name} <Stars /></b>{text}</div>
      ))}
      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={call}><Hand size={18} />Chamar {firstName(p)}</button>
      </div>
    </>
  )
}

const STEPS = ['Pedido publicado', 'Conversa', 'Pedido firmado', 'Avaliações']
const STEP_IDX = { buscando: 0, conversa: 1, firmado: 2, concluido: 3 }

function Timeline({ status, from = 0 }) {
  const idx = STEP_IDX[status]
  return <ol className="tl">{STEPS.slice(from).map((st, i) => <li key={st} className={i + from <= idx ? 'done' : ''}>{st}</li>)}</ol>
}

function RoomChips({ rooms }) {
  return (
    <>
      <h4>Imóvel</h4>
      <div className="chips wrap">
        {ROOMS.filter((r) => rooms[r.id]).map((r) => <span key={r.id} className="chip">{rooms[r.id]} {rooms[r.id] > 1 ? r.varios : r.um}</span>)}
      </div>
    </>
  )
}

function Closed({ e, who }) {
  const c = e.chat
  return (
    <p className="muted small">
      {c.myRating
        ? `Você deu ${c.myRating.stars} ${c.myRating.stars > 1 ? 'estrelas' : 'estrela'}${c.myRating.tags.length ? ` e destacou: ${c.myRating.tags.join(', ').toLowerCase()}` : ''}.`
        : 'Fechado automaticamente após 1 dia sem sua avaliação.'}
      {c.theirRated ? ` ${who} também avaliou.` : ''}
    </p>
  )
}

/* Pedido do cliente: propostas, conversa com o profissional, WhatsApp e avaliação */
function OrderSheet({ id }) {
  const { state, go } = useApp()
  const o = state.orders.find((x) => x.id === id)
  const c = cat(o.cat)
  const p = o.pro ? pro(o.pro) : null
  const a = place(o)
  const valor = o.chat?.valor ?? o.chat?.proposta?.valor

  return (
    <>
      <SheetHead media={<span className="ic"><c.Icon size={20} /></span>} title={c.nome} subtitle={`${o.subs.join(', ')}, ${size(c, o)}`} />

      {p ? (
        <button className="pcard" onClick={() => go('openPro', p.id)} style={{ marginBottom: 10 }}>
          <Avatar person={p} />
          <span className="pmain">
            <span className="pname">{p.nome}</span>
            <span className="pmeta"><span><Star size={14} className="st" /> {p.nota.toFixed(1)}</span><span>{whenLabel(o)}</span></span>
          </span>
          {valor && <span className="pprice"><small>{o.chat.valor ? 'combinado' : 'proposta'}</small>{money(valor)}</span>}
        </button>
      ) : (
        <div className="row" style={{ paddingTop: 0 }}>
          <Calendar size={18} /><span className="rl"><b>{whenLabel(o)}</b><small>{a.nome}</small></span>
        </div>
      )}

      <Timeline status={o.status} />

      {o.status === 'buscando' && (
        <button className="btn" onClick={() => go('seeOffers', o.id)}>Ver {o.offers.length} propostas</button>
      )}

      {o.status === 'conversa' && (
        <>
          <h4>Conversa com {firstName(p)}</h4>
          <p className="muted small" style={{ margin: '0 0 8px' }}>Combinem o valor aqui. Quando os dois firmarem, o WhatsApp de {firstName(p)} é liberado.</p>
          <Conversation side="cliente" e={o} quick={QUICK_REPLIES} who={firstName(p)} />
        </>
      )}

      {(o.status === 'firmado' || o.status === 'concluido') && p && (
        <>
          <h4>Continue pelo WhatsApp</h4>
          <WhatsAppCard name={firstName(p)} tel={p.tel} message={`Oi ${firstName(p)}! Sou a Ana, do Chama. Firmamos o pedido de ${c.nome.toLowerCase()} por ${money(o.chat.valor)}.`} />
        </>
      )}

      {o.status === 'firmado' && (
        <>
          <RateBlock side="cliente" e={o} who={firstName(p)} tags={RATING_TAGS} />
          <SimulateDay side="cliente" e={o} />
        </>
      )}

      {o.status === 'concluido' && p && (
        <>
          <Closed e={o} who={firstName(p)} />
          <button className="btn" onClick={() => repeatOrder(go, o)}><RotateCcw size={18} />Pedir de novo com {firstName(p)}</button>
        </>
      )}

      {(o.status === 'firmado' || o.status === 'concluido') && o.chat.msgs.length > 0 && (
        <>
          <h4>Histórico da conversa</h4>
          <Conversation side="cliente" e={o} quick={[]} who={firstName(p)} />
        </>
      )}
    </>
  )
}

/* Conversa do prestador com o cliente de um pedido */
function MatchSheet({ id }) {
  const { state } = useApp()
  const m = state.prov.matches.find((x) => x.id === id)
  const d = m.d
  const c = cat(d.cat)

  return (
    <>
      <SheetHead media={<span className="ic"><c.Icon size={20} /></span>} title={d.subs.join(', ')} subtitle={`${d.rooms ? '' : size(c, d) + ', '}${whenLabel(d)}, ${d.bairro}`} />
      <div className="row" style={{ paddingTop: 0 }}>
        <Avatar person={{ id: d.cliente.length, nome: d.cliente }} />
        <span className="rl"><b>{d.cliente}</b><small>Estimativa da região: {money(d.est[0])} a {money(d.est[1])}</small></span>
      </div>
      {d.rooms && <RoomChips rooms={d.rooms} />}

      <Timeline status={m.status} from={1} />

      {m.status === 'conversa' && (
        <>
          <h4>Conversa com {d.cliente}</h4>
          <p className="muted small" style={{ margin: '0 0 8px' }}>Combine o valor aqui. Quando os dois firmarem, {d.cliente} recebe seu WhatsApp.</p>
          <Conversation side="prestador" e={m} quick={PRO_QUICK} who={d.cliente} />
        </>
      )}

      {(m.status === 'firmado' || m.status === 'concluido') && (
        <div className="banner wa-sent"><MessageCircle size={18} />{d.cliente} recebeu seu WhatsApp e vai te chamar por lá. Valor combinado: {money(m.chat.valor)}.</div>
      )}

      {m.status === 'firmado' && (
        <>
          <RateBlock side="prestador" e={m} who={d.cliente} tags={CLIENT_TAGS} />
          <SimulateDay side="prestador" e={m} />
        </>
      )}

      {m.status === 'concluido' && <Closed e={m} who={d.cliente} />}

      {m.status !== 'conversa' && (
        <>
          <h4>Histórico da conversa</h4>
          <Conversation side="prestador" e={m} quick={[]} who={d.cliente} />
        </>
      )}
    </>
  )
}

/* Aviso de que o pedido anterior precisa fechar antes de começar outro */
function LockSheet({ side, id }) {
  const { state, go } = useApp()
  const isClient = side === 'cliente'
  const e = (isClient ? state.orders : state.prov.matches).find((x) => x.id === id)
  const who = isClient ? firstName(pro(e.pro)) : e.d.cliente
  const rated = !!e.chat.myRating

  return (
    <>
      <SheetHead media={<span className="ic"><Lock size={20} /></span>} title="Termine o pedido anterior" />
      <p style={{ marginTop: 0 }}>
        {isClient ? 'Para fazer um novo pedido' : 'Para abrir uma nova conversa'}, o pedido firmado com {who} precisa ser avaliado por vocês dois.
        Se faltar avaliação, ele fecha sozinho 1 dia depois de firmado.
      </p>
      {rated && <p className="muted small">Você já avaliou. Falta {who} avaliar.</p>}
      <button className="btn" onClick={() => go(isClient ? 'openOrder' : 'openMatch', id)}>{rated ? 'Ver pedido' : `Avaliar ${who}`}</button>
    </>
  )
}

export default function SheetHost() {
  const { state } = useApp()
  const { sheet } = state
  return (
    <Sheet>
      {sheet.type === 'pro' && <ProSheet id={sheet.id} />}
      {sheet.type === 'order' && <OrderSheet id={sheet.id} />}
      {sheet.type === 'match' && <MatchSheet id={sheet.id} />}
      {sheet.type === 'lock' && <LockSheet side={sheet.side} id={sheet.id} />}
    </Sheet>
  )
}
