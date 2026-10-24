import { LoaderCircle, MapPin } from 'lucide-react'
import { useState } from 'react'
import { cepDigits, lookupCep, maskCep } from '../lib/cep'

// Campo de CEP que busca o endereço sozinho ao completar 8 dígitos.
export default function CepField({ value, onFound }) {
  const [cep, setCep] = useState(value?.cep || '')
  const [status, setStatus] = useState(value ? 'ok' : 'idle') // idle | loading | ok | error

  const onChange = async (e) => {
    const v = maskCep(e.target.value)
    setCep(v)
    if (cepDigits(v).length < 8) {
      if (status !== 'idle') { setStatus('idle'); onFound(null) }
      return
    }
    setStatus('loading')
    try {
      onFound(await lookupCep(v))
      setStatus('ok')
    } catch {
      setStatus('error')
      onFound(null)
    }
  }

  return (
    <div className="cep">
      <label className="field">
        <small>CEP</small>
        <input inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" maxLength={9} value={cep} onChange={onChange} />
      </label>
      {status === 'loading' && <p className="cep-msg"><LoaderCircle size={16} className="spin" /> Buscando endereço…</p>}
      {status === 'error' && <p className="cep-msg err">CEP não encontrado. Confira os números.</p>}
      {status === 'ok' && value && (
        <p className="cep-msg ok"><MapPin size={16} /><span><b>{value.rua}</b>{value.bairro}, {value.cidade} – {value.uf}</span></p>
      )}
    </div>
  )
}
