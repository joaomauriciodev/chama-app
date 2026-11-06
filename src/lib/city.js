// Cidade do cliente ({ cidade, uf } ou null = todas). Fica no aparelho e, com login, também na conta (PUT /me/cidade).
const KEY = 'chama.cidade'

export const storedCity = () => {
  try {
    const c = JSON.parse(localStorage.getItem(KEY))
    return c?.cidade && c?.uf ? { cidade: c.cidade, uf: c.uf } : null
  } catch {
    return null
  }
}

export const storeCity = (c) => {
  try { if (c) localStorage.setItem(KEY, JSON.stringify(c)); else localStorage.removeItem(KEY) } catch { /* sem storage */ }
}

export const cityLabel = (c) => (c ? `${c.cidade}, ${c.uf}` : 'Todas as cidades')
export const sameCity = (a, b) => (a?.cidade ?? null) === (b?.cidade ?? null) && (a?.uf ?? null) === (b?.uf ?? null)

// Parâmetros de /providers para a cidade escolhida.
export const cityParams = (c, params = new URLSearchParams()) => {
  if (c) { params.set('cidade', c.cidade); params.set('uf', c.uf) }
  return params
}
