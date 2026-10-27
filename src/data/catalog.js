import {
  Sparkles, Hammer, Zap, Droplets, PaintRoller, Sprout, Truck, Wrench,
  Sunrise, Sun, Moon,
} from 'lucide-react'

// Categorias de serviço. O valor de cada serviço é combinado entre cliente e prestador; o app não sugere preço.
export const CATS = [
  { id: 'limpeza', nome: 'Limpeza', Icon: Sparkles, subs: ['Residencial', 'Pesada', 'Pós-obra', 'Estofados', 'Vidros'], un: 'cômodo', uns: 'cômodos' },
  { id: 'montagem', nome: 'Montagem', Icon: Hammer, subs: ['Guarda-roupa', 'Cama', 'Cozinha', 'Rack ou estante', 'Mesa', 'Escrivaninha'], un: 'móvel', uns: 'móveis' },
  { id: 'eletrica', nome: 'Elétrica', Icon: Zap, subs: ['Tomada', 'Chuveiro', 'Luminária', 'Disjuntor', 'Ventilador de teto'], un: 'ponto', uns: 'pontos' },
  { id: 'hidraulica', nome: 'Hidráulica', Icon: Droplets, subs: ['Vazamento', 'Torneira', 'Desentupir', 'Caixa d’água', 'Descarga'], un: 'item', uns: 'itens' },
  { id: 'pintura', nome: 'Pintura', Icon: PaintRoller, subs: ['Parede', 'Teto', 'Porta', 'Fachada', 'Grade'], un: 'cômodo', uns: 'cômodos' },
  { id: 'jardim', nome: 'Jardinagem', Icon: Sprout, subs: ['Cortar grama', 'Poda', 'Limpar quintal', 'Plantio'], un: 'hora', uns: 'horas' },
  { id: 'frete', nome: 'Frete', Icon: Truck, subs: ['Poucos itens', 'Mudança pequena', 'Mudança completa', 'Entulho'], un: 'viagem', uns: 'viagens' },
  { id: 'reparos', nome: 'Reparos', Icon: Wrench, subs: ['Suporte de TV', 'Cortina ou varão', 'Prateleira', 'Fechadura', 'Quadros'], un: 'item', uns: 'itens' },
]

// Cômodos pedidos quando a limpeza é residencial.
export const ROOMS = [
  { id: 'quartos', um: 'quarto', varios: 'quartos' },
  { id: 'banheiros', um: 'banheiro', varios: 'banheiros' },
  { id: 'salas', um: 'sala', varios: 'salas' },
  { id: 'cozinhas', um: 'cozinha', varios: 'cozinhas' },
  { id: 'servico', um: 'área de serviço', varios: 'áreas de serviço' },
]
export const ROOM_SUBS = ['Residencial']
export const DEFAULT_ROOMS = { quartos: 2, banheiros: 1, salas: 1, cozinhas: 1, servico: 1 }

// Mudanças pedem quantos móveis grandes.
export const MOVING_SUBS = ['Mudança pequena', 'Mudança completa']

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
