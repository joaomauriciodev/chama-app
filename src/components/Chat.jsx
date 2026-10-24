import { BadgeDollarSign, FastForward, Handshake, MessageCircle, Send, Star } from 'lucide-react'
import { useState } from 'react'
import { money } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Chip, Stepper } from './ui'

// Chat do match: mensagens livres e propostas de valor. Aceitar a proposta do outro firma o pedido.
export function Conversation({ side, e, quick, who }) {
  const { act } = useApp()
  const c = e.chat
  const [text, setText] = useState('')
  const [val, setVal] = useState(null) // painel de proposta aberto com este valor
  const open = e.status === 'conversa'
  const theirs = c.proposta?.by === 'them'

  const send = (ev) => {
    ev.preventDefault()
    const t = text.trim()
    if (!t) return
    act.send(side, e.id, t)
    setText('')
  }

  return (
    <>
      <div className="chat" aria-live="polite">
        {c.msgs.map((m, i) => (
          <div key={i} className={`msg ${m.by}`}>
            {m.t}
            {m.valor && <b className="mval">{money(m.valor)}</b>}
          </div>
        ))}
      </div>

      {open && (
        <>
          {c.proposta && (theirs ? (
            <div className="deal">
              <span><small>{who} propôs</small><b>{money(c.proposta.valor)}</b></span>
              <button className="btn sm" onClick={() => act.accept(side, e.id)}><Handshake size={16} />Aceitar e firmar</button>
            </div>
          ) : (
            <p className="muted small deal-wait">Aguardando {who} responder sua proposta de {money(c.proposta.valor)}…</p>
          ))}

          {val != null ? (
            <div className="propose">
              <Stepper value={money(val)} step={10} wide onChange={(n) => setVal(Math.max(20, val + n))} labels={['Menos 10 reais', 'Mais 10 reais']} />
              <div className="propose-act">
                <button className="btn ghost sm" onClick={() => setVal(null)}>Cancelar</button>
                <button className="btn sm" onClick={() => { act.propose(side, e.id, val, c.ref); setVal(null) }}>Propor {money(val)}</button>
              </div>
            </div>
          ) : (
            <>
              <div className="qr">
                <button className="chip" onClick={() => setVal(c.proposta?.valor ?? c.ref)}><BadgeDollarSign size={16} />Propor valor</button>
                {quick.map((t) => <button key={t} className="chip" onClick={() => act.send(side, e.id, t)}>{t}</button>)}
              </div>
              <form className="composer" onSubmit={send}>
                <input value={text} onChange={(ev) => setText(ev.target.value)} placeholder="Escreva uma mensagem" maxLength={500} aria-label="Mensagem" />
                <button className="iconbtn" disabled={!text.trim()} aria-label="Enviar"><Send size={18} /></button>
              </form>
            </>
          )}
        </>
      )}
    </>
  )
}

// WhatsApp do prestador, liberado para o cliente depois que o pedido é firmado.
export function WhatsAppCard({ name, tel, message }) {
  const digits = tel.replace(/\D/g, '')
  const shown = digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  return (
    <a className="wa" href={`https://wa.me/55${digits}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
      <span className="ic sm"><MessageCircle size={18} /></span>
      <span className="wa-main"><small>WhatsApp de {name}</small><b>{shown}</b></span>
      <span className="wa-go">Abrir</span>
    </a>
  )
}

export function RateBlock({ side, e, who, tags }) {
  const { go, act } = useApp()
  const c = e.chat

  if (c.myRating) {
    return (
      <p className="muted small">
        Você deu {c.myRating.stars} {c.myRating.stars > 1 ? 'estrelas' : 'estrela'}.{' '}
        {c.theirRated ? `${who} também avaliou.` : `Aguardando ${who} avaliar. Se não avaliar, o pedido fecha sozinho 1 dia depois de firmado.`}
      </p>
    )
  }
  return (
    <>
      <h4>Como foi com {who}?</h4>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={n <= c.draft.stars ? 'on' : ''} onClick={() => go('rStar', { side, id: e.id, n })} aria-label={`${n} estrelas`}><Star size={36} /></button>
        ))}
      </div>
      <div className="chips wrap">
        {tags.map((t) => <Chip key={t} on={c.draft.tags.includes(t)} onClick={() => go('rTag', { side, id: e.id, t })}>{t}</Chip>)}
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={() => act.rate(side, e.id)} disabled={!c.draft.stars}>Enviar avaliação</button>
      </div>
    </>
  )
}

export function SimulateDay({ side, e }) {
  const { go } = useApp()
  return (
    <button className="btn ghost sm sim" onClick={() => go('expire', { side, id: e.id })}><FastForward size={16} />Simular: passou 1 dia</button>
  )
}
