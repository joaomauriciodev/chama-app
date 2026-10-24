// CEP como única forma de localizar (sem GPS no MVP). Consulta o ViaCEP, público e gratuito.
export const cepDigits = (v) => v.replace(/\D/g, '').slice(0, 8)
export const maskCep = (v) => cepDigits(v).replace(/^(\d{5})(\d)/, '$1-$2')

export async function lookupCep(cep) {
  const r = await fetch(`https://viacep.com.br/ws/${cepDigits(cep)}/json/`)
  const j = r.ok ? await r.json() : { erro: true }
  if (j.erro) throw new Error('CEP não encontrado')
  return { cep: maskCep(cep), rua: j.logradouro || 'Endereço sem rua', bairro: j.bairro || j.localidade, cidade: j.localidade, uf: j.uf }
}
