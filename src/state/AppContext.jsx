import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from 'react'
import { PRO_REPLIES, pro } from '../data/catalog'
import { firstName } from '../lib/format'
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

  // Ações com efeitos colaterais (timers que simulam o backend / o outro lado).
  const act = useMemo(() => ({
    publish() {
      const id = Date.now()
      go('publish', id)
      setTimeout(() => go('showOffers', id), 2400)
    },
    choose(pid) {
      const p = pro(pid)
      go('choose', { pid, greeting: `Oi! Aqui é ${firstName(p)}. Confirmado, chego no horário combinado.` })
      toast(`${firstName(p)} confirmado`)
    },
    closeMatch() {
      go('closeMatch')
      toast('Avisamos quando chegarem mais propostas', 'bell')
    },
    quickReply(orderId, text) {
      go('msg', { id: orderId, msg: { me: true, t: text } })
      setTimeout(() => go('msg', { id: orderId, msg: { t: PRO_REPLIES[Math.floor(Math.random() * PRO_REPLIES.length)] } }), 900)
    },
    rate() {
      go('rate')
      toast('Avaliação enviada')
    },
    pass(id) {
      go('pass', id)
      toast('Pedido ocultado', 'eye-off')
    },
    sendProposal() {
      const key = Date.now()
      go('sendProposal', key)
      toast('Proposta enviada', 'send')
      setTimeout(() => {
        go('agendaStatus', { key, status: 'aceita' })
        toast('O cliente aceitou sua proposta', 'party')
      }, 3500)
    },
    agendaStep(item) {
      const next = item.status === 'aceita' ? 'caminho' : 'feito'
      go('agendaStatus', { key: item.key, status: next })
      if (next === 'feito') toast('Serviço concluído')
    },
  }), [go, toast])

  const value = useMemo(() => ({ state, go, act, toastMsg }), [state, go, act, toastMsg])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
