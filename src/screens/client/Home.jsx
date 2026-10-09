import { MapPin, RotateCcw } from 'lucide-react'
import { CATS, PROS, cat, pro } from '../../data/catalog'
import { firstName, money } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { CategoryTile, ProCard, RoleSwitch } from '../../components/ui'

export function repeatOrder(go, o) {
  go('startFlow', { cat: o.cat, pro: o.pro, step: 2, prefill: { subs: [...o.subs], qty: o.qty, where: o.where } })
}

export default function Home() {
  const { state, go } = useApp()
  const again = state.orders.filter((o) => o.status === 'concluido' && o.pro)
  const near = [...PROS].sort((a, b) => a.km - b.km).slice(0, 4)

  return (
    <div className="screen">
      <header className="top">
        <div>
          <small>Olá, Ana</small>
          <span className="loc"><MapPin size={16} /> Rua das Palmeiras, 120</span>
        </div>
        <RoleSwitch />
      </header>

      <section className="hero">
        <h1>Do que você precisa?</h1>
        <p>Toque no serviço. Profissionais avaliados por perto respondem em minutos.</p>
      </section>

      <div className="catgrid">
        {CATS.map((c) => (
          <CategoryTile key={c.id} c={c} onClick={() => go('startFlow', { cat: c.id, step: 1 })} />
        ))}
      </div>

      {again.length > 0 && (
        <>
          <h2 className="sec">Pedir de novo</h2>
          <div className="hscroll">
            {again.map((o) => {
              const p = pro(o.pro)
              const c = cat(o.cat)
              return (
                <button key={o.id} className="again" onClick={() => repeatOrder(go, o)}>
                  <span className="ic sm"><c.Icon size={18} /></span>
                  <span>
                    <b>{c.nome} {o.subs[0].toLowerCase()}</b>
                    <small>com {firstName(p)}, {money(o.preco)}</small>
                  </span>
                  <RotateCcw size={18} />
                </button>
              )
            })}
          </div>
        </>
      )}

      <h2 className="sec">Perto de você agora</h2>
      <div className="list">{near.map((p) => <ProCard key={p.id} p={p} />)}</div>
    </div>
  )
}
