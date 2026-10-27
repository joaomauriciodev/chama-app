import { LogIn, LogOut, Phone } from 'lucide-react'
import { maskPhone } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { Avatar } from '../../components/ui'

export default function Profile() {
  const { state, go, act } = useApp()
  const u = state.auth
  return (
    <div className="screen">
      <h1 className="title">Perfil</h1>
      {u ? (
        <>
          <div className="me">
            <Avatar person={u} large />
            <div>
              <b>{u.nome}</b>
              <span className="muted small" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={14} /> {maskPhone(u.telefone)}</span>
            </div>
          </div>
          <button className="btn ghost" style={{ marginTop: 14 }} onClick={act.logout}><LogOut size={18} />Sair da conta</button>
        </>
      ) : (
        <button className="btn" onClick={() => go('openLogin', null)}><LogIn size={18} />Entrar ou criar conta</button>
      )}
      <section className="hero small" style={{ marginTop: 22 }}>
        <h1>Você também faz serviços?</h1>
        <p>Monte seu perfil em poucos toques e receba pedidos da sua região.</p>
        <button className="btn dark" onClick={() => go('role', 'prestador')}>Começar a trabalhar</button>
      </section>
    </div>
  )
}
