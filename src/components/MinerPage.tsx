import { useContext, useEffect, useState } from "react"
import { NostrIdentityContext } from "../types/NostrIdentity"
import { IdentityContext } from "./IdentityContext"
import { getMyProfile } from "../libraries/Nostr"
import { MinerIntro } from "./MinerIntro"
import { MinerController } from "./MinerController"
import MyConstructs from "./MyConstructs"

type ConstructMinerMessageReceive = {
  status?: string,
  highestWork: number,
  highestWorkNonce: number,
  highestCreatedAt: number,
  latestWork?: number,
  latestNonce?: number,
}

type ConstructMinerMessageSend = {
  command: 'startMining' | 'stopMining',
  data?: {
    pubkey: string,
    targetHex: string,
    targetWork: number,
  }
}

const evaluateWork = function(work: ConstructMinerMessageReceive) {
  console.log(work)
  // if (work >= targetWork) {
  //   worker.terminate();
  //   console.log('Mining finished');
  // }
}

const MinerPage = () => {
  const { identity, setIdentityHandler } = useContext<NostrIdentityContext>(IdentityContext)

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

        <MinerController/>
        
      </div>
      <MyConstructs/>
    </div>
  )
}

export default MinerPage