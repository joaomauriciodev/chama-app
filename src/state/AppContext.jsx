import { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from 'react'
import { CLIENT_REPLIES, PRO_REPLIES } from '../data/catalog'
import { round5 } from '../lib/format'
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
      subscribe(meses) {
        go('su', { paying: true })
        const until = new Date()
        until.setMonth(until.getMonth() + meses)
        setTimeout(() => go('suPaid', until.toISOString()), 1500)
      },
    }
  }, [go, toast])

  const value = useMemo(() => ({ state, go, act, toastMsg }), [state, go, act, toastMsg])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
