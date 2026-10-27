import { useEffect, useState } from 'react'
import { api } from './api'
import { useApp } from '../state/AppContext'

// Busca `path` na API e recarrega quando os dados mudam (refresh após ações) ou a cada `poll` ms.
// `path` nulo não busca nada (ex.: usuário sem login).
export function useApi(path, { poll = 0 } = {}) {
  const { rev } = useApp()
  const [res, setRes] = useState({ path: null, data: null, error: null })

  useEffect(() => {
    if (!path) return undefined
    let alive = true
    const load = () => api(path)
      .then((data) => alive && setRes({ path, data, error: null }))
      .catch((error) => alive && setRes((r) => ({ path, data: r.path === path ? r.data : null, error })))
    load()
    const t = poll ? setInterval(load, poll) : null
    return () => {
      alive = false
      if (t) clearInterval(t)
    }
  }, [path, poll, rev])

  const fresh = path && res.path === path
  return { data: fresh ? res.data : null, error: fresh ? res.error : null, loading: !!path && !fresh }
}
