import { X } from 'lucide-react'
import { useApp } from '../state/AppContext'
import AccountForm, { accountLabel, accountValid } from '../components/AccountForm'

const INTRO = {
  publish: 'Para publicar o pedido e conversar com os profissionais.',
  orders: 'Para acompanhar seus pedidos e conversas.',
}

export default function LoginFlow() {
  const { state, go, act } = useApp()
  const f = state.login
  return (
    <div className="overlay" role="dialog" aria-label="Entrar">
      <div className="ohead">
        <span style={{ width: 42 }} />
        <span className="lbl">Sua conta</span>
        <button className="iconbtn" onClick={() => go('closeLogin')} disabled={f.busy} aria-label="Fechar"><X size={20} /></button>
      </div>
      <div className="obody">
        <AccountForm f={f} set={(v) => go('lg', v)} onResend={() => act.sendCode(f, (v) => go('lg', v))} intro={INTRO[f.after] || 'Seu WhatsApp só é mostrado ao profissional depois que vocês firmam um pedido.'} />
      </div>
      <div className="ofoot">
        {f.error && <p className="cep-msg err" style={{ margin: '0 2px 10px' }} role="alert">{f.error}</p>}
        <button className="btn" onClick={() => act.login(f)} disabled={!accountValid(f) || f.busy}>
          {accountLabel(f)}
        </button>
      </div>
    </div>
  )
}
