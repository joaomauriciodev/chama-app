import { BadgeCheck, Clock, MapPin, MessageCircle, X } from 'lucide-react'
import { cat, pro } from '../data/catalog'
import { firstName, money } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Avatar, Rating } from '../components/ui'

export default function MatchOverlay() {
  const { state, go, act } = useApp()
  const o = state.orders.find((x) => x.id === state.match.id)
  const c = cat(o.cat)

  if (state.match.phase === 'busca') {
    return (
      <div className="overlay">
        <div className="match-c">
          <div className="radar"><span /><span /><span /><b><c.Icon size={32} /></b></div>
          <h2>Avisando {o.offers.length + 5} profissionais da sua região</h2>
          <p className="muted">As propostas aparecem aqui. Você escolhe a melhor.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="overlay">
      <div className="ohead">
        <span style={{ width: 42 }} />
        <span className="lbl">{c.nome}: {o.subs.join(', ').toLowerCase()}</span>
        <button className="iconbtn" onClick={act.closeMatch} aria-label="Fechar"><X size={20} /></button>
      </div>
      <div className="obody">
        <h2 className="q">{o.offers.length} propostas chegaram</h2>
        <p className="hint">Escolha com quem conversar. Vocês combinam o valor no chat e, ao firmar, o WhatsApp é liberado.</p>
        <div className="list">
          {o.offers.map((f) => {
            const p = pro(f.pid)
            return (
              <div key={p.id} className="offer">
                <div className="top1">
                  <Avatar person={p} />
                  <div>
                    <div className="pname">
                      {p.nome}{p.ver && <BadgeCheck size={16} />}
                      {o.pro === p.id && <span className="tag">Você chamou</span>}
                    </div>
                    <div className="pmeta"><Rating value={p.nota} count={p.qtd} /><span><MapPin size={14} /> {p.bairro}</span></div>
                  </div>
                  <div className="price"><small>proposta inicial</small>{money(f.preco)}</div>
                </div>
                <div className="arr"><Clock size={15} />{f.chega}</div>
                <button className="btn sm" onClick={() => go('chooseOffer', p.id)}><MessageCircle size={16} />Conversar com {firstName(p)}</button>
              </div>
            )
          })}
        </div>
        <button className="btn ghost" style={{ marginTop: 12 }} onClick={act.closeMatch}>Esperar mais propostas</button>
      </div>
    </div>
  )
}
