import { cat } from '../data/catalog'

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const money = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR')
export const km = (n) => n.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' km'
export const firstName = (p) => p.nome.split(' ')[0]
export const initials = (p) => p.nome.split(' ').map((w) => w[0]).slice(0, 2).join('')
export const unit = (c, q) => `${q} ${q > 1 ? c.uns : c.un}`
export const whenLabel = (o) => (o.when === 'Flexível' ? 'Data flexível' : `${o.when}, ${o.period.toLowerCase()}`)
export const round5 = (n) => Math.round(n / 5) * 5
export const normalize = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const midpoint = ([a, b]) => round5((a + b) / 2)

// Faixa estimada: preço base × quantidade, +10% por subtipo extra.
export function estimate(d) {
  const c = cat(d.cat)
  const f = d.qty * (1 + 0.1 * Math.max(0, d.subs.length - 1))
  return [round5(c.preco[0] * f), round5(c.preco[1] * f)]
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
