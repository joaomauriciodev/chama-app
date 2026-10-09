import {
  Sparkles, Hammer, Zap, Droplets, PaintRoller, Sprout, Truck, Wrench,
  House, Briefcase, LocateFixed, Sunrise, Sun, Moon,
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

// Prestadores fictícios (no app real viriam da API, filtrados por raio).
export const PROS = [
  { id: 1, nome: 'Marcos Lima', cats: ['montagem', 'reparos'], nota: 4.9, qtd: 312, km: 1.2, desde: 60, ver: true, resp: '5 min' },
  { id: 2, nome: 'Cláudia Souza', cats: ['limpeza'], nota: 4.8, qtd: 540, km: 2.0, desde: 35, ver: true, resp: '10 min' },
  { id: 3, nome: 'Rafael Teixeira', cats: ['eletrica', 'reparos'], nota: 4.7, qtd: 128, km: 3.4, desde: 55, ver: true, resp: '15 min' },
  { id: 4, nome: 'Jéssica Martins', cats: ['limpeza', 'jardim'], nota: 4.9, qtd: 201, km: 0.8, desde: 30, ver: true, resp: '8 min' },
  { id: 5, nome: 'Paulo Henrique', cats: ['hidraulica', 'reparos'], nota: 4.6, qtd: 95, km: 4.1, desde: 70, ver: false, resp: '20 min' },
  { id: 6, nome: 'Sérgio Alves', cats: ['pintura'], nota: 4.8, qtd: 77, km: 5.3, desde: 180, ver: true, resp: '30 min' },
  { id: 7, nome: 'Tiago Rocha', cats: ['frete', 'montagem'], nota: 4.7, qtd: 410, km: 2.7, desde: 120, ver: true, resp: '6 min' },
  { id: 8, nome: 'Lourdes Pereira', cats: ['limpeza'], nota: 5.0, qtd: 63, km: 1.6, desde: 40, ver: true, resp: '12 min' },
  { id: 9, nome: 'André Nunes', cats: ['jardim', 'pintura'], nota: 4.5, qtd: 48, km: 6.0, desde: 45, ver: false, resp: '25 min' },
  { id: 10, nome: 'Bruno Carvalho', cats: ['eletrica', 'hidraulica'], nota: 4.9, qtd: 156, km: 3.0, desde: 60, ver: true, resp: '9 min' },
]

// Pedidos abertos que aparecem para o prestador.
export const DEMANDS = [
  { id: 'd1', cat: 'montagem', subs: ['Guarda-roupa'], qty: 1, when: 'Hoje', period: 'Tarde', bairro: 'Jardim América', km: 1.4, est: [110, 160], foto: true },
  { id: 'd2', cat: 'reparos', subs: ['Suporte de TV', 'Quadros'], qty: 3, when: 'Amanhã', period: 'Manhã', bairro: 'Centro', km: 2.2, est: [90, 140] },
  { id: 'd3', cat: 'eletrica', subs: ['Chuveiro'], qty: 1, when: 'Hoje', period: 'Noite', bairro: 'Vila Nova', km: 3.1, est: [70, 110], audio: true },
  { id: 'd4', cat: 'montagem', subs: ['Cozinha'], qty: 1, when: 'Sábado', period: 'Manhã', bairro: 'Bela Vista', km: 5.8, est: [250, 380], foto: true },
  { id: 'd5', cat: 'limpeza', subs: ['Pós-obra'], qty: 4, when: 'Amanhã', period: 'Manhã', bairro: 'Centro', km: 2.5, est: [200, 280] },
  { id: 'd6', cat: 'eletrica', subs: ['Tomada', 'Luminária'], qty: 4, when: 'Flexível', period: null, bairro: 'Santa Rita', km: 7.5, est: [120, 180] },
  { id: 'd7', cat: 'reparos', subs: ['Cortina ou varão'], qty: 2, when: 'Hoje', period: 'Tarde', bairro: 'Industrial', km: 9.6, est: [70, 100], foto: true },
  { id: 'd8', cat: 'montagem', subs: ['Cama', 'Rack ou estante'], qty: 2, when: 'Amanhã', period: 'Tarde', bairro: 'Jardim Europa', km: 4.0, est: [140, 200] },
]

export const ADDR = [
  { id: 'casa', Icon: House, nome: 'Casa', end: 'Rua das Palmeiras, 120, Centro' },
  { id: 'trabalho', Icon: Briefcase, nome: 'Trabalho', end: 'Av. Brasil, 1500, sala 42' },
  { id: 'gps', Icon: LocateFixed, nome: 'Onde estou agora', end: 'Usar a localização do celular' },
]

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
