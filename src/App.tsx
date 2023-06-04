import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { NostrIdentity } from './types/NostrIdentity'
import { IdentityContext } from "./components/IdentityContext"
import Home from './components/Home'
import Miner from './components/Miner'
import { defaultProfile } from './libraries/Nostr'

function App() {

  const navigate = useNavigate();

  const [identity, setIdentity] = useState<NostrIdentity>(defaultProfile)

  const setIdentityHandler = (id: NostrIdentity) => {
    const profile = Object.assign({}, defaultProfile, id)
    setIdentity(profile)
  }

  // This effect will be called once the App component is mounted, thus it will navigate to the root
  useEffect(() => {
    if (identity.pubkey === defaultProfile.pubkey) {
      navigate('/')
    }
  }, [identity])


  return (
    <div id="app">
      <IdentityContext.Provider value={{identity, setIdentityHandler}}>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/miner" element={<Miner/>}/>
        </Routes>
      </IdentityContext.Provider>
    </div>
  )
}

export default App
