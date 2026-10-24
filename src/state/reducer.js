import { DEFAULT_ROOMS, MOVING_SUBS, ROOM_SUBS, WEEK, demand, pro } from '../data/catalog'
import { addMsg, firmar, maybeClose, newChat } from '../lib/deal'
import { estimate, firstName, midpoint } from '../lib/format'
import { makeOffers } from '../lib/match'

const avail = {}
WEEK.slice(0, 5).forEach((d) => { avail[d + 'M'] = true; avail[d + 'T'] = true })
avail['SábM'] = true

export const initialState = {
  role: 'cliente', // 'cliente' | 'prestador'
  tab: 'inicio',
  flow: null, // { step, start, only, back }
  draft: null, // pedido em montagem
  sheet: null, // { type: 'pro' | 'order' | 'match' | 'lock', id, side? }
  match: null, // { id, phase: 'busca' | 'ofertas' }
  search: { cat: null, sort: 'nota', q: '' },
  orders: [
    {
      id: 1, cat: 'limpeza', subs: ['Residencial'], qty: 1, rooms: { quartos: 1, banheiros: 1, salas: 1, cozinhas: 0, servico: 0 },
      when: '15 set', period: 'Manhã', where: 'casa', status: 'concluido', pro: 2, preco: 120, offers: [],
      chat: { ...newChat(120), valor: 120, firmadoEm: 0, myRating: { stars: 5, tags: ['Caprichoso'] }, theirRated: true },
    },
  ],
  signup: null, // cadastro de prestador em andamento
  prov: {
    registered: false, // só vira prestador depois do cadastro + plano
    nome: null,
    tel: null,
    plan: null, // { meses, until }
    online: true,
    cats: [],
    base: null, // endereço do CEP base
    area: 'regiao', // 'bairro' | 'regiao' | 'cidade'
    avail,
    matches: [], // conversas do prestador com clientes
    hidden: [],
  },
}

const newSignup = (prov) => ({
  step: 0, nome: '', tel: '', cats: [], base: null, area: 'regiao', avail: { ...prov.avail }, plan: 6, pay: 'Pix', paying: false, until: null,
})

export const newDraft = (catId = null, proId = null) => ({
  cat: catId, subs: [], qty: 1, when: null, period: null, where: 'casa', addr: null, rooms: null, moveis: null, foto: false, audio: false, pro: proId,
})

// Abre a conversa do pedido com o profissional escolhido; a proposta inicial dele já vem no chat.
function openChat(s, o, pid) {
  const p = pro(pid)
  const f = o.offers.find((x) => x.pid === pid)
  Object.assign(o, {
    status: 'conversa',
    pro: pid,
    chat: newChat(f.preco, [
      { by: 'them', t: `Oi! Aqui é ${firstName(p)}. Vi seu pedido e posso atender.` },
      { by: 'them', t: 'Pelo que você descreveu, faço por:', valor: f.preco },
    ]),
  })
  s.match = null; s.tab = 'pedidos'; s.sheet = { type: 'order', id: o.id }
}

const entity = (s, side, id) => (side === 'cliente' ? s.orders : s.prov.matches).find((e) => e.id === +id)

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

// Limpeza residencial pede os cômodos; mudança pede os móveis grandes; o resto usa só a quantidade.
function syncDetails(d) {
  const rooms = d.subs.some((x) => ROOM_SUBS.includes(x))
  if (rooms && !d.rooms) d.rooms = { ...DEFAULT_ROOMS }
  if (!rooms) d.rooms = null
  const moving = d.subs.some((x) => MOVING_SUBS.includes(x))
  if (moving && d.moveis == null) d.moveis = 2
  if (!moving) d.moveis = null
}

