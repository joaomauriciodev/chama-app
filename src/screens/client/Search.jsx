import { Search as SearchIcon, SearchX } from 'lucide-react'
import { CATS, PROS, cat } from '../../data/catalog'
import { normalize } from '../../lib/format'
import { useApp } from '../../state/AppContext'
import { Chip, Empty, ProCard } from '../../components/ui'

const SORTS = [['nota', 'Melhor nota'], ['qtd', 'Mais serviços'], ['preco', 'Menor preço']]

function filterPros({ cat: catId, q, sort }) {
  let list = PROS.filter((p) => !catId || p.cats.includes(catId))
  const term = normalize(q.trim())
  if (term) {
    list = list.filter((p) => {
      const haystack = p.nome + ' ' + p.cats.map((id) => cat(id).nome + ' ' + cat(id).subs.join(' ')).join(' ')
      return normalize(haystack).includes(term)
    })
  }
  const by = { nota: (a, b) => b.nota - a.nota, qtd: (a, b) => b.qtd - a.qtd, preco: (a, b) => a.desde - b.desde }
  return list.sort(by[sort])
}

export default function Search() {
  const { state, go } = useApp()
  const { search } = state
  const list = filterPros(search)

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
        {list.length ? (
          <>
            <p className="count">{list.length} {list.length > 1 ? 'profissionais' : 'profissional'}</p>
            {list.map((p) => <ProCard key={p.id} p={p} />)}
          </>
        ) : (
          <Empty icon={SearchX} title="Ninguém encontrado" action={<button className="btn ghost" onClick={() => go('clearSearch')}>Limpar busca</button>}>
            Tente outro serviço ou limpe a busca.
          </Empty>
        )}
      </div>
    </div>
  )
}
