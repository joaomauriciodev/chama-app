import { AppProvider, useApp } from './state/AppContext'
import { TabBar, Toast, useEscape } from './components/Shell'
import Home from './screens/client/Home'
import Search from './screens/client/Search'
import Orders from './screens/client/Orders'
import Profile from './screens/client/Profile'
import Opportunities from './screens/provider/Opportunities'
import Agenda from './screens/provider/Agenda'
import ProviderProfile from './screens/provider/ProviderProfile'
import RequestFlow from './flows/RequestFlow'
import MatchOverlay from './flows/MatchOverlay'
import SheetHost from './sheets/Sheets'

const SCREENS = {
  inicio: Home, buscar: Search, pedidos: Orders, perfil: Profile,
  opps: Opportunities, agenda: Agenda, pperfil: ProviderProfile,
}

function Aside() {
  return (
    <aside className="side">
      <p className="logo">chama<span className="dot" /></p>
      <p>Protótipo navegável de um app que liga quem precisa de um serviço a profissionais por perto. Quase tudo é toque: um pedido completo sai em cerca de seis toques, sem digitar nada.</p>
      <h2>Experimente</h2>
      <ol>
        <li><b>Peça uma montagem</b> pela tela inicial e escolha uma das propostas.</li>
        <li><b>Converse com toques</b> no pedido confirmado, depois avance o status e avalie.</li>
        <li><b>Troque para Trabalhar</b> no topo e envie uma proposta como prestador.</li>
        <li><b>Busque e chame</b> um profissional direto pela aba Buscar.</li>
      </ol>
    </aside>
  )
}

function Phone() {
  const { state } = useApp()
  useEscape()
  const Screen = SCREENS[state.tab]
  return (
    <div id="phone">
      <div id="view">
        <Screen key={state.tab} />
        <TabBar />
        {state.flow && <RequestFlow />}
        {state.match && <MatchOverlay />}
        {state.sheet && <SheetHost />}
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <div className="stage">
        <Aside />
        <Phone />
      </div>
    </AppProvider>
  )
}
