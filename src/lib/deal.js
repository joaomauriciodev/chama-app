import { money } from './format'

// Ciclo de um match (pedido do cliente ou conversa do prestador):
// conversa → firmado (os dois aceitaram o mesmo valor; WhatsApp liberado) → concluído.
// Fecha quando os dois avaliam ou quando passa 1 dia do pedido firmado.
export const DAY = 24 * 60 * 60 * 1000

// `ref` é o valor de referência do outro lado (simulado), usado para aceitar ou contrapropor.
export const newChat = (ref, msgs = []) => {
  const c = { msgs: [], proposta: null, ref, valor: null, firmadoEm: null, draft: { stars: 0, tags: [] }, myRating: null, theirRated: false, expired: false }
  msgs.forEach((m) => addMsg(c, m))
  return c
}

// Mensagem com `valor` é uma proposta e substitui a anterior.
export function addMsg(c, msg) {
  c.msgs.push(msg)
  if (msg.valor) c.proposta = { valor: msg.valor, by: msg.by }
}

export function firmar(e) {
  const c = e.chat
  c.valor = c.proposta.valor
  c.firmadoEm = Date.now()
  e.status = 'firmado'
  c.msgs.push({ by: 'sys', t: `Pedido firmado por ${money(c.valor)}. WhatsApp liberado.` })
}

export function maybeClose(e) {
  if (e.status !== 'firmado') return
  const c = e.chat
  if (Date.now() - c.firmadoEm >= DAY) c.expired = true
  if (c.expired || (c.myRating && c.theirRated)) e.status = 'concluido'
}

export const needsAction = (e) =>
  e.status === 'buscando' || (e.status === 'conversa' && e.chat.proposta?.by === 'them') || (e.status === 'firmado' && !e.chat.myRating)

export function dealStatus(e) {
  if (e.status === 'buscando') return ['Recebendo propostas', 'wait']
  if (e.status === 'conversa') return e.chat.proposta?.by === 'them' ? ['Nova proposta', 'acc'] : ['Conversando', 'ok']
  if (e.status === 'firmado') return e.chat.myRating ? ['Aguardando avaliação', 'wait'] : ['Avaliar', 'acc']
  return ['Concluído', 'done']
}
