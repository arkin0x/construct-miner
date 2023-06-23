import { NostrWindow } from '../types/NostrWindow'
import { ConstructHolo } from './ConstructLogo'
import { SignInButton } from './SignInButton'
// import logo from '../assets/construct.svg'

// This declaration allows us to access window.nostr without TS errors.
// https://stackoverflow.com/a/47130953
declare global {
    interface Window {
        nostr: NostrWindow;
    }
}

const Intro = () => {

  const viewSpec = () => {
    window.open('https://github.com/arkin0x/cyberspace', '_blank')
  }

  return (
    <div id="intro">
      {/* <div className="logo"><img src={logo}/></div> */}
      <div className="logo"><ConstructHolo/></div>
      <h1 className="intro-title"><span className="highlight-purple jp alone">オノセンダイ</span> <span className="highlight-pink">Cyberspace Construct Miner</span> v0.1</h1>
      <p>
        Constructs are ownable plots of 3D space in Cyberspace that are 
        obtained by mining. This miner is an easy way to get started. Once you 
        own a construct, you can add Shards to it, which are arbitrary
        interactive 3D objects (coming soon).
      </p>
      <div className="actions">
        <SignInButton/>
        <button onClick={viewSpec}>Cyberspace Spec</button>
      </div>
    </div>
  )
}

export default Intro