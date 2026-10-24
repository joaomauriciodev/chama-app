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
import SignupFlow from './flows/SignupFlow'
import SheetHost from './sheets/Sheets'

const SCREENS = {
  inicio: Home, buscar: Search, pedidos: Orders, perfil: Profile,
  opps: Opportunities, agenda: Agenda, pperfil: ProviderProfile,
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
        {state.signup && <SignupFlow />}
        {state.sheet && <SheetHost />}
      </div>
      <Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Phone />
    </AppProvider>
  )
}
