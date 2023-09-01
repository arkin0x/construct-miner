import { useContext, useEffect, useReducer, useState } from "react"
import { hexToBytes } from "@noble/hashes/utils"
import { IdentityContextType } from "../types/IdentityType"
import { IdentityContext } from "../providers/IdentityProvider"
import { MinerMessage, WORKER_COUNT, BATCH_SIZE, serializeEvent, getNonceBounds, MinerCommand } from "../libraries/Miner"
import { encoder, decoder } from "../libraries/Hash"
import Worker from '../workers/ConstructMiner.worker?worker'
import { Event, validateEvent } from "nostr-tools"
// import { signEvent } from "../libraries/NIP-07"
import { UnpublishedConstructType } from "../types/Construct"
import { UnpublishedConstruct } from "./Construct"
import { bytesToHex } from "@noble/hashes/utils"
import ConstructViewer from "./ConstructViewer"
import '../scss/MinedConstructs.scss'

/**
 * export start mining
 * export stop mining
 * show mining status
 * show mining hashrate
 * reveal mined constructs & save to localStorage
 * 
 */

type MinerProps = {
  targetHex: string
  targetWork: number
}

type ConstructsReducerState = {
  [key: string]: UnpublishedConstructType
}
type ConstructsReducerAction = {
  type: 'add',
  construct: UnpublishedConstructType
}

