/**
 * export start mining
 * export stop mining
 * show mining status
 * show mining hashrate
 * reveal mined constructs & save to localStorage
 * 
 */
import { useContext, useEffect, useState } from "react"
import { hexToBytes } from "@noble/hashes/utils"
import { UnsignedEvent } from 'nostr-tools'
import { IdentityContext } from "./IdentityContext"
import { NostrIdentityContext } from "../types/NostrIdentity"
import Worker from '../workers/ConstructMiner.worker?worker'

type MinerMessage = {
  command: string,
  data?: any
}

function serializeEvent(event: UnsignedEvent): string {
  return JSON.stringify([
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags,
    event.content
  ])
}

export const Miner = ({targetHex, targetWork}) => {
  const { identity } = useContext<NostrIdentityContext>(IdentityContext)
  const [ workerInstance, setWorkerInstance ] = useState<Worker|null>(null)
  const [ miningActive, setMiningActive ] = useState<boolean>(false)
  const [ miningStartTime, setMiningStartTime ] = useState<number>(0)
  const [ miningEndTime, setMiningEndTime ] = useState<number>(0)
  const [ nonce, setNonce ] = useState<number>(0)
  const [ createdAt, setCreatedAt ] = useState<number>(+new Date())

  // set up worker and listener
  useEffect(() => {
    const worker = new Worker()
    setWorkerInstance(worker)
    worker.onmessage = onWorkerResponse 
    return () => {
      worker.terminate()
    }
  }, [])

  const onWorkerResponse = (message: MessageEvent) => {
    const { status, data } = message.data
    switch (status) {
      case 'complete':
        console.log('construct mined:',data)
        stopMining()
        break
      case 'stopped':
        console.log('construct mining stopped')
        setMiningEndTime(performance.now())
        setMiningActive(false)
        break
      case 'error':
        console.warn('construct mining error:',data)
        setMiningEndTime(performance.now())
        setMiningActive(false)
        break
      case 'newhigh':
        console.log('construct mining new high:',data)
        break
      case 'heartbeat':
        console.log('construct mining heartbeat:',data)
        break
      case 'batchcomplete':
        console.log('construct mining batch complete:',data)
        evaluateWork(data)
        break
      default:
        console.warn('unknown construct mining status:',status)
    }
  }

  // receive new work from worker and evaluate
  const evaluateWork = (data: object) => {
    console.log('TODO evaluate work:', data)
  }

  // worker functions
  const postMessageToWorker = (message: MinerMessage) => {
    if (workerInstance) {
      workerInstance.postMessage(message)
    }
  }

  const startMining = () => {
    setMiningStartTime(performance.now())
    setMiningEndTime(0)
    setMiningActive(true)

    const event = {
      kind: 332,
      created_at: createdAt,
      tags: [["nonce",nonce.toString(),targetHex]],
      content: '',
      pubkey: identity.pubkey,
    }
    const serializedEvent = serializeEvent(event)
    const targetHexBytes = hexToBytes(targetHex)

    postMessageToWorker({
      command: 'startMining',
      data: {
        serializedEvent,
        targetWork,
        targetHexBytes,
        nonce,
        createdAt,
        batch: 1_000_000,
      }
    })
  }

  const stopMining = () => {
    postMessageToWorker({
      command: 'stopMining',
    })
    setMiningEndTime(performance.now())
    setMiningActive(false)
  }


  return (
    <>
      <><br/><br/>{ miningActive ? <button onClick={stopMining}>Stop Mining 🛑</button> : <button onClick={startMining}>Start Mining ▶</button>}</>
      <hr/>
      { miningStartTime ? <p>Mining started at {miningStartTime}</p> : null }
      { miningEndTime ? <p>Mining ended at {miningEndTime}</p> : null }
      { miningStartTime && miningEndTime ? <p>Mining took {((miningEndTime - miningStartTime) / 1000).toFixed(2)}s</p> : null }
    </>
  )

}