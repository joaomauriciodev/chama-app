import { BIG_FURNITURE_PRICE, ROOMS, cat } from '../data/catalog'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const price = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const maskPhone = (v) => v.replace(/\D/g, '').slice(0, 11).replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2')
export const dateLabel = (iso) => new Date(iso).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')
export const money = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')
export const firstName = (p) => p.nome.split(' ')[0]
export const initials = (p) => p.nome.split(' ').map((w) => w[0]).slice(0, 2).join('')
export const unit = (c, q) => `${q} ${q > 1 ? c.uns : c.un}`
export const roomsLabel = (rooms) => ROOMS.filter((r) => rooms[r.id]).map((r) => `${rooms[r.id]} ${rooms[r.id] > 1 ? r.varios : r.um}`).join(', ')
export const roomUnits = (rooms) => ROOMS.reduce((sum, r) => sum + rooms[r.id] * r.peso, 0)
export const furnitureLabel = (n) => `${n} ${n === 1 ? 'móvel grande' : 'móveis grandes'}`
// Tamanho do serviço: cômodos (limpeza residencial), quantidade e, em mudanças, móveis grandes.
export const size = (c, o) => (o.rooms ? roomsLabel(o.rooms) : unit(c, o.qty) + (o.moveis != null ? `, ${furnitureLabel(o.moveis)}` : ''))
export const whenLabel = (o) => (o.when === 'Flexível' ? 'Data flexível' : `${o.when}, ${o.period.toLowerCase()}`)
export const round5 = (n) => Math.round(n / 5) * 5
export const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const midpoint = ([a, b]) => round5((a + b) / 2)

// Faixa estimada: preço base × quantidade (ou cômodos ponderados), +10% por subtipo extra.
export function estimate(d) {
  const c = cat(d.cat)
  const units = d.rooms ? roomUnits(d.rooms) : d.qty
  const f = units * (1 + 0.1 * Math.max(0, d.subs.length - 1))
  const m = d.moveis || 0
  return [round5(c.preco[0] * f + BIG_FURNITURE_PRICE[0] * m), round5(c.preco[1] * f + BIG_FURNITURE_PRICE[1] * m)]
}

// Hoje, Amanhã, próximos 3 dias e Flexível.
export function dayChips(today = new Date()) {
  const out = []
  for (let i = 0; i < 5; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    out.push(i === 0 ? 'Hoje' : i === 1 ? 'Amanhã' : `${DAYS[d.getDay()]} ${d.getDate()}`)
  }
  out.push('Flexível')
  return out
}
