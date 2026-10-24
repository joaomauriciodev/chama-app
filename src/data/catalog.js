import {
  Sparkles, Hammer, Zap, Droplets, PaintRoller, Sprout, Truck, Wrench,
  House, Briefcase, MapPinned, Sunrise, Sun, Moon,
} from 'lucide-react'

// Categorias de serviço. `preco` é a faixa base (R$) por unidade, usada na estimativa.
export const CATS = [
  { id: 'limpeza', nome: 'Limpeza', Icon: Sparkles, subs: ['Residencial', 'Pesada', 'Pós-obra', 'Estofados', 'Vidros'], un: 'cômodo', uns: 'cômodos', preco: [30, 45] },
  { id: 'montagem', nome: 'Montagem', Icon: Hammer, subs: ['Guarda-roupa', 'Cama', 'Cozinha', 'Rack ou estante', 'Mesa', 'Escrivaninha'], un: 'móvel', uns: 'móveis', preco: [60, 110] },
  { id: 'eletrica', nome: 'Elétrica', Icon: Zap, subs: ['Tomada', 'Chuveiro', 'Luminária', 'Disjuntor', 'Ventilador de teto'], un: 'ponto', uns: 'pontos', preco: [50, 90] },
  { id: 'hidraulica', nome: 'Hidráulica', Icon: Droplets, subs: ['Vazamento', 'Torneira', 'Desentupir', 'Caixa d’água', 'Descarga'], un: 'item', uns: 'itens', preco: [70, 130] },
  { id: 'pintura', nome: 'Pintura', Icon: PaintRoller, subs: ['Parede', 'Teto', 'Porta', 'Fachada', 'Grade'], un: 'cômodo', uns: 'cômodos', preco: [180, 320] },
  { id: 'jardim', nome: 'Jardinagem', Icon: Sprout, subs: ['Cortar grama', 'Poda', 'Limpar quintal', 'Plantio'], un: 'hora', uns: 'horas', preco: [40, 60] },
  { id: 'frete', nome: 'Frete', Icon: Truck, subs: ['Poucos itens', 'Mudança pequena', 'Mudança completa', 'Entulho'], un: 'viagem', uns: 'viagens', preco: [120, 250] },
  { id: 'reparos', nome: 'Reparos', Icon: Wrench, subs: ['Suporte de TV', 'Cortina ou varão', 'Prateleira', 'Fechadura', 'Quadros'], un: 'item', uns: 'itens', preco: [40, 80] },
]

// Prestadores fictícios (no app real viriam da API, filtrados pela área do CEP).
export const PROS = [
  { id: 1, nome: 'Marcos Lima', cats: ['montagem', 'reparos'], nota: 4.9, qtd: 312, bairro: 'Bela Vista', desde: 60, ver: true, resp: '5 min' },
  { id: 2, nome: 'Cláudia Souza', cats: ['limpeza'], nota: 4.8, qtd: 540, bairro: 'Consolação', desde: 35, ver: true, resp: '10 min' },
  { id: 3, nome: 'Rafael Teixeira', cats: ['eletrica', 'reparos'], nota: 4.7, qtd: 128, bairro: 'Liberdade', desde: 55, ver: true, resp: '15 min' },
  { id: 4, nome: 'Jéssica Martins', cats: ['limpeza', 'jardim'], nota: 4.9, qtd: 201, bairro: 'Jardim Paulista', desde: 30, ver: true, resp: '8 min' },
  { id: 5, nome: 'Paulo Henrique', cats: ['hidraulica', 'reparos'], nota: 4.6, qtd: 95, bairro: 'Santa Cecília', desde: 70, ver: false, resp: '20 min' },
  { id: 6, nome: 'Sérgio Alves', cats: ['pintura'], nota: 4.8, qtd: 77, bairro: 'Pinheiros', desde: 180, ver: true, resp: '30 min' },
  { id: 7, nome: 'Tiago Rocha', cats: ['frete', 'montagem'], nota: 4.7, qtd: 410, bairro: 'Cambuci', desde: 120, ver: true, resp: '6 min' },
  { id: 8, nome: 'Lourdes Pereira', cats: ['limpeza'], nota: 5.0, qtd: 63, bairro: 'Bela Vista', desde: 40, ver: true, resp: '12 min' },
  { id: 9, nome: 'André Nunes', cats: ['jardim', 'pintura'], nota: 4.5, qtd: 48, bairro: 'Vila Mariana', desde: 45, ver: false, resp: '25 min' },
  { id: 10, nome: 'Bruno Carvalho', cats: ['eletrica', 'hidraulica'], nota: 4.9, qtd: 156, bairro: 'Aclimação', desde: 60, ver: true, resp: '9 min' },
]

