import { BadgeCheck, Clock, MapPin, X } from 'lucide-react'
import { cat, pro } from '../data/catalog'
import { firstName, km, money } from '../lib/format'
import { useApp } from '../state/AppContext'
import { Avatar, Rating } from '../components/ui'

export default function MatchOverlay() {
  const { state, act } = useApp()
  const o = state.orders.find((x) => x.id === state.match.id)
  const c = cat(o.cat)

  if (state.match.phase === 'busca') {
    return (
      <div className="overlay">
        <div className="match-c">
          <div className="radar"><span /><span /><span /><b><c.Icon size={32} /></b></div>
          <h2>Avisando {o.offers.length + 5} profissionais perto de você</h2>
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
        <p className="hint">Compare e toque em escolher. O pagamento é combinado direto com o profissional.</p>
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
                    <div className="pmeta"><Rating value={p.nota} count={p.qtd} /><span><MapPin size={14} /> {km(p.km)}</span></div>
                  </div>
                  <div className="price"><small>proposta</small>{money(f.preco)}</div>
                </div>
                <div className="arr"><Clock size={15} />{f.chega}</div>
                <button className="btn sm" onClick={() => act.choose(p.id)}>Escolher {firstName(p)}</button>
              </div>
            )
          })}
        </div>
        <button className="btn ghost" style={{ marginTop: 12 }} onClick={act.closeMatch}>Esperar mais propostas</button>
      </div>
    </div>
  )
}
