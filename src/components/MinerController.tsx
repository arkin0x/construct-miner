import { useContext, useEffect, useState } from "react"
import { hexToBytes } from "@noble/hashes/utils"
import { IdentityContextType } from "../types/IdentityType"
import { IdentityContext } from "../providers/IdentityProvider"
import { MinerMessage, WORKER_COUNT, BATCH_SIZE, serializeEvent, getNonceBounds, calculateHashrate, convertNumberToUint8Array, MinerCommand } from "../libraries/Miner"
import { encoder, decoder, uint8ToHex } from "../libraries/Hash"
import Worker from '../workers/ConstructMiner.worker?worker'
import { UnsignedEvent, getEventHash, validateEvent, verifySignature } from "nostr-tools"
import { signEvent } from "../libraries/NIP-07"
import { UnpublishedConstructType } from "../types/Construct"
import { UnpublishedConstruct } from "./Construct"

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

export const Miner = ({targetHex, targetWork}: MinerProps) => {
  const { identity } = useContext<IdentityContextType>(IdentityContext)
  const [ miningActive, setMiningActive ] = useState<boolean>(false)
  // nonce could be used to "resume" mining after a refresh; perhaps it would be loaded from localstorage, but this is not yet implemented.
  const [ nonce, setNonce ] = useState<number>(0)
  const [ workers, setWorkers ] = useState<Worker[]>([])
  const [ constructs, setConstructs ] = useState<UnpublishedConstructType[]>([])

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
      setConstructs(JSON.parse(storedConstructs))
    }
  }, [])

  // when constructs is updated via updateConstructs, save to localstorage
  const updateConstructs = (construct: UnpublishedConstructType) => {
    setConstructs([...constructs, construct])
    localStorage.setItem('constructs', JSON.stringify(constructs))
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
      nonceBounds,
      work,
    } = msg.data

    const prefix = binaryEvent.slice(0, nonceBounds[0])
    const nonceBytes = binaryEvent.slice(nonceBounds[0], nonceBounds[1])
    const suffix = binaryEvent.slice(nonceBounds[1])

    const decodedPrefix = decoder.decode(prefix)
    const decodedSuffix = decoder.decode(suffix)
    const decodedNonceBytes: string[] = []

    // decode nonce bytes
    nonceBytes.forEach(b => {
      decodedNonceBytes.push(String.fromCharCode(b))
    })

    // console.log(decodedPrefix)
    // console.log(decodedNonceBytes)
    // console.log(decodedSuffix)
    // console.log('///////////////////////////////////////////////////')

    // gather other data about the construct to show to user

    // work - the inverse hamming distance between the target and the hash of the event

    // replace nonce placeholder in event:

    event.tags[0][1] = decodedNonceBytes.join('')

    // make sure our hash is correct. If this throws, there is a fundamental error with the application.
    const ours = uint8ToHex(hash)
    const theirs = getEventHash(event)

    if (ours !== theirs) {
      console.log(ours,'ours')
      console.log(theirs,'theirs')
      throw new Error('hash mismatch')
    } else {
      // we will do this later actually
      // event.id = ours
      // event.sig = signEvent(event)
    }

    if (!validateEvent(event)){
      console.log(event)
      throw new Error('invalid event')
    }
    // if (!verifySignature(event)) {
    //   console.log(event)
    //   throw new Error('invalid signature')
    // }

    // all good

    const construct: UnpublishedConstructType = {
      readyForSignature: event,
      workCompleted: work,
      createdAt,
      id: ours,
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
          batch: workerNonce + BATCH_SIZE,
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
    return constructs.map(c => {
      return <UnpublishedConstruct key={c.id} construct={c} />
    })
  }

  return (
    <>
      <><br/><br/>{ miningActive ? <button onClick={stopMining}>Stop Mining 🛑</button> : <button onClick={startMining}>Start Mining ▶</button>}</>
      <hr/>
      {showConstructs()}
    </>
  )

}