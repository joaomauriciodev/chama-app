import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { CLIENT_REPLIES, PRO_REPLIES } from '../data/catalog'
import { api, getProfile, provToBody, session } from '../lib/api'
import { firstName, round5 } from '../lib/format'
import { initialState, reducer } from './reducer'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [toastMsg, setToastMsg] = useState(null)
  const toastTimer = useRef()

  const go = useCallback((type, v) => dispatch({ type, v }), [])

  const toast = useCallback((text, icon = 'check') => {
    setToastMsg({ text, icon, key: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400)
  }, [])

  // Ações com efeitos colaterais. Os timers simulam o outro lado da conversa até existir backend.
  const act = useMemo(() => {
    const say = (side, id, msg, ms) => setTimeout(() => go('chatMsg', { side, id, msg: { by: 'them', ...msg } }), ms)
    const pick = (list) => list[Math.floor(Math.random() * list.length)]
    const firmar = (side, id) => {
      go('firmar', { side, id })
      toast(side === 'cliente' ? 'Pedido firmado! WhatsApp liberado' : 'Pedido firmado! Seu WhatsApp foi liberado', 'party')
    }
    return {
      publish() {
        const id = Date.now()
        go('publish', id)
        setTimeout(() => go('showOffers', id), 2400)
      },
      closeMatch() {
        go('closeMatch')
        toast('Avisamos quando chegarem mais propostas', 'bell')
      },
      startChat(did) {
        const id = Date.now()
        go('startChat', { did, id })
        say('prestador', id, { t: 'Oi! Que bom que você topou. Qual valor você faz?' }, 900)
      },
      send(side, id, t) {
        go('chatMsg', { side, id, msg: { by: 'me', t } })
        say(side, id, { t: pick(side === 'cliente' ? PRO_REPLIES : CLIENT_REPLIES) }, 900)
      },
      // O outro lado aceita se o valor estiver perto da referência dele; senão contrapropõe no meio do caminho.
      propose(side, id, valor, ref) {
        go('chatMsg', { side, id, msg: { by: 'me', t: 'Minha proposta:', valor } })
        const ok = side === 'cliente' ? valor >= ref * 0.9 : valor <= ref * 1.1
        setTimeout(() => {
          if (ok) {
            go('chatMsg', { side, id, msg: { by: 'them', t: 'Fechado! Aceito.' } })
            firmar(side, id)
          } else {
            const c = round5((valor + ref) / 2)
            go('chatMsg', { side, id, msg: { by: 'them', t: 'Consigo fechar por:', valor: c } })
          }
        }, 1300)
      },
      accept: firmar,
      rate(side, id) {
        go('rate', { side, id })
        toast('Avaliação enviada')
        setTimeout(() => go('theyRated', { side, id }), 2500)
      },
      pass(id) {
        go('pass', id)
        toast('Pedido ocultado', 'eye-off')
      },
      // Passo da conta no cadastro: cria a conta ou entra numa existente.
      async account(u) {
        go('su', { busy: true, error: null })
        try {
          const login = u.mode === 'entrar'
          const res = await api(login ? '/auth/login' : '/auth/register', {
            method: 'POST',
            body: login ? { telefone: u.tel, senha: u.senha } : { nome: u.nome.trim(), telefone: u.tel, senha: u.senha },
          })
          session.set(res.token)
          const profile = login ? await getProfile() : null
          go('session', { user: res.user, profile })
          if (profile) {
            go('closeSignup')
            go('role', 'prestador')
            toast(`Bem-vindo de volta, ${firstName(res.user)}`)
          } else {
            go('su', { busy: false, step: 1, nome: res.user.nome, senha: '' })
          }
        } catch (err) {
          go('su', { busy: false, error: err.message })
        }
      },
      // Pagamento do plano ainda é simulado; o cadastro de serviços vai para a API.
      async subscribe(u) {
        go('su', { paying: true, error: null })
        await new Promise((r) => setTimeout(r, 1500))
        try {
          await api('/me/provider', { method: 'PUT', body: provToBody({ ...u, online: true }) })
          const until = new Date()
          until.setMonth(until.getMonth() + u.plan)
          go('suPaid', until.toISOString())
        } catch (err) {
          go('su', { paying: false, error: err.message })
        }
      },
      logout() {
        session.set(null)
        go('logout')
        toast('Você saiu da conta')
      },
    }
  }, [go, toast])

  // Restaura a sessão salva ao abrir o app.
  useEffect(() => {
    if (!session.get()) return
    Promise.all([api('/me'), getProfile()])
      .then(([user, profile]) => go('session', { user, profile }))
      .catch(() => {})
  }, [go])

  // Salva na API cada alteração do cadastro de serviços feita no perfil (com pequena espera entre toques).
  const saved = useRef(null)
  const { prov, auth } = state
  const body = prov.registered && auth ? JSON.stringify(provToBody(prov)) : null
  useEffect(() => {
    if (!body) { saved.current = null; return }
    if (saved.current === null) { saved.current = body; return } // recém carregado ou cadastrado: já está na API
    if (body === saved.current) return
    const b = JSON.parse(body)
    if (!b.categorias.length || !b.disponibilidade.length) return
    const t = setTimeout(() => {
      api('/me/provider', { method: 'PUT', body: b })
        .then(() => { saved.current = body })
        .catch((err) => toast(err.message, 'bell'))
    }, 700)
    return () => clearTimeout(t)
  }, [body, toast])

  const value = useMemo(() => ({ state, go, act, toastMsg }), [state, go, act, toastMsg])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
