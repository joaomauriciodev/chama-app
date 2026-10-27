import { maskPhone } from '../lib/format'

export const accountValid = (f) =>
  f.tel.replace(/\D/g, '').length >= 10 && f.senha.length >= 8 && (f.mode === 'entrar' || f.nome.trim().split(/\s+/).length >= 2)

// Criar conta ou entrar (WhatsApp + senha). Usado no login e no cadastro de prestador.
export default function AccountForm({ f, set, intro }) {
  const isNew = f.mode === 'novo'
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
        <small>WhatsApp</small>
        <input inputMode="tel" autoComplete="tel-national" placeholder="(11) 90000-0000" value={f.tel} onChange={(e) => set({ tel: maskPhone(e.target.value) })} />
      </label>
      <label className="field" style={{ marginTop: 10 }}>
        <small>Senha{isNew ? ' (mínimo 8 caracteres)' : ''}</small>
        <input type="password" autoComplete={isNew ? 'new-password' : 'current-password'} value={f.senha} onChange={(e) => set({ senha: e.target.value })} />
      </label>
    </>
  )
}
