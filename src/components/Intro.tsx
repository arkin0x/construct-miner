import { useNavigate } from 'react-router-dom'
import { NostrIdentityContext } from '../types/NostrIdentity'
import { IdentityContext } from "./IdentityContext";
import { NostrWindow } from '../types/NostrWindow'
import { useContext } from 'react'

// This declaration allows us to access window.nostr without TS errors.
// https://stackoverflow.com/a/47130953
declare global {
    interface Window {
        nostr: NostrWindow;
    }
}

const Intro = () => {

  const { setIdentityHandler } = useContext<NostrIdentityContext>(IdentityContext);
  const navigate = useNavigate()

  const viewSpec = () => {
    window.open('https://github.com/arkin0x/cyberspace', '_blank')
  }

  async function signIn() {
    const pubkey = await window.nostr?.getPublicKey()
    setIdentityHandler(pubkey)
    navigate('/miner')
  }

  return (
    <div id="intro">
      <h1>Cyberspace Construct Miner v0.1</h1>
      <p>
        Constructs are ownable plots of real estate in the Cyberspace that are 
        obtained by mining. This miner is an easy way to get started. Once you 
        own a construct, you can add Shards to it, which are arbitrary
        interactive 3D objects (coming soon).
      </p>
      <div className="actions">
        <button onClick={signIn}>Sign in with Extension to Start Mining</button>
        <button onClick={viewSpec}>Cyberspace Spec</button>
      </div>
    </div>
  )
}

export default Intro