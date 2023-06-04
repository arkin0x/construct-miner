import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NostrIdentity, validateNostrIdentity } from './types/NostrIdentity'
import { IdentityContext } from "./components/IdentityContext"
import Home from './components/Home'
import Miner from './components/Miner'
import { defaultProfile } from './libraries/Nostr'

function App() {

  const [identity, setIdentity] = useState<NostrIdentity>(defaultProfile)

  const setIdentityHandler = (id: NostrIdentity) => {
    const profile = Object.assign({}, defaultProfile, id)
    setIdentity(profile)
  }

  return (
    <div id="app">
      <IdentityContext.Provider value={{identity, setIdentityHandler}}>
        <Router>
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/miner" element={<Miner/>}/>
          </Routes>
        </Router>
      </IdentityContext.Provider>
    </div>
  )
}

export default App
