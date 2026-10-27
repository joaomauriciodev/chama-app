import { BadgeDollarSign, Handshake, MessageCircle, Send, Star } from 'lucide-react'
import { useState } from 'react'
import { maskPhone, money } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Chip } from './ui'

// Chat do match (dados de GET /conversations/:id). Aceitar a proposta do outro lado firma o pedido.
export function Conversation({ conv, quick, who }) {
  const { act } = useApp()
  const [text, setText] = useState('')
  const [val, setVal] = useState(null) // painel de proposta aberto com este valor (texto digitado)
  const [sending, setSending] = useState(false)
  const open = conv.estado === 'conversa'
  const theirs = conv.propostaBy && conv.propostaBy !== conv.papel

  const send = async (ev) => {
    ev.preventDefault()
    const t = text.trim()
    if (!t || sending) return
    setSending(true)
    await act.send(conv.id, t)
    setSending(false)
    setText('')
  }

  return (
    <>
      <div className="chat" aria-live="polite">
        {conv.mensagens.map((m) => (
          <div key={m.id} className={`msg ${m.autor === 'sistema' ? 'sys' : m.autor === conv.papel ? 'me' : 'them'}`}>
            {m.valor ? (m.autor === conv.papel ? 'Minha proposta:' : 'Proposta:') : m.texto}
            {m.valor && <b className="mval">{money(m.valor)}</b>}
          </div>
        ))}
      </div>

      {open && (
        <>
          {conv.propostaValor && (theirs ? (
            <div className="deal">
              <span><small>{who} propôs</small><b>{money(conv.propostaValor)}</b></span>
              <button className="btn sm" onClick={() => act.accept(conv.id, conv.papel)}><Handshake size={16} />Aceitar e firmar</button>
            </div>
          ) : (
            <p className="muted small deal-wait">Aguardando {who} responder sua proposta de {money(conv.propostaValor)}…</p>
          ))}

          {val != null ? (
            <div className="propose">
              <label className="field">
                <small>Valor do serviço (R$)</small>
                <input value={val} onChange={(ev) => setVal(ev.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="Digite o valor" autoFocus aria-label="Valor da proposta em reais" />
              </label>
              <div className="propose-act">
                <button className="btn ghost sm" onClick={() => setVal(null)}>Cancelar</button>
                <button className="btn sm" disabled={!(Number(val) >= 10 && Number(val) <= 100000)} onClick={() => { act.propose(conv.id, Number(val)); setVal(null) }}>
                  {val ? `Propor ${money(Number(val))}` : 'Propor'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="qr">
                <button className="chip" onClick={() => setVal(conv.propostaValor ? String(conv.propostaValor) : '')}><BadgeDollarSign size={16} />Propor valor</button>
                {quick.map((t) => <button key={t} className="chip" onClick={() => act.send(conv.id, t)}>{t}</button>)}
              </div>
              <form className="composer" onSubmit={send}>
                <input value={text} onChange={(ev) => setText(ev.target.value)} placeholder="Escreva uma mensagem" maxLength={1000} aria-label="Mensagem" />
                <button className="iconbtn" disabled={!text.trim() || sending} aria-label="Enviar"><Send size={18} /></button>
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
  return (
    <a className="wa" href={`https://wa.me/55${tel}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
      <span className="ic sm"><MessageCircle size={18} /></span>
      <span className="wa-main"><small>WhatsApp de {name}</small><b>{maskPhone(tel)}</b></span>
      <span className="wa-go">Abrir</span>
    </a>
  )
}

export function RateBlock({ conv, who, tags }) {
  const { act } = useApp()
  const [stars, setStars] = useState(0)
  const [chosen, setChosen] = useState([])
  const [busy, setBusy] = useState(false)

  if (conv.meuRating) {
    return (
      <p className="muted small">
        Você deu {conv.meuRating.stars} {conv.meuRating.stars > 1 ? 'estrelas' : 'estrela'}.{' '}
        {conv.outroAvaliou ? `${who} também avaliou.` : `Aguardando ${who} avaliar. Se não avaliar, o pedido fecha sozinho 1 dia depois de firmado.`}
      </p>
    )
  }
  const toggle = (t) => setChosen((l) => (l.includes(t) ? l.filter((x) => x !== t) : [...l, t]))
  const submit = async () => {
    setBusy(true)
    await act.rate(conv.id, { stars, tags: chosen })
    setBusy(false)
  }
  return (
    <>
      <h4>Como foi com {who}?</h4>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} className={n <= stars ? 'on' : ''} onClick={() => setStars(n)} aria-label={`${n} estrelas`}><Star size={36} /></button>
        ))}
      </div>
      <div className="chips wrap">
        {tags.map((t) => <Chip key={t} on={chosen.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}
      </div>
      <div style={{ marginTop: 16 }}>
        <button className="btn" onClick={submit} disabled={!stars || busy}>Enviar avaliação</button>
      </div>
    </>
  )
}
