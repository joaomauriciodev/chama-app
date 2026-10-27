import { BadgeCheck, LogOut, Megaphone, Phone } from 'lucide-react'
import { CATS } from '../../data/catalog'
import { dateLabel } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { AreaPicker, AvailGrid, Avatar, CategoryTile } from '../../components/ui'
import CepField from '../../components/CepField'

export default function ProviderProfile() {
  const { state, go, act } = useApp()
  const { prov } = state

  return (
    <div className="screen">
      <h1 className="title">Seu perfil</h1>
      <div className="me">
        <Avatar person={{ id: 5, nome: prov.nome }} large />
        <div>
          <b>{prov.nome}</b>
          <span className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {prov.tel}</span>
          <span className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><BadgeCheck size={15} /> Verificação em andamento</span>
        </div>
      </div>

      {prov.plan && (
        <div className="plan-card">
          <span className="ic sm"><Megaphone size={18} /></span>
          <span><small>Plano de divulgação</small><b>{prov.plan.meses ? `${prov.plan.meses} meses, ativo` : 'Ativo'} até {dateLabel(prov.plan.until)}</b></span>
        </div>
      )}

      <h2 className="sec">Serviços que você faz</h2>
      <div className="catgrid">
        {CATS.map((c) => (
          <CategoryTile key={c.id} c={c} on={prov.cats.includes(c.id)} checkWhenOn onClick={() => go('toggleProvCat', c.id)} />
        ))}
      </div>

      <h2 className="sec">Onde você atende</h2>
      <div className="card">
        <CepField value={prov.base} onFound={(a) => a && go('provBase', a)} />
        <AreaPicker value={prov.area} onChange={(a) => go('area', a)} />
      </div>

      <h2 className="sec">Quando você trabalha</h2>
      <AvailGrid avail={prov.avail} onToggle={(id) => go('toggleAvail', id)} />
      {!prov.cats.length || !Object.values(prov.avail).some(Boolean)
        ? <p className="cep-msg err" style={{ marginTop: 14 }}>Escolha ao menos um serviço e um horário para salvar.</p>
        : <p className="muted small" style={{ marginTop: 14 }}>Tudo é salvo na hora.</p>}
      <button className="btn ghost" style={{ marginTop: 18 }} onClick={act.logout}><LogOut size={18} />Sair da conta</button>
    </div>
  )
}
