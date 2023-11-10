// import { useRef, useContext, useEffect, useState } from "react"
import { useRef, useEffect, useState, useReducer } from "react"
// import { IdentityContextType } from "../types/IdentityType"
// import { IdentityContext } from "../providers/IdentityProvider"
import { getConstructProofOfWork, validateHash } from "../libraries/Hash"
import { hexToBytes } from "@noble/hashes/utils"
import { MinerIntro } from "./MinerIntro"
import { Miner } from "./MinerController"
import MyConstructs from "./MyConstructs"
import '../scss/MinerPage.scss'
import { PublishedConstructsReducerAction, PublishedConstructsReducerState } from "../types/Construct"
import { getTag } from "../libraries/Nostr"

const constructsReducer = (state: PublishedConstructsReducerState, action: PublishedConstructsReducerAction) => {
  if (action.construct) {
    try {
      const binaryEventID: Uint8Array = hexToBytes(action.construct.id)
      const nonceTag = action.construct.tags.find(getTag('nonce'))
      const target = nonceTag && nonceTag[2]
      if (!target) throw new Error('no target found')
      const binaryTargetCoord: Uint8Array = hexToBytes(target)
      action.construct.workCompleted = getConstructProofOfWork(binaryTargetCoord, binaryEventID)
    } catch(e) {
      console.error('failed to parse construct nonce tag', action.construct.id, e)
      return state
    }
  }
  switch(action.type) {
    case 'add': 
      return {
        ...state,
        [action.construct.id]: action.construct
      }
    default:
      return state
  }
}

const MinerPage = () => {
  // const { identity } = useContext<IdentityContextType>(IdentityContext)
  const [ targetHash, setTargetHash ] = useState<string>('0000000000000000000000000000000000000000000000000000000000000000')
  const [ targetWork, setTargetWork ] = useState<number>(50)
  const [ validTargetHash, setValidTargetHash ] = useState<boolean>(true)
  const targetHashRef = useRef<HTMLInputElement>(null)
  const [constructs, constructsDispatch] = useReducer(constructsReducer, {})


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

  useEffect(() => {
    if (targetHashRef?.current)
    targetHashRef.current.value = targetHash
  }, [targetHash])


  // render stuff
  const inputTargetHashClass = ['input-hash', validTargetHash ? 'valid' : 'invalid'].join(' ')

  return (
    <div id="miner">
      <MinerIntro/>
      <div className="panel">
        <label>Target Coordinate {validTargetHash ? ' ✅ Valid 256-bit Coordinate' : null}</label><br/>
        <input ref={targetHashRef} className={inputTargetHashClass} type="text" maxLength={64} placeholder="0000000000000000000000000000000000000000000000000000000000000000" onChange={updateTargetHash}/>
        <br/><br/>
        <label>Target Work</label><br/>
        <input className={'input'} type="number" max={256} min={1} defaultValue={50} onChange={updateTargetWork}/>

        { validTargetHash ? <Miner targetHex={targetHash} targetWork={targetWork} existingConstructs={constructs}/> : null }
        
      </div>
      <MyConstructs constructs={constructs} updatePublishedConstructs={constructsDispatch}/>
    </div>
  )
}

export default MinerPage