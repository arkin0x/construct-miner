import { useContext, useEffect, useState } from "react"
import { NostrIdentityContext } from "../types/NostrIdentity"
import { IdentityContext } from "./IdentityContext"
import { getMyProfile } from "../libraries/Nostr"
import MyConstructs from "./MyConstructs"
import { validateHash } from "../libraries/Hash"
import Worker from '../workers/ConstructMiner.worker?worker'

type ConstructMinerMessageReceive = {
  debug?: string,
  highestWork: number,
  highestWorkNonce: number,
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

const Miner = () => {
  const { identity, setIdentityHandler } = useContext<NostrIdentityContext>(IdentityContext)
  const [workerInstance, setWorkerInstance] = useState<Worker|null>(null);
  const [ targetHash, setTargetHash ] = useState<string>('')
  const [ targetWork, setTargetWork ] = useState<number>(0)
  const [ validTargetHash, setValidTargetHash ] = useState<boolean>(false)
  const [ miningActive, setMiningActive ] = useState<boolean>(false)

  // set up worker and listener
  useEffect(() => {
    const worker = new Worker();
    setWorkerInstance(worker)
    worker.onmessage = (message) => {
      // @todo remove this log, debug only
      evaluateWork(message.data as ConstructMinerMessageReceive)
    }
    return () => {
      worker.terminate()
    }
  }, []);

  // retrieve profile meta and save to context.
  useEffect(() => {
    const loadProfile = async () => {
      const myProfile = await getMyProfile(identity.pubkey)
      setIdentityHandler(myProfile)
    }
    loadProfile()
  }, [identity])

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
    setTargetWork(parseInt(e.currentTarget.value))
  }

  // worker functions
  const postMessageToWorker = (message: ConstructMinerMessageSend) => {
    if (workerInstance) {
      workerInstance.postMessage(message)
    }
  }

  const startMining = () => {
    postMessageToWorker({
      command: 'startMining',
      data: {
        pubkey: identity.pubkey,
        targetHex: targetHash,
        targetWork: targetWork,
      }
    })
    setMiningActive(true)
  }

  const stopMining = () => {
    postMessageToWorker({
      command: 'stopMining',
    })
    setMiningActive(false)
  }

  // render stuff
  const inputTargetHashClass = ['input-hash', validTargetHash ? 'valid' : 'invalid'].join(' ')

  return (
    <div id="miner">
      <h1>Construct Miner</h1>
      <h2>Welcome {identity.nip05}</h2>
      <p>Your pubkey: {identity.pubkey}</p>
      <div className="panel">
        <label>Target Hash {validTargetHash ? ' - Valid 256-bit Hash' : null}</label><br/>
        <input className={inputTargetHashClass} type="text" maxLength={64} placeholder="0000000000000000000000000000000000000000000000000000000000000000" onChange={updateTargetHash}/>
        <br/><br/>
        <label>Target Work</label><br/>
        <input className={'input'} type="number" max={256} min={1} defaultValue={10} onChange={updateTargetWork}/>
        
        { validTargetHash ? <><br/><br/>{ miningActive ? <button onClick={stopMining}>Stop Mining 🛑</button> : <button onClick={startMining}>Start Mining ▶</button>}</> : null}
      </div>
      <MyConstructs/>
    </div>
  )
}

export default Miner