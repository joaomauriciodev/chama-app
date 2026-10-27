import {
  Sparkles, Hammer, Zap, Droplets, PaintRoller, Sprout, Truck, Wrench,
  Sunrise, Sun, Moon,
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

// Cômodos pedidos quando a limpeza é residencial. `peso` ajusta a estimativa (banheiro e cozinha dão mais trabalho).
export const ROOMS = [
  { id: 'quartos', um: 'quarto', varios: 'quartos', peso: 1 },
  { id: 'banheiros', um: 'banheiro', varios: 'banheiros', peso: 1.5 },
  { id: 'salas', um: 'sala', varios: 'salas', peso: 1 },
  { id: 'cozinhas', um: 'cozinha', varios: 'cozinhas', peso: 1.5 },
  { id: 'servico', um: 'área de serviço', varios: 'áreas de serviço', peso: 0.5 },
]
export const ROOM_SUBS = ['Residencial']
export const DEFAULT_ROOMS = { quartos: 2, banheiros: 1, salas: 1, cozinhas: 1, servico: 1 }

// Mudanças pedem quantos móveis grandes; cada um soma esta faixa (R$) à estimativa.
export const MOVING_SUBS = ['Mudança pequena', 'Mudança completa']
export const BIG_FURNITURE_PRICE = [15, 25]

// Área de atendimento do prestador, sem distância: a API compara prefixos do CEP (bairro 5 dígitos, região 2) ou a cidade.
export const AREAS = [
  { id: 'bairro', nome: 'Meu bairro', digits: 5 },
  { id: 'regiao', nome: 'Minha região', digits: 2 },
  { id: 'cidade', nome: 'Toda a cidade', digits: 0 },
]


export const PERIODS = [
  { id: 'Manhã', Icon: Sunrise, horas: '8h às 12h' },
  { id: 'Tarde', Icon: Sun, horas: '12h às 18h' },
  { id: 'Noite', Icon: Moon, horas: '18h às 21h' },
]

export const QUICK_REPLIES = ['Estou em casa', 'Pode vir mais cedo?', 'Tem vaga na garagem', 'Vou atrasar 15 min']
export const PRO_QUICK = ['Posso ir no horário pedido', 'Levo o material', 'Pode mandar uma foto?', 'Tem onde estacionar?']
export const CLIENT_TAGS = ['Pontual', 'Educado', 'Pagou o combinado', 'Local organizado', 'Comunicação clara']
export const RATING_TAGS = ['Pontual', 'Caprichoso', 'Educado', 'Preço justo', 'Deixou tudo limpo']
export const AVATAR_COLORS = ['#FFD66B', '#A8D8FF', '#B9F0C9', '#FFC2B3', '#D9C8FF', '#FFE0A3', '#BDEBEA']
// Planos de divulgação do prestador (preço por mês, pago à vista pelo período).
export const PLANS = [
  { meses: 3, mensal: 39.9 },
  { meses: 6, mensal: 34.9, tag: 'Mais escolhido' },
  { meses: 12, mensal: 29.9, tag: 'Melhor preço' },
]
export const WEEK = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
export const SHIFTS = [['M', 'Manhã'], ['T', 'Tarde'], ['N', 'Noite']]

export const cat = (id) => CATS.find((c) => c.id === id)
