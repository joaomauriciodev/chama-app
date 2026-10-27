import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { api, getProfile, provToBody, session } from '../lib/api'
import { estimate, firstName } from '../lib/format'
import { initialState, reducer } from './reducer'

const AppContext = createContext(null)

// Corpo de POST /orders a partir do rascunho do pedido.
const orderBody = (d) => ({
  categoria: d.cat,
  subs: d.subs,
  qty: d.qty,
  rooms: d.rooms,
  moveis: d.moveis,
  data: d.data,
  periodo: d.data ? d.periodo : null,
  foto: d.foto,
  audio: d.audio,
  cep: d.addr.cep,
  numero: d.addr.numero,
  ...(d.addr.complemento ? { complemento: d.addr.complemento } : {}),
  est: estimate(d),
  ...(d.pro ? { prestadorId: d.pro.id } : {}),
})

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const stateRef = useRef(state)
  stateRef.current = state
  const [toastMsg, setToastMsg] = useState(null)
  const [rev, setRev] = useState(0) // muda após cada ação para os dados da API recarregarem
  const toastTimer = useRef()

  const go = useCallback((type, v) => dispatch({ type, v }), [])
  const refresh = useCallback(() => setRev((n) => n + 1), [])

  const toast = useCallback((text, icon = 'check') => {
    setToastMsg({ text, icon, key: Date.now() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(null), 2600)
  }, [])

  const act = useMemo(() => {
    // Erro de trava (pedido firmado ainda sem fechar) abre o aviso; os outros viram toast.
    const fail = (err) => {
      if (err.code === 'pendente' && err.conversationId) go('lock', err.conversationId)
      else toast(err.message, 'bell')
    }

    // Cria a conta ou entra; devolve o perfil de prestador, se existir.
    const authenticate = async (f) => {
      const login = f.mode === 'entrar'
      const res = await api(login ? '/auth/login' : '/auth/register', {
        method: 'POST',
        body: login ? { telefone: f.tel, senha: f.senha } : { nome: f.nome.trim(), telefone: f.tel, senha: f.senha },
      })
      session.set(res.token)
      const profile = login ? await getProfile() : null
      go('session', { user: res.user, profile })
      refresh()
      return { user: res.user, profile }
    }

    const publish = async (d) => {
      if (!session.get()) return go('openLogin', 'publish') // token: já vale logo após o login, antes de re-renderizar
      try {
        const res = await api('/orders', { method: 'POST', body: orderBody(d) })
        go('published', res)
        refresh()
        toast(res.conversationId ? `Pedido enviado para ${firstName(d.pro)}` : 'Pedido publicado para os profissionais da região')
      } catch (err) {
        fail(err)
      }
    }

    const call = async (fn, ok) => {
      try {
        const out = await fn()
        refresh()
        if (ok) toast(ok)
        return out
      } catch (err) {
        fail(err)
        return null
      }
    }

    return {
      refresh,
      publish,
      // Tela de entrar/criar conta aberta por uma ação que exige login.
      async login(f) {
        go('lg', { busy: true, error: null })
        try {
          const { user } = await authenticate(f)
          go('closeLogin')
          toast(`Olá, ${firstName(user)}!`)
          if (f.after === 'publish' && stateRef.current.draft) publish(stateRef.current.draft)
        } catch (err) {
          go('lg', { busy: false, error: err.message })
        }
      },
      // Passo da conta no cadastro de prestador.
      async account(u) {
        go('su', { busy: true, error: null })
        try {
          const { user, profile } = await authenticate(u)
          if (profile) {
            go('closeSignup')
            go('role', 'prestador')
            toast(`Bem-vindo de volta, ${firstName(user)}`)
          } else {
            go('su', { busy: false, step: 1, nome: user.nome, senha: '' })
          }
        } catch (err) {
          go('su', { busy: false, error: err.message })
        }
      },
      // Salva o cadastro de serviços e ativa o plano. O pagamento ainda não é cobrado (integração pendente).
      async subscribe(u) {
        go('su', { paying: true, error: null })
        try {
          await api('/me/provider', { method: 'PUT', body: provToBody({ ...u, online: true }) })
          const profile = await api('/me/provider/plan', { method: 'POST', body: { meses: u.plan } })
          go('suPaid', profile.planoAte)
          refresh()
        } catch (err) {
          go('su', { paying: false, error: err.message })
        }
      },
      logout() {
        session.set(null)
        go('logout')
        refresh()
        toast('Você saiu da conta')
      },
      // Prestador escolhe um pedido do feed: abre a conversa.
      async startChat(orderId) {
        const res = await call(() => api(`/orders/${orderId}/conversations`, { method: 'POST' }))
        if (res) go('openConv', res.id)
      },
      hide: (orderId) => call(() => api(`/provider/feed/${orderId}/hide`, { method: 'POST' }), 'Pedido ocultado'),
      send: (id, texto) => call(() => api(`/conversations/${id}/messages`, { method: 'POST', body: { texto } })),
      propose: (id, valor) => call(() => api(`/conversations/${id}/messages`, { method: 'POST', body: { valor } }), 'Proposta enviada'),
      accept: (id, papel) => call(
        () => api(`/conversations/${id}/accept`, { method: 'POST' }),
        papel === 'cliente' ? 'Pedido firmado! WhatsApp liberado' : 'Pedido firmado! O cliente recebeu seu WhatsApp',
      ),
      rate: (id, rating) => call(() => api(`/conversations/${id}/rating`, { method: 'POST', body: rating }), 'Avaliação enviada'),
    }
  }, [go, toast, refresh])

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
        .then(() => { saved.current = body; refresh() })
        .catch((err) => toast(err.message, 'bell'))
    }, 700)
    return () => clearTimeout(t)
  }, [body, toast, refresh])

  const value = useMemo(() => ({ state, go, act, toastMsg, rev }), [state, go, act, toastMsg, rev])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
