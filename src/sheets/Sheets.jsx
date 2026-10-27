import { Hand, Lock, MapPin, MessageCircle, Radar, RotateCcw, Star, X } from 'lucide-react'
import { CLIENT_TAGS, PRO_QUICK, QUICK_REPLIES, RATING_TAGS, ROOMS, cat } from '../data/catalog'
import { convStatus } from '../lib/deal'
import { firstName, money, size, whenLabel } from '../lib/format'
import { useApi } from '../lib/useApi'
import { useApp } from '../state/AppContext'
import { Avatar, Pill, Rating } from '../components/ui'
import { Conversation, RateBlock, WhatsAppCard } from '../components/Chat'
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

function Loading({ error }) {
  const { go } = useApp()
  return (
    <>
      <SheetHead title={error ? 'Não foi possível carregar' : 'Carregando…'} subtitle={error?.message} />
      {error && <button className="btn ghost" onClick={() => go('closeSheet')}>Fechar</button>}
    </>
  )
}

const STEPS = ['Pedido publicado', 'Conversa', 'Pedido firmado', 'Avaliações']
const STEP_IDX = { aberto: 0, conversa: 1, encerrada: 1, firmado: 2, concluido: 3 }

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

const fullAddress = (e) => [`${e.rua}, ${e.numero}`, e.complemento, `${e.bairro}, ${e.cidade} – ${e.uf}`].filter(Boolean).join(' · ')

/* Perfil público do profissional */
function ProSheet({ id }) {
  const { state, go } = useApp()
  const { data: p, error } = useApi(`/providers/${id}`)
  if (!p) return <Loading error={error} />

  const isMe = state.auth?.id === p.id
  const call = () => {
    const pro = { id: p.id, nome: p.nome, categorias: p.categorias }
    const preferred = state.search.cat && p.categorias.includes(state.search.cat) ? state.search.cat : null
    if (preferred || p.categorias.length === 1) go('startFlow', { cat: preferred || p.categorias[0], pro, step: 1 })
    else go('startFlow', { pro, step: 0, only: p.categorias })
  }

  return (
    <>
      <SheetHead media={<Avatar person={p} large />} title={p.nome} subtitle={`${p.bairro}, ${p.cidade}`} />
      <div className="stats3">
        <div><small>Nota</small><b>{p.avaliacoes ? p.nota.toFixed(1) : '–'}</b></div>
        <div><small>Avaliações</small><b>{p.avaliacoes}</b></div>
        <div><small>No Chama desde</small><b>{new Date(p.desde).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '')}</b></div>
      </div>
      {p.destaques.length > 0 && (
        <>
          <h4>O que os clientes destacam</h4>
          <div className="chips wrap">{p.destaques.map((t) => <span key={t.tag} className="chip">{t.tag} <span className="muted">{t.n}</span></span>)}</div>
        </>
      )}
      <h4>Serviços</h4>
      <div className="chips wrap">
        {p.categorias.map((cid) => { const c = cat(cid); return c && <span key={cid} className="chip"><c.Icon size={16} />{c.nome}</span> })}
      </div>
      <h4>Avaliações recentes</h4>
      {p.avaliacoesRecentes.length ? p.avaliacoesRecentes.map((r, i) => (
        <div key={i} className="review">
          <b>{r.cliente} {Array.from({ length: r.stars }, (_, k) => <Star key={k} size={13} className="st" />)}</b>
          {r.tags.join(', ') || 'Sem comentários'}
        </div>
      )) : <p className="muted small">Ainda sem avaliações.</p>}
      {!isMe && (
        <div style={{ marginTop: 16 }}>
          <button className="btn" onClick={call}><Hand size={18} />Chamar {firstName(p)}</button>
        </div>
      )}
    </>
  )
}

/* Pedido do cliente: profissionais que querem atender e o andamento */
function OrderSheet({ id }) {
  const { go } = useApp()
  const { data: o, error } = useApi(`/orders/${id}`, { poll: 5000 })
  if (!o) return <Loading error={error} />
  const c = cat(o.categoria)
  const firm = o.conversas.find((x) => x.estado === 'firmado' || x.estado === 'concluido')

  return (
    <>
      <SheetHead media={<span className="ic"><c.Icon size={20} /></span>} title={c.nome} subtitle={`${o.subs.join(', ')}, ${size(c, o)}`} />
      <div className="row" style={{ paddingTop: 0 }}>
        <MapPin size={18} /><span className="rl"><b>{whenLabel(o)}</b><small>{fullAddress(o.endereco)}</small></span>
      </div>
      <Timeline status={o.situacao} />

      {o.situacao === 'aberto' && (
        <div className="waiting">
          <span className="ic"><Radar size={20} /></span>
          <span>Avisamos os profissionais da sua região. Quem quiser atender abre uma conversa aqui.</span>
        </div>
      )}

      {o.conversas.length > 0 && (
        <>
          <h4>{firm ? 'Profissional' : `Profissionais interessados (${o.conversas.length})`}</h4>
          <div className="list">
            {(firm ? [firm] : o.conversas).map((cv) => {
              const [label, tone] = convStatus(cv, 'cliente')
              const valor = cv.valor ?? cv.propostaValor
              return (
                <button key={cv.id} className="pcard" onClick={() => go('openConv', cv.id)}>
                  <Avatar person={cv.prestador} />
                  <span className="pmain">
                    <span className="pname">{cv.prestador.nome}</span>
                    <span className="pmeta"><Rating value={cv.prestador.nota} count={cv.prestador.avaliacoes} /></span>
                    <Pill tone={tone} style={{ alignSelf: 'flex-start', marginTop: 4 }}>{label}</Pill>
                  </span>
                  {valor && <span className="pprice"><small>{cv.valor ? 'combinado' : 'proposta'}</small>{money(valor)}</span>}
                </button>
              )
            })}
          </div>
        </>
      )}

      {o.situacao === 'concluido' && firm && (
        <div style={{ marginTop: 14 }}>
          <button className="btn" onClick={() => repeatOrder(go, o, firm.prestador)}><RotateCcw size={18} />Pedir de novo com {firstName(firm.prestador)}</button>
        </div>
      )}
    </>
  )
}

