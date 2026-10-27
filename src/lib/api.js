// Cliente da chama-api. A sessão (JWT) fica no navegador para sobreviver ao recarregar a página.
// O endereço vem de /config.js (gerado pela imagem Docker a partir de API_URL) ou, no dev, de VITE_API_URL.
const BASE = window.CHAMA_CONFIG?.apiUrl || import.meta.env.VITE_API_URL || 'http://localhost:3000'
const KEY = 'chama.token'

export const session = {
  get() {
    try { return localStorage.getItem(KEY) } catch { return null }
  },
  set(t) {
    try { if (t) localStorage.setItem(KEY, t); else localStorage.removeItem(KEY) } catch { /* sem storage: sessão só em memória */ }
  },
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = session.get()
  const opts = { method, headers: {} }
  if (token) opts.headers.authorization = `Bearer ${token}`
  if (body) {
    opts.headers['content-type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  let res
  try {
    res = await fetch(BASE + path, opts)
  } catch {
    throw new ApiError('Sem conexão com o servidor. Tente de novo.', 0)
  }
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    if (res.status === 401 && token) session.set(null)
    throw new ApiError(data?.error || 'Algo deu errado. Tente de novo.', res.status)
  }
  return data
}

export const getProfile = () => api('/me/provider').catch((err) => {
  if (err.status === 404) return null
  throw err
})

// Conversões entre o perfil da API e o estado do app.
export const profileToProv = (p) => ({
  cats: p.categorias,
  base: p.endereco,
  area: p.area,
  avail: Object.fromEntries(p.disponibilidade.map((k) => [k, true])),
  online: p.online,
})

export const provToBody = (p) => ({
  categorias: p.cats,
  cep: p.base.cep,
  area: p.area,
  disponibilidade: Object.keys(p.avail).filter((k) => p.avail[k]),
  online: p.online,
})