export function reducer(state, { type, v }) {
  const s = structuredClone(state)
  const d = s.draft
  const order = (id) => s.orders.find((o) => o.id === +id)
  const e = v && v.side ? entity(s, v.side, v.id) : null
  if (v && v.side && !e) return state
  // Pedidos firmados há mais de 1 dia fecham sozinhos, mesmo sem avaliação.
  s.orders.forEach(maybeClose)
  s.prov.matches.forEach(maybeClose)

  switch (type) {
    // navegação
    case 'tab': s.tab = v; s.sheet = null; break
    case 'role':
      s.sheet = null
      if (v === 'prestador' && !s.prov.registered) { s.signup = newSignup(s.prov); break }
      s.role = v; s.tab = v === 'cliente' ? 'inicio' : 'opps'
      break

    // cadastro do prestador
    case 'su': Object.assign(s.signup, v); break
    case 'suCat': s.signup.cats = toggle(s.signup.cats, v); break
    case 'suAvail': s.signup.avail[v] = !s.signup.avail[v]; break
    case 'suNext': s.signup.step++; break
    case 'suBack': if (s.signup.step > 0) s.signup.step--; else s.signup = null; break
    case 'closeSignup': s.signup = null; break
    case 'suPaid': Object.assign(s.signup, { paying: false, until: v, step: 5 }); break
    case 'finishSignup': {
      const u = s.signup
      Object.assign(s.prov, {
        registered: true, nome: u.nome.trim(), tel: u.tel, cats: u.cats, base: u.base, area: u.area, avail: u.avail,
        plan: { meses: u.plan, until: u.until }, online: true,
      })
      s.signup = null; s.role = 'prestador'; s.tab = 'opps'
      break
    }

    // fluxo de pedido
    case 'startFlow': {
      // Só libera novo pedido depois que o anterior firmado foi avaliado pelos dois (ou passou 1 dia).
      const lock = s.orders.find((o) => o.status === 'firmado')
      if (lock) { s.sheet = { type: 'lock', side: 'cliente', id: lock.id }; break }
      s.draft = { ...newDraft(v.cat, v.pro), ...v.prefill }
      s.flow = { step: v.step, start: v.step, only: v.only || null, back: null }
      s.sheet = null
      break
    }
    case 'pickCat': d.cat = v; d.subs = []; d.rooms = null; d.moveis = null; s.flow.step = 1; break
    case 'toggleSub': d.subs = toggle(d.subs, v); syncDetails(d); break
    case 'moveis': d.moveis = Math.min(40, Math.max(0, d.moveis + v)); break
    case 'room': d.rooms[v.id] = Math.min(10, Math.max(0, d.rooms[v.id] + v.n)); break
    case 'qty': d.qty = Math.min(20, Math.max(1, d.qty + v)); break
    case 'toggleExtra': d[v] = !d[v]; break
    case 'when': d.when = v; if (v === 'Flexível') d.period = null; break
    case 'period': case 'where': d[type] = v; break
    case 'addr': d.addr = v ? { ...d.addr, ...v } : null; break
    case 'next':
      if (s.flow.back === 4) { s.flow.step = 4; s.flow.back = null } else s.flow.step++
      break
    case 'goto': s.flow.step = v; s.flow.start = Math.min(s.flow.start, v); s.flow.back = 4; break
    case 'back':
      if (s.flow.back === 4) { s.flow.step = 4; s.flow.back = null }
      else if (s.flow.step > s.flow.start) s.flow.step--
      else { s.flow = null; s.draft = null }
      break
    case 'closeFlow': s.flow = null; s.draft = null; break
    case 'publish': {
      const o = { id: v, ...d, status: 'buscando', est: estimate(d), chat: null }
      o.offers = makeOffers(o)
      s.orders.unshift(o)
      s.flow = null; s.draft = null
      // Pedido direto: o cliente já escolheu o profissional, então a conversa abre na hora.
      if (o.pro) openChat(s, o, o.pro)
      else s.match = { id: v, phase: 'busca' }
      break
    }

    // match e pedidos
    case 'showOffers': if (s.match && s.match.id === v) s.match.phase = 'ofertas'; break
    case 'chooseOffer': openChat(s, order(s.match.id), v); break
    case 'closeMatch': s.match = null; s.tab = 'pedidos'; break
    case 'seeOffers': s.sheet = null; s.match = { id: v, phase: 'ofertas' }; break

    // conversa, acordo e avaliação (v.side: 'cliente' | 'prestador')
    case 'chatMsg': if (e.status !== 'conversa') return state; addMsg(e.chat, v.msg); break
    case 'firmar':
      if (e.status !== 'conversa' || !e.chat.proposta) return state
      firmar(e)
      e.preco = e.chat.valor
      break
    case 'rStar': e.chat.draft.stars = v.n; break
    case 'rTag': e.chat.draft.tags = toggle(e.chat.draft.tags, v.t); break
    case 'rate': e.chat.myRating = e.chat.draft; maybeClose(e); break
    case 'theyRated': e.chat.theirRated = true; maybeClose(e); break
    case 'expire': e.chat.expired = true; maybeClose(e); break

    // sheets
    case 'openPro': s.sheet = { type: 'pro', id: v }; break
    case 'openOrder': s.sheet = { type: 'order', id: v }; break
    case 'openMatch': s.sheet = { type: 'match', id: v }; break
    case 'closeSheet': s.sheet = null; break

    // busca
    case 'searchCat': s.search.cat = v; break
    case 'searchSort': s.search.sort = v; break
    case 'searchQ': s.search.q = v; break
    case 'clearSearch': s.search.q = ''; s.search.cat = null; break

    // prestador
    case 'toggleOnline': s.prov.online = !s.prov.online; break
    case 'pass': s.prov.hidden.push(v); break
    case 'startChat': {
      const lock = s.prov.matches.find((m) => m.status === 'firmado')
      if (lock) { s.sheet = { type: 'lock', side: 'prestador', id: lock.id }; break }
      const dd = demand(v.did)
      s.prov.matches.unshift({
        id: v.id, d: dd, status: 'conversa',
        chat: newChat(midpoint(dd.est), [{ by: 'sys', t: `Você abriu uma conversa com ${dd.cliente} sobre este pedido.` }]),
      })
      s.prov.hidden.push(dd.id)
      s.sheet = { type: 'match', id: v.id }
      break
    }
    case 'toggleProvCat': s.prov.cats = toggle(s.prov.cats, v); break
    case 'toggleAvail': s.prov.avail[v] = !s.prov.avail[v]; break
    case 'area': s.prov.area = v; break
    case 'provBase': s.prov.base = v; break
    default: return state
  }
  return s
}