/* Conversa (cliente ou prestador): negociação, WhatsApp liberado e avaliação */
function ConvSheet({ id }) {
  const { go } = useApp()
  const { data: cv, error } = useApi(`/conversations/${id}`, { poll: 3000 })
  if (!cv) return <Loading error={error} />
  const d = cv.pedido
  const c = cat(d.categoria)
  const isClient = cv.papel === 'cliente'
  const who = firstName(cv.outro)
  const firmada = cv.estado === 'firmado' || cv.estado === 'concluido'

  return (
    <>
      <SheetHead media={<span className="ic"><c.Icon size={20} /></span>} title={d.subs.join(', ')} subtitle={`${d.rooms ? '' : size(c, d) + ', '}${whenLabel(d)}`} />

      <div className="row" style={{ paddingTop: 0 }}>
        <Avatar person={cv.outro} />
        <span className="rl">
          <b>{cv.outro.nome}</b>
          {isClient && <small><Rating value={cv.outro.nota} count={cv.outro.avaliacoes} /></small>}
        </span>
        {isClient && <button className="btn ghost sm" style={{ width: 'auto' }} onClick={() => go('openOrder', d.id)}>Ver pedido</button>}
      </div>
      <p className="muted small" style={{ margin: '0 0 6px', display: 'flex', gap: 6 }}>
        <MapPin size={15} />{!isClient && firmada ? fullAddress(d.endereco) : `${d.endereco.bairro}, ${d.endereco.cidade}`}
      </p>
      {d.rooms && <RoomChips rooms={d.rooms} />}

      <Timeline status={cv.estado} from={1} />

      {cv.estado === 'conversa' && (
        <p className="muted small" style={{ margin: '0 0 8px' }}>
          {isClient ? `Combinem o valor aqui. Ao firmar, o WhatsApp de ${who} é liberado.` : `Combine o valor aqui. Ao firmar, ${who} recebe seu WhatsApp.`}
        </p>
      )}
      {cv.estado === 'encerrada' && <div className="banner">O cliente fechou este pedido com outro profissional.</div>}

      {firmada && isClient && cv.outro.telefone && (
        <>
          <h4>Continue pelo WhatsApp</h4>
          <WhatsAppCard name={who} tel={cv.outro.telefone} message={`Oi ${who}! Firmamos pelo Chama o pedido de ${c.nome.toLowerCase()} por ${money(cv.valor)}.`} />
        </>
      )}
      {firmada && !isClient && (
        <div className="banner wa-sent"><MessageCircle size={18} />{who} recebeu seu WhatsApp e vai te chamar por lá. Valor combinado: {money(cv.valor)}.</div>
      )}

      {cv.estado === 'firmado' && <RateBlock conv={cv} who={who} tags={isClient ? RATING_TAGS : CLIENT_TAGS} />}
      {cv.estado === 'concluido' && (
        <p className="muted small">
          {cv.meuRating ? `Você deu ${cv.meuRating.stars} ${cv.meuRating.stars > 1 ? 'estrelas' : 'estrela'}.` : 'Fechado automaticamente 1 dia depois de firmado.'}
          {cv.outroAvaliou ? ` ${who} também avaliou.` : ''}
        </p>
      )}

      <h4>{cv.estado === 'conversa' ? `Conversa com ${who}` : 'Histórico da conversa'}</h4>
      <Conversation conv={cv} quick={isClient ? QUICK_REPLIES : PRO_QUICK} who={who} />
    </>
  )
}

/* Aviso de que o pedido firmado precisa fechar antes de começar outro */
function LockSheet({ id }) {
  const { go } = useApp()
  const { data: cv, error } = useApi(`/conversations/${id}`)
  if (!cv) return <Loading error={error} />
  const who = firstName(cv.outro)
  const isClient = cv.papel === 'cliente'

  return (
    <>
      <SheetHead media={<span className="ic"><Lock size={20} /></span>} title="Termine o pedido anterior" />
      <p style={{ marginTop: 0 }}>
        {isClient ? 'Para fazer um novo pedido' : 'Para abrir uma nova conversa'}, o pedido firmado com {who} precisa ser avaliado por vocês dois.
        Se faltar avaliação, ele fecha sozinho 1 dia depois de firmado.
      </p>
      {cv.meuRating && <p className="muted small">Você já avaliou. Falta {who} avaliar.</p>}
      <button className="btn" onClick={() => go('openConv', id)}>{cv.meuRating ? 'Ver pedido' : `Avaliar ${who}`}</button>
    </>
  )
}

export default function SheetHost() {
  const { state } = useApp()
  const { sheet } = state
  return (
    <Sheet>
      {sheet.type === 'pro' && <ProSheet key={sheet.id} id={sheet.id} />}
      {sheet.type === 'order' && <OrderSheet key={sheet.id} id={sheet.id} />}
      {sheet.type === 'conv' && <ConvSheet key={sheet.id} id={sheet.id} />}
      {sheet.type === 'lock' && <LockSheet key={sheet.id} id={sheet.id} />}
    </Sheet>
  )
}
