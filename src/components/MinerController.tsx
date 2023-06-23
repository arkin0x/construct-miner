import { useContext, useEffect, useState } from "react"
import { hexToBytes } from "@noble/hashes/utils"
import { IdentityContext } from "./IdentityContext"
import { NostrIdentityContext } from "../types/NostrIdentity"
import { MinerMessage, WORKER_COUNT, BATCH_SIZE, serializeEvent, getNonceBounds, calculateHashrate } from "../libraries/Miner"
import { encoder } from "../libraries/Hash"
import Worker from '../workers/ConstructMiner.worker?worker'

/**
 * export start mining
 * export stop mining
 * show mining status
 * show mining hashrate
 * reveal mined constructs & save to localStorage
 * 
 */

export const Miner = ({targetHex, targetWork}) => {
  const { identity } = useContext<NostrIdentityContext>(IdentityContext)
  // const [ workerInstance, setWorkerInstance ] = useState<Worker|null>(null)
  const [ miningActive, setMiningActive ] = useState<boolean>(false)
  const [ nonce, setNonce ] = useState<number>(0)
  const [ createdAt, setCreatedAt ] = useState<number>(+new Date())
  const [ workers, setWorkers ] = useState<Worker[]>([])

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

  const onWorkerResponse = (message: MessageEvent) => {
    const { status, data } = message.data
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
        console.log('construct mining heartbeat:',data,'hashrate: '+calculateHashrate(data.duration)+' H/s')
        break
      case 'newhigh':
        console.log('construct mining new high:',data)
        evaluateWork(data)
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
  const evaluateWork = (data: object) => {
    // console.log('TODO evaluate work:', data)
  }

  // worker functions
  const postMessageToWorkers = (message: MinerMessage) => {
    workers.forEach(w => {
      w.postMessage(message)
    })
  }

  const startMining = () => {
    setMiningActive(true)

    const event = {
      kind: 332,
      created_at: createdAt,
      tags: [["nonce","\x00\x00\x00\x00\x00\x00",targetHex]],
      content: '',
      pubkey: identity.pubkey,
    }
    const serializedEvent = serializeEvent(event)
    const nonceBounds = getNonceBounds(serializedEvent)
    const binaryEvent = encoder.encode(serializedEvent)
    const binaryTarget = hexToBytes(targetHex)

    // postMessageToWorker({
    //   command: 'startMining',
    //   data: {
    //     serializedEvent,
    //     targetWork,
    //     targetHexBytes,
    //     nonce,
    //     createdAt,
    //     batch: nonce + BATCH_SIZE,
    //   }
    // })

    // dispatch a job to each worker where the nonce is incremented by the batch size
    // send the nonce, binaryEvent, binaryTarget, nonceBounds, and createdAt

    workers.forEach((w,i) => {
      const n = nonce + i * BATCH_SIZE

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
    // setNonce(nonce + BATCH_SIZE * workers.length)
  }

  const stopMining = () => {
    postMessageToWorkers({
      command: 'stopMining',
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