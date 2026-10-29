import { LoaderCircle, MapPin } from 'lucide-react'
import { useState } from 'react'
import { cepDigits, lookupCep, maskCep } from '../lib/cep'

// Campo de CEP que busca o endereço sozinho ao completar 8 dígitos.
export default function CepField({ value, onFound }) {
  const [cep, setCep] = useState(value?.cep || '')
  const [status, setStatus] = useState(value ? 'ok' : 'idle') // idle | loading | ok | notfound | down

  const search = async (v) => {
    setStatus('loading')
    try {
      onFound(await lookupCep(v))
      setStatus('ok')
    } catch (err) {
      setStatus(err.notFound ? 'notfound' : 'down')
      onFound(null)
    }
  }

  const onChange = (e) => {
    const v = maskCep(e.target.value)
    setCep(v)
    if (cepDigits(v).length < 8) {
      if (status !== 'idle') { setStatus('idle'); onFound(null) }
      return
    }
    search(v)
  }

  return (
    <div className="cep">
      <label className="field">
        <small>CEP</small>
        <input inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" maxLength={9} value={cep} onChange={onChange} />
      </label>
      {status === 'loading' && <p className="cep-msg"><LoaderCircle size={16} className="spin" /> Buscando endereço…</p>}
      {status === 'notfound' && <p className="cep-msg err">CEP não encontrado. Confira os números.</p>}
      {status === 'down' && <p className="cep-msg err">Não conseguimos buscar o endereço agora. <button type="button" className="link" onClick={() => search(cep)}>Tentar de novo</button></p>}
      {status === 'ok' && value && (
        <p className="cep-msg ok"><MapPin size={16} /><span><b>{value.rua}</b>{value.bairro}, {value.cidade} – {value.uf}</span></p>
      )}
    </div>
  )
}
