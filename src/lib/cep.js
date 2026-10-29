// CEP como única forma de localizar (sem GPS no MVP). ViaCEP primeiro e BrasilAPI de reserva, ambos públicos e gratuitos.
export const cepDigits = (v) => v.replace(/\D/g, '').slice(0, 8)
export const maskCep = (v) => cepDigits(v).replace(/^(\d{5})(\d)/, '$1-$2')

// `notFound` = alguma fonte respondeu que o CEP não existe; sem ele, o erro é de serviço fora do ar.
export class CepError extends Error {
  constructor(notFound) {
    super(notFound ? 'CEP não encontrado' : 'Serviço de CEP fora do ar')
    this.notFound = notFound
  }
}

const SOURCES = [
  async (d) => {
    const r = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: AbortSignal.timeout(4000) })
    if (r.status === 400) return null
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    return j.erro ? null : { rua: j.logradouro, bairro: j.bairro, cidade: j.localidade, uf: j.uf }
  },
  async (d) => {
    const r = await fetch(`https://brasilapi.com.br/api/cep/v1/${d}`, { signal: AbortSignal.timeout(4000) })
    if (r.status === 404) return null
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    return { rua: j.street, bairro: j.neighborhood, cidade: j.city, uf: j.state }
  },
]

export async function lookupCep(cep) {
  let notFound = false
  for (const get of SOURCES) {
    try {
      const a = await get(cepDigits(cep))
      if (!a) { notFound = true; continue }
      if (a.cidade && a.uf) return { cep: maskCep(cep), rua: a.rua || 'Endereço sem rua', bairro: a.bairro || a.cidade, cidade: a.cidade, uf: a.uf }
    } catch { /* tenta a próxima fonte */ }
  }
  throw new CepError(notFound)
}
