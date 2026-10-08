import { PROS, pro } from '../data/catalog'
import { round5 } from './format'

// Simula as propostas que chegam para um pedido: os 3 prestadores mais próximos
// que atendem a categoria (o prestador chamado diretamente vem primeiro).
// No backend real isso vira: categoria + raio (PostGIS) + disponibilidade,
// ordenados por distância, nota e taxa de resposta.
export function makeOffers(order) {
  const mid = (order.est[0] + order.est[1]) / 2
  let candidates = PROS.filter((p) => p.cats.includes(order.cat)).sort((a, b) => a.km - b.km)
  if (order.pro) candidates = [pro(order.pro), ...candidates.filter((p) => p.id !== order.pro)]
  const mult = [1, 0.9, 1.12]
  const arrival = ['No horário pedido', 'Até 30 min depois', 'No horário pedido']
  return candidates.slice(0, 3).map((p, i) => ({ pid: p.id, preco: round5(mid * mult[i]), chega: arrival[i] }))
}
