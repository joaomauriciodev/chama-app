import { RotateCcw, UserRoundSearch } from 'lucide-react'
import { CATS, cat } from '../../data/catalog'
import { firstName, money } from '../../lib/format'
import { useApi } from '../../lib/useApi'
import { useApp } from '../../state/AppContext'
import { CategoryTile, Empty, ProCard, RoleSwitch } from '../../components/ui'

// Repete um pedido concluído direto com o mesmo profissional, pulando para a data.
export function repeatOrder(go, o, prestador) {
  const { cep, rua, bairro, cidade, uf, numero, complemento } = o.endereco
  go('startFlow', {
    cat: o.categoria,
    pro: { id: prestador.id, nome: prestador.nome },
    step: 2,
    prefill: { subs: [...o.subs], qty: o.qty, rooms: o.rooms, moveis: o.moveis, addr: { cep, rua, bairro, cidade, uf, numero, complemento } },
  })
}

export default function Home() {
  const { state, go } = useApp()
  const top = useApi('/providers?sort=nota&limit=5')
  const mine = useApi(state.auth ? '/me/orders' : null)
  const again = (mine.data || [])
    .filter((o) => o.situacao === 'concluido')
    .map((o) => ({ o, f: o.conversas.find((c) => c.estado === 'concluido') }))
    .filter((x) => x.f)
    .slice(0, 5)

  return (
    <div className="screen">
      <header className="top">
        <div>
          <small>{state.auth ? `Olá, ${firstName(state.auth)}` : 'Olá!'}</small>
          <span className="loc">Do que você precisa?</span>
        </div>
        <RoleSwitch />
      </header>

      <section className="hero">
        <h1>Chame um profissional</h1>
        <p>Toque no serviço. Profissionais da sua região conversam com você e combinam o valor.</p>
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
            {again.map(({ o, f }) => {
              const c = cat(o.categoria)
              return (
                <button key={o.id} className="again" onClick={() => repeatOrder(go, o, f.prestador)}>
                  <span className="ic sm"><c.Icon size={18} /></span>
                  <span>
                    <b>{c.nome} {o.subs[0].toLowerCase()}</b>
                    <small>com {firstName(f.prestador)}, {money(f.valor)}</small>
                  </span>
                  <RotateCcw size={18} />
                </button>
              )
            })}
          </div>
        </>
      )}

      <h2 className="sec">Bem avaliados</h2>
      {top.data?.length ? (
        <div className="list">{top.data.map((p) => <ProCard key={p.id} p={p} />)}</div>
      ) : top.data ? (
        <Empty icon={UserRoundSearch} title="Ainda não há profissionais disponíveis">Publique seu pedido: os profissionais da região são avisados.</Empty>
      ) : (
        <p className="muted small">{top.error ? top.error.message : 'Carregando…'}</p>
      )}
    </div>
  )
}
