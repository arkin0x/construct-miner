import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { NostrIdentity, validateNostrIdentity } from './types/NostrIdentity'
import { IdentityContext } from "./components/IdentityContext"
import Home from './components/Home'
import Miner from './components/Miner'

function App() {

  const [identity, setIdentity] = useState<NostrIdentity>(null)

  const setIdentityHandler = (pubkey: string) => {
    if( !validateNostrIdentity(pubkey) ) throw new Error('Invalid identity')
    setIdentity(pubkey)
    console.log(identity)
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