const constructsReducer = (state: ConstructsReducerState, action: ConstructsReducerAction) => {
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

export const Miner = ({targetHex, targetWork}: MinerProps) => {
  const { identity } = useContext<IdentityContextType>(IdentityContext)
  const [ miningActive, setMiningActive ] = useState<boolean>(false)
  // nonce could be used to "resume" mining after a refresh; perhaps it would be loaded from localstorage, but this is not yet implemented.
  // const [ nonce, setNonce ] = useState<number>(0)
  const [ workers, setWorkers ] = useState<Worker[]>([])
  const [constructs, constructsDispatch] = useReducer(constructsReducer, {})
  const [selectedUnpublishedConstruct, setSelectedUnpublishedConstruct] = useState<UnpublishedConstructType | null>(null)

  // set up worker and listener
  useEffect(() => {
    const workers: Worker[] = []
    for (let i = 0; i < WORKER_COUNT; i++) {
      const worker = new Worker()
      worker.onmessage = onWorkerResponse 
      workers.push(worker)
    }
    setWorkers(workers)
    return () => {
      workers.forEach(w => w.terminate())
    }
  }, [])
    
  // load constructs from localstorage on load
  useEffect(() => {
    const storedConstructs = localStorage.getItem('constructs')
    if (storedConstructs) {
      const parsedConstructs = JSON.parse(storedConstructs) as {[key: string]: UnpublishedConstructType}
      Object.keys(parsedConstructs).forEach(key => {
        constructsDispatch({type: 'add', construct: parsedConstructs[key]})
      })
    }
  }, [])

  // save any new constructs to localstorage
  useEffect(() => {
    localStorage.setItem('constructs', JSON.stringify(constructs))
  }, [constructs])

  // when constructs is updated via updateConstructs, save to localstorage
  const updateConstructs = (construct: UnpublishedConstructType) => {
    constructsDispatch({type: 'add', construct})
  }

  const onWorkerResponse = (message: MessageEvent) => {
    const { status, data } = message.data as MinerMessage
    switch (status) {
      case 'stopped':
        console.log('construct mining stopped')
        setMiningActive(false)
        break
      case 'error':
        console.warn('construct mining error:',data)
        setMiningActive(false)
        break
      case 'heartbeat':
        // console.log('construct mining heartbeat:',data,'hashrate: '+calculateHashrate(data.duration || 0)+' H/s')
        break
      case 'newhigh':
        // console.log('construct mining new high:',data)
        evaluateWork(message.data)
        break
      case 'complete':
        console.log('construct mined:',data)
        setMiningActive(false)
        break
      default:
        console.warn('unknown construct mining status:',status)
    }
  }

  // receive new work from worker and evaluate
  const evaluateWork = (msg: MinerMessage) => {
    // we need to decode the rest of the message separately from the nonce bytes because the nonce bytes will be replaced with a replacement character (65533) when decoded as utf-8, which is incorrect

    const { 
      binaryEvent,
      createdAt,
      event,
      hash,
      // nonceBounds,
      work,
    } = msg.data

    const eventWithID = event as Event<37515>

    const decoded = JSON.parse(decoder.decode(binaryEvent))
    eventWithID.tags[0][1] = decoded[4][0][1] 
    const id = bytesToHex(hash)
    eventWithID.id = id
    console.log(work, eventWithID)
    if (!validateEvent(eventWithID)){
      // console.log()
      throw new Error('invalid event')
    }

    // if (!verifySignature(event)) {
    //   console.log(event)
    //   throw new Error('invalid signature')
    // }

    // all good

    const construct: UnpublishedConstructType = {
      readyForSignature: eventWithID,
      workCompleted: work,
      createdAt,
      id,
    }

    updateConstructs(construct)

  }

  // worker functions
  const postMessageToWorkers = (message: MinerCommand) => {
    workers.forEach(w => {
      w.postMessage(message)
    })
  }

  const startMining = () => {
    setMiningActive(true)
    const createdAt = Math.round(Date.now() / 1000)
    const nonceBytes = "0000000000000000"
    const event = {
      kind: 331,
      created_at: createdAt,
      tags: [["nonce",nonceBytes,targetHex]],
      content: '',
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      pubkey: identity!.pubkey,
    }
    const serializedEvent = serializeEvent(event)
    const nonceBounds = getNonceBounds(serializedEvent) // NOTE: These bounds would potentially be invalid if the seraialized event contains characters that are encoded to mulitple bytes in utf-8. This is not currently the case as constructs are pretty minimal, but it is something to be aware of.
    const binaryEvent = encoder.encode(serializedEvent)
    const binaryTarget = hexToBytes(targetHex)

    // dispatch a job to each worker where the nonce is incremented by the batch size
    // send the nonce, binaryEvent, binaryTarget, nonceBounds, and createdAt
    workers.forEach((worker,index) => {
      const workerNonce = index * BATCH_SIZE

      // need to convert this worker's nonce into a Uint8Array representing characters 48-63
      const nonce = workerNonce.toString(16).split('').map(c => {
        return String.fromCharCode(parseInt(c,16) + 48)
      }).join('')
      // pad left so the resulting string is 16 characters
      const padded = nonce.padStart(16,'0')
      // convert the string to Uint8Array
      const uint8 = encoder.encode(padded)

      const workerBinaryEvent = binaryEvent.slice()

      for ( let byte = 0; byte < 12; byte++ ) {
        workerBinaryEvent[nonceBounds[0] + byte] = uint8[byte] // replace nonce bytes in binary event
      }

      const message = {
        command: "startmining",
        data: {
          batch: workerNonce + BATCH_SIZE - 1, // this is the end nonce for the worker
          binaryEvent: workerBinaryEvent,
          binaryTarget,
          createdAt,
          event: event,
          nonceBounds,
          nonceStart: workerNonce,
          targetWork,
          workerNumber: index,
        }
      }
      worker.postMessage(message)
    })
  }

  const stopMining = () => {
    postMessageToWorkers({
      command: 'stopmining',
    })
    setMiningActive(false)
  }

  const showConstructs = () => {
    const mined = <h1>Mined Constructs</h1>
    return [mined, Object.values(constructs).sort((a,b) => {
      // sort by highest proof of work
      return b.workCompleted - a.workCompleted
    }).map(c => {
      return <UnpublishedConstruct key={c.id} construct={c} onClick={setSelectedUnpublishedConstruct} />
    })]
  }

  return (
    <>
      <><br/><br/>{ miningActive ? <button onClick={stopMining}>Stop Mining 🛑</button> : <button onClick={startMining}>Start Mining ▶</button>}</>
      <br/><br/>
      <hr style={{borderColor: "#fff6", borderStyle: "dotted", borderTopWidth: "6px", borderBottomWidth: "0px"}}/>
      {/* create a css grid layout where the left column scrolls with the rendered constructs and the right column is a full viewport for the constructviewer component */}
      <div className="grid grid-cols-2">
        <div className="overflow-y-scroll h-screen">
          {showConstructs()}
        </div>
        <div className="h-screen">
          { selectedUnpublishedConstruct ? <ConstructViewer constructSize={selectedUnpublishedConstruct.workCompleted} hexLocation={selectedUnpublishedConstruct.id} /> : null }
        </div>
      </div>
    </>
  )

}