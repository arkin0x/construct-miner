import { useContext, useEffect, useState } from "react"
import { hexToBytes } from "@noble/hashes/utils"
import { IdentityContextType } from "../types/IdentityType"
import { IdentityContext } from "../providers/IdentityProvider"
import { MinerMessage, WORKER_COUNT, BATCH_SIZE, serializeEvent, getNonceBounds, calculateHashrate, convertNumberToUint8Array, MinerCommand } from "../libraries/Miner"
import { encoder, decoder } from "../libraries/Hash"
import Worker from '../workers/ConstructMiner.worker?worker'

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
  // const [ workerInstance, setWorkerInstance ] = useState<Worker|null>(null)
  const [ miningActive, setMiningActive ] = useState<boolean>(false)
  const [ nonce, setNonce ] = useState<number>(0)
  const [ createdAt, setCreatedAt ] = useState<number>(Math.round(Date.now() / 1000))
  const [ workers, setWorkers ] = useState<Worker[]>([])

  // set up worker and listener
  useEffect(() => {
    const workers: Worker[] = []
    for (let i = 0; i < 1; i++) {
      const worker = new Worker()
      worker.onmessage = onWorkerResponse 
      workers.push(worker)
    }
    setWorkers(workers)
    return () => {
      workers.forEach(w => w.terminate())
    }
  }, [])

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
    // save work to localStorage
    // if work is better than current work, save to localStorage
    // console.log('saving to localstorage',msg.data)

    // debug nonce bytes
    // we need to decode the rest of the message separately from the nonce bytes because the nonce bytes will be replaced with a replacement character (65533) when decoded as utf-8.

    const { binaryEvent, nonceBounds } = msg.data

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

    console.log(decodedPrefix)
    console.log(decodedNonceBytes)
    console.log(decodedSuffix)

    console.log('///////////////////////////////////////////////////')

    const event = decoder.decode(msg.data.binaryEvent)
    const nonceIndex = event.indexOf("\"nonce\",\"")

    // console.log(event.substring(nonceIndex+9, nonceIndex + 15).split('').map(c => c.charCodeAt(0)))
  }

  // worker functions
  const postMessageToWorkers = (message: MinerCommand) => {
    workers.forEach(w => {
      w.postMessage(message)
    })
  }

  const startMining = () => {
    setMiningActive(true)
    const nonceBytes = "\x00\x00\x00\x00\x00\x00"
    const event = {
      kind: 331,
      created_at: createdAt,
      tags: [["nonce","replace with nonce bytes",targetHex]],
      content: '',
      pubkey: identity!.pubkey,
    }
    const serializedEvent = serializeEvent(event)
    // we can't use JSON.stringify because it will escape the nonce bytes, so we have to add them after.
    // binaryReadyEvent is ready to be converted to binary (Uint8Array)
    const binaryReadyEvent = serializedEvent.replace("replace with nonce bytes", nonceBytes)
    console.log({str:binaryReadyEvent})
    const nonceBounds = getNonceBounds(binaryReadyEvent)
    const binaryEvent = encoder.encode(binaryReadyEvent)
    const binaryTarget = hexToBytes(targetHex)

    // dispatch a job to each worker where the nonce is incremented by the batch size
    // send the nonce, binaryEvent, binaryTarget, nonceBounds, and createdAt
    workers.forEach((w,i) => {
      const n = nonce + i * BATCH_SIZE

      const nonceBuffer = convertNumberToUint8Array(n)

      for ( let byte = 0; byte < 6; byte++ ) {
        binaryEvent[nonceBounds[0] + byte] = nonceBuffer[byte] // replace nonce bytes in binary event
      }

      const message = {
        command: "startmining",
        data: {
          workerNumber: i,
          createdAt,
          nonceStart: n,
          nonceBounds,
          binaryEvent,
          binaryTarget,
          batch: n + BATCH_SIZE,
          targetWork,
        }
      }
      w.postMessage(message)
    })
  }

  const stopMining = () => {
    postMessageToWorkers({
      command: 'stopmining',
    })
    setMiningActive(false)
  }


  return (
    <>
      <><br/><br/>{ miningActive ? <button onClick={stopMining}>Stop Mining 🛑</button> : <button onClick={startMining}>Start Mining ▶</button>}</>
      <hr/>
    </>
  )

}