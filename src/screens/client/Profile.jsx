import { Bell, ChevronRight, LifeBuoy, MapPinned } from 'lucide-react'
import { useApp } from '../../state/AppContext'
import { Avatar } from '../../components/ui'

const ROWS = [[MapPinned, 'Endereços salvos', '2'], [Bell, 'Notificações', 'Ativas'], [LifeBuoy, 'Ajuda', '']]

export default function Profile() {
  const { go } = useApp()
  return (
    <div className="screen">
      <h1 className="title">Perfil</h1>
      <div className="me">
        <Avatar person={{ id: 3, nome: 'Ana Ribeiro' }} large />
        <div><b>Ana Ribeiro</b><span className="muted small">Cliente desde março de 2025</span></div>
      </div>
      {ROWS.map(([Icon, label, value]) => (
        <button key={label} className="prow">
          <Icon size={20} /><span>{label}</span><small>{value}</small><ChevronRight size={18} />
        </button>
      ))}
      <section className="hero small" style={{ marginTop: 22 }}>
        <h1>Você também faz serviços?</h1>
        <p>Monte seu perfil em poucos toques e receba pedidos perto de você.</p>
        <button className="btn dark" onClick={() => go('role', 'prestador')}>Começar a trabalhar</button>
      </section>
    </div>
  )
}
