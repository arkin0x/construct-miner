import { useContext, useEffect, useState } from "react"
import { IdentityContext } from "./IdentityContext"
import { NostrIdentityContext } from "../types/NostrIdentity"
import { getMyProfile } from "../libraries/Nostr"
import { validateHash } from "../libraries/Hash"
import { MinerIntro } from "./MinerIntro"
import { Miner } from "./MinerController"
import MyConstructs from "./MyConstructs"

const MinerPage = () => {
  const { identity, setIdentityHandler } = useContext<NostrIdentityContext>(IdentityContext)
  const [ targetHash, setTargetHash ] = useState<string>('')
  const [ targetWork, setTargetWork ] = useState<number>(10)
  const [ validTargetHash, setValidTargetHash ] = useState<boolean>(false)

  // retrieve profile meta and save to context.
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const myProfile = await getMyProfile(identity.pubkey)
        setIdentityHandler(myProfile)
        console.log('Identity set from profile')
      } catch (e) {
        // @todo handle empty alby
        // @todo handle no extension
        console.log('Could not load profile.')
      }
    }
    loadProfile()
  }, [])

  const updateTargetHash = (e: React.KeyboardEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>) => {
    const newTargetHash = e.currentTarget.value.trim()
    if (validateHash(newTargetHash)) {
      setTargetHash(newTargetHash)
      setValidTargetHash(true)
      console.log('updated hash target:',newTargetHash)
    } else {
      setValidTargetHash(false)
    }
  }

  const updateTargetWork = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('update work target: ', e.currentTarget.value)
    setTargetWork(parseInt(e.currentTarget.value))
  }


  // render stuff
  const inputTargetHashClass = ['input-hash', validTargetHash ? 'valid' : 'invalid'].join(' ')

  return (
    <div id="miner">
      <MinerIntro/>
      <div className="panel">
        <label>Target Hash {validTargetHash ? ' ✅ Valid 256-bit Hash' : null}</label><br/>
        <input className={inputTargetHashClass} type="text" maxLength={64} placeholder="0000000000000000000000000000000000000000000000000000000000000000" onChange={updateTargetHash}/>
        <br/><br/>
        <label>Target Work</label><br/>
        <input className={'input'} type="number" max={256} min={1} defaultValue={10} onChange={updateTargetWork}/>

        { validTargetHash ? <Miner targetHex={targetHash} targetWork={targetWork}/> : null }
        
      </div>
      <MyConstructs/>
    </div>
  )
}

export default MinerPage