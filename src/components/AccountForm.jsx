import { useEffect, useState } from 'react'
import { maskPhone } from '../lib/format'

const digits = (v) => v.replace(/\D/g, '')

// Conta nova: dados → SMS → código de 6 dígitos. Entrar: WhatsApp + senha.
export const accountValid = (f) => {
  if (f.mode === 'novo' && f.codeSent) return digits(f.codigo).length === 6
  return digits(f.tel).length >= (f.mode === 'novo' ? 11 : 10) && f.senha.length >= 8 && (f.mode === 'entrar' || f.nome.trim().split(/\s+/).length >= 2)
}

export const accountLabel = (f) => {
  if (f.busy) return 'Aguarde…'
  if (f.mode === 'entrar') return 'Entrar'
  return f.codeSent ? 'Confirmar e criar conta' : 'Receber código por SMS'
}

// Segundos que faltam até `at` (ms), atualizando a cada segundo.
function useCountdown(at) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (at <= Date.now()) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [at])
  return Math.max(0, Math.ceil((at - now) / 1000))
}

function CodeStep({ f, set, onResend }) {
  const wait = useCountdown(f.resendAt)
  return (
    <>
      <h2 className="q">Digite o código</h2>
      <p className="hint">Enviamos um SMS com 6 números para <b>{f.tel}</b>.</p>
      <label className="field">
        <small>Código do SMS</small>
        <input
          className="code-input" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} autoFocus
          value={f.codigo} onChange={(e) => set({ codigo: digits(e.target.value).slice(0, 6), error: null })}
        />
      </label>
      <div className="code-act">
        <button className="link" disabled={wait > 0 || f.busy} onClick={onResend}>{wait > 0 ? `Reenviar código em ${wait} s` : 'Reenviar código'}</button>
        <button className="link" disabled={f.busy} onClick={() => set({ codeSent: false, codigo: '', error: null })}>Trocar número</button>
      </div>
    </>
  )
}

// Criar conta ou entrar. Usado no login e no cadastro de prestador.
export default function AccountForm({ f, set, intro, onResend }) {
  const isNew = f.mode === 'novo'
  if (isNew && f.codeSent) return <CodeStep f={f} set={set} onResend={onResend} />
  return (
    <>
      <h2 className="q">{isNew ? 'Crie sua conta' : 'Entre na sua conta'}</h2>
      <p className="hint">{isNew ? intro : 'Use o WhatsApp e a senha do seu cadastro.'}</p>
      <div className="seg wide" role="group" aria-label="Conta" style={{ marginBottom: 14 }}>
        <button className={isNew ? 'on' : ''} onClick={() => set({ mode: 'novo', error: null })}>Sou novo</button>
        <button className={isNew ? '' : 'on'} onClick={() => set({ mode: 'entrar', error: null })}>Já tenho conta</button>
      </div>
      {isNew && (
        <label className="field" style={{ marginBottom: 10 }}>
          <small>Nome completo</small>
          <input autoComplete="name" placeholder="Ex.: Ana Ribeiro" value={f.nome} onChange={(e) => set({ nome: e.target.value })} />
        </label>
      )}
      <label className="field">
        <small>{isNew ? 'Celular com WhatsApp (vamos enviar um código por SMS)' : 'WhatsApp'}</small>
        <input inputMode="tel" autoComplete="tel-national" placeholder="(11) 90000-0000" value={f.tel} onChange={(e) => set({ tel: maskPhone(e.target.value) })} />
      </label>
      <label className="field" style={{ marginTop: 10 }}>
        <small>Senha{isNew ? ' (mínimo 8 caracteres)' : ''}</small>
        <input type="password" autoComplete={isNew ? 'new-password' : 'current-password'} value={f.senha} onChange={(e) => set({ senha: e.target.value })} />
      </label>
    </>
  )
}
