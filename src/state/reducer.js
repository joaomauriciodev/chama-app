import { DEFAULT_ROOMS, MOVING_SUBS, ROOM_SUBS, WEEK } from '../data/catalog'
import { profileToProv } from '../lib/api'
import { maskPhone } from '../lib/format'

const avail = {}
WEEK.slice(0, 5).forEach((d) => { avail[d + 'M'] = true; avail[d + 'T'] = true })
avail['SábM'] = true

// Estado de tela e rascunhos. Pedidos, conversas e avaliações vêm da API (ver lib/useApi).
export const initialState = {
  role: 'cliente', // 'cliente' | 'prestador'
  tab: 'inicio',
  flow: null, // { step, start, only, back }
  draft: null, // pedido em montagem
  sheet: null, // { type: 'pro' | 'order' | 'conv' | 'lock', id }
  search: { cat: null, sort: 'nota', q: '' },
  auth: null, // usuário logado ({ id, nome, telefone })
  login: null, // tela de entrar/criar conta ({ mode, nome, tel, senha, busy, error, after })
  signup: null, // cadastro de prestador em andamento
  prov: {
    registered: false,
    nome: null,
    tel: null,
    plan: null, // { meses, until }
    nota: 0,
    avaliacoes: 0,
    online: true,
    cats: [],
    base: null, // endereço do CEP base
    area: 'regiao', // 'bairro' | 'regiao' | 'cidade'
    avail,
  },
}

export const newAccountForm = (extra) => ({ mode: 'novo', nome: '', tel: '', senha: '', busy: false, error: null, ...extra })

// Quem já está logado pula o passo da conta.
const newSignup = (prov, auth) => ({
  ...newAccountForm({ nome: auth?.nome || '', tel: auth ? maskPhone(auth.telefone) : '' }),
  step: auth ? 1 : 0, cats: [], base: null, area: 'regiao', avail: { ...prov.avail }, plan: 6, paying: false, until: null,
})

// `pro` = { id, nome, categorias } quando o cliente chama um profissional direto.
export const newDraft = (catId = null, pro = null) => ({
  cat: catId, subs: [], qty: 1, when: null, data: null, periodo: null, addr: null, rooms: null, moveis: null, foto: false, audio: false, pro,
})

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

  switch (type) {
    // navegação
    case 'tab': s.tab = v; s.sheet = null; break
    case 'role':
      s.sheet = null
      if (v === 'prestador' && !s.prov.registered) { s.signup = newSignup(s.prov, s.auth); break }
      s.role = v; s.tab = v === 'cliente' ? 'inicio' : 'opps'
      break

    // sessão na API
    case 'openLogin': s.login = newAccountForm({ after: v || null }); s.sheet = null; break
    case 'lg': Object.assign(s.login, v); break
    case 'closeLogin': s.login = null; break
    case 'session':
      s.auth = v.user
      s.prov.nome = v.user.nome
      s.prov.tel = maskPhone(v.user.telefone)
      if (v.profile) {
        Object.assign(s.prov, profileToProv(v.profile), { registered: true })
        s.prov.plan = v.profile.planoAte ? { meses: s.prov.plan?.meses ?? null, until: v.profile.planoAte } : null
      }
      break
    case 'logout':
      s.auth = null; s.prov = structuredClone(initialState.prov)
      s.role = 'cliente'; s.tab = 'inicio'; s.sheet = null; s.signup = null; s.login = null
      break

    // cadastro do prestador
    case 'su': Object.assign(s.signup, v); break
    case 'suCat': s.signup.cats = toggle(s.signup.cats, v); break
    case 'suAvail': s.signup.avail[v] = !s.signup.avail[v]; break
    case 'suNext': s.signup.step++; s.signup.error = null; break
    case 'suBack': if (s.signup.step > (s.auth ? 1 : 0)) s.signup.step--; else s.signup = null; break
    case 'closeSignup': s.signup = null; break
    case 'suPaid': Object.assign(s.signup, { paying: false, until: v, step: 5 }); break
    case 'finishSignup': {
      const u = s.signup
      Object.assign(s.prov, {
        registered: true, cats: u.cats, base: u.base, area: u.area, avail: u.avail, plan: { meses: u.plan, until: u.until }, online: true,
      })
      s.signup = null; s.role = 'prestador'; s.tab = 'opps'
      break
    }

    // fluxo de pedido
    case 'startFlow':
      s.draft = { ...newDraft(v.cat, v.pro), ...v.prefill }
      s.flow = { step: v.step, start: v.step, only: v.only || null, back: null }
      s.sheet = null
      break
    case 'pickCat': d.cat = v; d.subs = []; d.rooms = null; d.moveis = null; s.flow.step = 1; break
    case 'toggleSub': d.subs = toggle(d.subs, v); syncDetails(d); break
    case 'moveis': d.moveis = Math.min(40, Math.max(0, d.moveis + v)); break
    case 'room': d.rooms[v.id] = Math.min(10, Math.max(0, d.rooms[v.id] + v.n)); break
    case 'qty': d.qty = Math.min(20, Math.max(1, d.qty + v)); break
    case 'toggleExtra': d[v] = !d[v]; break
    case 'when': d.when = v.label; d.data = v.data; if (!v.data) d.periodo = null; break
    case 'periodo': d.periodo = v; break
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
    // Pedido criado na API: abre o pedido (ou a conversa, se foi direto para um profissional).
    case 'published':
      s.flow = null; s.draft = null; s.tab = 'pedidos'
      s.sheet = v.conversationId ? { type: 'conv', id: v.conversationId } : { type: 'order', id: v.id }
      break

    // sheets
    case 'openPro': s.sheet = { type: 'pro', id: v }; break
    case 'openOrder': s.sheet = { type: 'order', id: v }; break
    case 'openConv': s.sheet = { type: 'conv', id: v }; break
    case 'lock': s.flow = null; s.draft = null; s.sheet = { type: 'lock', id: v }; break
    case 'closeSheet': s.sheet = null; break

    // busca
    case 'searchCat': s.search.cat = v; break
    case 'searchSort': s.search.sort = v; break
    case 'searchQ': s.search.q = v; break
    case 'clearSearch': s.search.q = ''; s.search.cat = null; break

    // perfil do prestador (salvo na API pelo AppContext)
    case 'toggleOnline': s.prov.online = !s.prov.online; break
    case 'toggleProvCat': s.prov.cats = toggle(s.prov.cats, v); break
    case 'toggleAvail': s.prov.avail[v] = !s.prov.avail[v]; break
    case 'area': s.prov.area = v; break
    case 'provBase': s.prov.base = v; break
    case 'provStats': Object.assign(s.prov, v); break
    default: return state
  }
  return s
}
