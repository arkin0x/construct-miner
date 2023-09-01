import { Routes, Route } from 'react-router-dom'
import { IdentityProvider } from '../providers/IdentityProvider.tsx'
import { Home } from './Home.tsx'
import { Login } from './Login.tsx'
import MinerPage from './MinerPage.tsx'
import '../scss/App.scss'

function App() {

  return (
    <div id="app">
        <IdentityProvider>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/miner" element={<MinerPage/>}/>
          </Routes>
        </IdentityProvider>
    </div>
  )
}

export default App
