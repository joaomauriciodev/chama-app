// Situação dos pedidos e conversas que vêm da API, para listas, selos e badges.
// Ciclo: conversa → firmado (WhatsApp liberado) → concluído (os dois avaliaram ou passou 1 dia).

const other = (papel) => (papel === 'cliente' ? 'prestador' : 'cliente')

// Conversa vista por quem tem `papel` ('cliente' | 'prestador').
export function convStatus(c, papel) {
  if (c.estado === 'conversa') return c.propostaBy === other(papel) ? ['Nova proposta', 'acc'] : ['Conversando', 'ok']
  if (c.estado === 'firmado') return c.meuRating ? ['Aguardando avaliação', 'wait'] : ['Avaliar', 'acc']
  if (c.estado === 'encerrada') return ['Encerrada', 'done']
  return ['Concluído', 'done']
}

export const convNeedsAction = (c, papel) =>
  (c.estado === 'conversa' && c.propostaBy === other(papel)) || (c.estado === 'firmado' && !c.meuRating)

export function orderStatus(o) {
  if (o.situacao === 'aberto') return ['Aguardando profissionais', 'wait']
  const firm = o.conversas.find((c) => c.estado === 'firmado' || c.estado === 'concluido')
  if (firm) return convStatus(firm, 'cliente')
  return o.conversas.some((c) => convNeedsAction(c, 'cliente')) ? ['Nova proposta', 'acc'] : ['Conversando', 'ok']
}

export const orderNeedsAction = (o) => o.conversas.some((c) => convNeedsAction(c, 'cliente'))
