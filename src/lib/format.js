import { ROOMS } from '../data/catalog'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const price = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const maskPhone = (v) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
export const dateLabel = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')
export const money = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')
export const firstName = (p) => p.nome.split(' ')[0]
export const initials = (p) => p.nome.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
export const unit = (c, q) => `${q} ${q > 1 ? c.uns : c.un}`
export const roomsLabel = (rooms) => ROOMS.filter((r) => rooms[r.id]).map((r) => `${rooms[r.id]} ${rooms[r.id] > 1 ? r.varios : r.um}`).join(', ')
export const roomCount = (rooms) => ROOMS.reduce((sum, r) => sum + rooms[r.id], 0)
export const furnitureLabel = (n) => `${n} ${n === 1 ? 'móvel grande' : 'móveis grandes'}`
// Tamanho do serviço: cômodos (limpeza residencial), quantidade e, em mudanças, móveis grandes.
export const size = (c, o) => (o.rooms ? roomsLabel(o.rooms) : unit(c, o.qty) + (o.moveis != null ? `, ${furnitureLabel(o.moveis)}` : ''))
export const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Datas do pedido em 'AAAA-MM-DD' no fuso do aparelho.
export const isoDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function dayLabel(iso, today = new Date()) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const diff = Math.round((date - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000)
  if (diff === 0) return 'Hoje'
  if (diff === 1) return 'Amanhã'
  if (diff > 1 && diff < 7) return `${DAYS[date.getDay()]} ${d}`
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`
}

export const whenLabel = (o) => (o.data ? `${dayLabel(o.data)}${o.periodo ? `, ${o.periodo.toLowerCase()}` : ''}` : 'Data flexível')

// Hoje, Amanhã, próximos 3 dias e Flexível (data null).
export function dayChips(today = new Date()) {
  const out = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    out.push({ label: dayLabel(isoDate(d), today), data: isoDate(d) })
  }
  out.push({ label: 'Flexível', data: null })
  return out
}