// Pedidos abertos que aparecem para o prestador.
export const DEMANDS = [
  { id: 'd1', cat: 'montagem', subs: ['Guarda-roupa'], qty: 1, when: 'Hoje', period: 'Tarde', bairro: 'Jardim América', cep: '01430-001', cidade: 'São Paulo', est: [110, 160], foto: true },
  { id: 'd2', cat: 'reparos', subs: ['Suporte de TV', 'Quadros'], qty: 3, when: 'Amanhã', period: 'Manhã', bairro: 'República', cep: '01045-001', cidade: 'São Paulo', est: [90, 140] },
  { id: 'd3', cat: 'eletrica', subs: ['Chuveiro'], qty: 1, when: 'Hoje', period: 'Noite', bairro: 'Vila Mariana', cep: '04101-000', cidade: 'São Paulo', est: [70, 110], audio: true },
  { id: 'd4', cat: 'montagem', subs: ['Cozinha'], qty: 1, when: 'Sábado', period: 'Manhã', bairro: 'Bela Vista', cep: '01310-100', cidade: 'São Paulo', est: [250, 380], foto: true },
  { id: 'd5', cat: 'limpeza', subs: ['Pós-obra'], qty: 4, when: 'Amanhã', period: 'Manhã', bairro: 'Consolação', cep: '01301-000', cidade: 'São Paulo', est: [200, 280] },
  { id: 'd6', cat: 'eletrica', subs: ['Tomada', 'Luminária'], qty: 4, when: 'Flexível', period: null, bairro: 'Santana', cep: '02012-000', cidade: 'São Paulo', est: [120, 180] },
  { id: 'd7', cat: 'reparos', subs: ['Cortina ou varão'], qty: 2, when: 'Hoje', period: 'Tarde', bairro: 'Mooca', cep: '03101-000', cidade: 'São Paulo', est: [70, 100], foto: true },
  { id: 'd8', cat: 'montagem', subs: ['Cama', 'Rack ou estante'], qty: 2, when: 'Amanhã', period: 'Tarde', bairro: 'Jardim Europa', cep: '01449-000', cidade: 'São Paulo', est: [140, 200] },
]

export const ADDR = [
  { id: 'casa', Icon: House, nome: 'Casa', end: 'Rua das Palmeiras, 120, Centro' },
  { id: 'trabalho', Icon: Briefcase, nome: 'Trabalho', end: 'Av. Brasil, 1500, sala 42' },
]

// Endereço do pedido: um salvo ou um digitado por CEP (where === 'cep', dados em o.addr).
export function place(o) {
  if (o.where !== 'cep') return ADDR.find((a) => a.id === o.where)
  const a = o.addr
  return { Icon: MapPinned, nome: `${a.rua}, ${a.numero}`, end: `${a.bairro}, ${a.cidade}` }
}

// Área de atendimento do prestador, sem distância: compara prefixos do CEP (que são geográficos) ou a cidade.
export const AREAS = [
  { id: 'bairro', nome: 'Meu bairro', digits: 5 },
  { id: 'regiao', nome: 'Minha região', digits: 2 },
  { id: 'cidade', nome: 'Toda a cidade', digits: 0 },
]

export function inArea(base, areaId, d) {
  const { digits } = AREAS.find((a) => a.id === areaId)
  if (!digits) return d.cidade === base.cidade
  return d.cep.slice(0, digits) === base.cep.slice(0, digits)
}

export const PERIODS = [
  { id: 'Manhã', Icon: Sunrise, horas: '8h às 12h' },
  { id: 'Tarde', Icon: Sun, horas: '12h às 18h' },
  { id: 'Noite', Icon: Moon, horas: '18h às 21h' },
]

export const QUICK_REPLIES = ['Estou em casa', 'Pode vir mais cedo?', 'Tem vaga na garagem', 'Interfone 42', 'Vou atrasar 15 min']
export const PRO_REPLIES = ['Combinado!', 'Perfeito, obrigado pelo aviso.', 'Pode deixar 👍']
export const RATING_TAGS = ['Pontual', 'Caprichoso', 'Educado', 'Preço justo', 'Deixou tudo limpo']
export const REVIEWS = [
  ['Juliana', 'Chegou no horário e deixou tudo limpo.'],
  ['Ricardo', 'Muito caprichoso, recomendo.'],
  ['Patrícia', 'Resolveu rápido e cobrou o combinado.'],
  ['Diego', 'Educado e atencioso do começo ao fim.'],
]
export const AVATAR_COLORS = ['#FFD66B', '#A8D8FF', '#B9F0C9', '#FFC2B3', '#D9C8FF', '#FFE0A3', '#BDEBEA']
export const WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
export const SHIFTS = [['M', 'Manhã'], ['T', 'Tarde'], ['N', 'Noite']]

export const cat = (id) => CATS.find((c) => c.id === id)
export const pro = (id) => PROS.find((p) => p.id === +id)
export const demand = (id) => DEMANDS.find((d) => d.id === id)
