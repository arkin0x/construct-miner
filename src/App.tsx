import { Routes, Route } from 'react-router-dom'
import { IdentityProvider } from './providers/IdentityProvider.tsx'
import { Home } from './components/Home'
import { Login } from './components/Login'
import './scss/App.scss'
import MinerPage from './components/MinerPage.tsx'

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
