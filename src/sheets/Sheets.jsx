import { Calendar, FastForward, Hand, RotateCcw, Send, Star, X } from 'lucide-react'
import { ADDR, QUICK_REPLIES, RATING_TAGS, REVIEWS, cat, demand, pro } from '../data/catalog'
import { firstName, money, round5, unit, whenLabel } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Avatar, Chip, Stepper } from '../components/ui'
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

/* Detalhe do pedido: status, chat por toques, avaliação */
function OrderSheet({ id }) {
  const { state, go, act } = useApp()
  const o = state.orders.find((x) => x.id === id)
  const c = cat(o.cat)
  const p = o.pro ? pro(o.pro) : null
  const a = ADDR.find((x) => x.id === o.where)
  const steps = ['Pedido publicado', 'Profissional confirmado', 'A caminho', 'Concluído']
  const idx = { buscando: 0, confirmado: 1, caminho: 2, avaliar: 3, concluido: 3 }[o.status]

  return (
    <>
      <SheetHead media={<span className="ic"><c.Icon size={20} /></span>} title={c.nome} subtitle={`${o.subs.join(', ')}, ${unit(c, o.qty)}`} />

      {p ? (
        <button className="pcard" onClick={() => go('openPro', p.id)} style={{ marginBottom: 10 }}>
          <Avatar person={p} />
          <span className="pmain">
            <span className="pname">{p.nome}</span>
            <span className="pmeta"><span><Star size={14} className="st" /> {p.nota.toFixed(1)}</span><span>{whenLabel(o)}</span></span>
          </span>
          <span className="pprice">{money(o.preco)}</span>
        </button>
      ) : (
        <div className="row" style={{ paddingTop: 0 }}>
          <Calendar size={18} /><span className="rl"><b>{whenLabel(o)}</b><small>{a.nome}</small></span>
        </div>
      )}

      <ol className="tl">{steps.map((s, i) => <li key={s} className={i <= idx ? 'done' : ''}>{s}</li>)}</ol>

      {o.status === 'buscando' && (
        <button className="btn" onClick={() => go('seeOffers', o.id)}>Ver {o.offers.length} propostas</button>
      )}

      {(o.status === 'confirmado' || o.status === 'caminho') && (
        <>
          <h4>Mensagens</h4>
          <div className="chat">{o.msgs.map((m, i) => <div key={i} className={`msg ${m.me ? 'me' : ''}`}>{m.t}</div>)}</div>
          <div className="qr">{QUICK_REPLIES.map((t) => <button key={t} className="chip" onClick={() => act.quickReply(o.id, t)}>{t}</button>)}</div>
          <div style={{ marginTop: 14 }}>
            <button className="btn ghost" onClick={() => go('advance', o.id)}>
              <FastForward size={18} />{o.status === 'confirmado' ? 'Simular: profissional saiu' : 'Simular: serviço concluído'}
            </button>
          </div>
        </>
      )}

      {o.status === 'avaliar' && (
        <>
          <h4>Como foi com {firstName(p)}?</h4>
          <div className="stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={n <= o.rt.stars ? 'on' : ''} onClick={() => go('star', n)} aria-label={`${n} estrelas`}><Star size={36} /></button>
            ))}
          </div>
          <div className="chips wrap">
            {RATING_TAGS.map((t) => <Chip key={t} on={o.rt.tags.includes(t)} onClick={() => go('rtag', t)}>{t}</Chip>)}
          </div>
          <div style={{ marginTop: 16 }}>
            <button className="btn" onClick={act.rate} disabled={!o.rt.stars}>Enviar avaliação</button>
          </div>
        </>
      )}

      {o.status === 'concluido' && p && (
        <>
          <p className="muted small">
            Você deu {o.rt.stars} estrelas{o.rt.tags.length ? ` e destacou: ${o.rt.tags.join(', ').toLowerCase()}` : ''}.
          </p>
          <button className="btn" onClick={() => repeatOrder(go, o)}><RotateCcw size={18} />Pedir de novo com {firstName(p)}</button>
        </>
      )}
    </>
  )
}

/* Prestador escolhe o valor da proposta com toques */
function ProposalSheet({ id, val }) {
  const { go, act } = useApp()
  const d = demand(id)
  const c = cat(d.cat)
  const mid = round5((d.est[0] + d.est[1]) / 2)
  const options = [[d.est[0], 'menor'], [mid, 'média'], [d.est[1], 'maior']]

  return (
    <>
      <SheetHead media={<span className="ic"><c.Icon size={20} /></span>} title={d.subs.join(', ')} subtitle={`${unit(c, d.qty)}, ${whenLabel(d)}, ${d.bairro}`} />
      <h4>Seu valor</h4>
      <div className="chips wrap">
        {options.map(([v, label]) => (
          <Chip key={label} on={val === v} onClick={() => go('pval', v)}>{money(v)}<span style={{ opacity: 0.7, fontWeight: 500 }}>{label}</span></Chip>
        ))}
      </div>
      <h4>Ajuste fino</h4>
      <Stepper value={money(val)} step={10} wide onChange={(n) => go('pstep', n)} labels={['Menos 10 reais', 'Mais 10 reais']} />
      <p className="muted small" style={{ marginTop: 14 }}>
        Você confirma o horário pedido pelo cliente. O pagamento é combinado direto com ele, o app não intermedeia.
      </p>
      <button className="btn" onClick={act.sendProposal}><Send size={18} />Enviar proposta de {money(val)}</button>
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
      {sheet.type === 'prop' && <ProposalSheet id={sheet.id} val={sheet.val} />}
    </Sheet>
  )
}
