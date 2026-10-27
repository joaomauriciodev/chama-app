import { Search as SearchIcon, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CATS } from '../../data/catalog'
import { normalize } from '../../lib/format'
import { useApi } from '../../lib/useApi'
import { useApp } from '../../state/AppContext'
import { Chip, Empty, ProCard } from '../../components/ui'

const SORTS = [['nota', 'Melhor nota'], ['avaliacoes', 'Mais avaliados'], ['recentes', 'Novos']]

// Categorias cujo nome ou subtipo combina com a busca (ex.: "chuveiro" → elétrica).
const matchingCats = (q) => {
  const term = normalize(q.trim())
  if (!term) return []
  return CATS.filter((c) => normalize(c.nome + ' ' + c.subs.join(' ')).includes(term)).map((c) => c.id)
}

export default function Search() {
  const { state, go } = useApp()
  const { search } = state
  const [q, setQ] = useState(search.q)
  useEffect(() => {
    const t = setTimeout(() => setQ(search.q), 300)
    return () => clearTimeout(t)
  }, [search.q])

  const params = new URLSearchParams({ sort: search.sort })
  if (search.cat) params.set('categoria', search.cat)
  if (q.trim()) {
    params.set('q', q.trim())
    params.set('qcats', matchingCats(q).join(','))
  }
  const { data: list, error } = useApi(`/providers?${params}`)

  return (
    <div className="screen">
      <h1 className="title">Buscar</h1>
      <label className="search">
        <SearchIcon size={18} />
        <input type="search" placeholder="Nome ou serviço, ex.: chuveiro" value={search.q} onChange={(e) => go('searchQ', e.target.value)} autoComplete="off" />
      </label>

      <div className="hscroll">
        <Chip on={!search.cat} onClick={() => go('searchCat', null)}>Todos</Chip>
        {CATS.map((c) => (
          <Chip key={c.id} on={search.cat === c.id} icon={c.Icon} onClick={() => go('searchCat', c.id)}>{c.nome}</Chip>
        ))}
      </div>

      <div className="seg wide">
        {SORTS.map(([k, label]) => (
          <button key={k} className={search.sort === k ? 'on' : ''} onClick={() => go('searchSort', k)}>{label}</button>
        ))}
      </div>

      <div className="list">
        {error ? (
          <p className="count">{error.message}</p>
        ) : !list ? (
          <p className="count">Carregando…</p>
        ) : list.length ? (
          <>
            <p className="count">{list.length} {list.length > 1 ? 'profissionais' : 'profissional'}</p>
            {list.map((p) => <ProCard key={p.id} p={p} />)}
          </>
        ) : (
          <Empty icon={SearchX} title="Ninguém encontrado" action={<button className="btn ghost" onClick={() => go('clearSearch')}>Limpar busca</button>}>
            Tente outro serviço ou publique seu pedido para avisar os profissionais da região.
          </Empty>
        )}
      </div>
    </div>
  )
}
