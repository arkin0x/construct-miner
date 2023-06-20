/**
 * export start mining
 * export stop mining
 * show mining status
 * show mining hashrate
 * reveal mined constructs & save to localStorage
 * 
 */
import { validateHash } from "../libraries/Hash"
import Worker from '../workers/ConstructMiner.worker?worker'

// type MinerProps = {
  

const Miner = () => {
  const [ workerInstance, setWorkerInstance ] = useState<Worker|null>(null);
  const [ targetHash, setTargetHash ] = useState<string>('')
  const [ validTargetHash, setValidTargetHash ] = useState<boolean>(false)
  const [ targetWork, setTargetWork ] = useState<number>(10)
  const [ miningActive, setMiningActive ] = useState<boolean>(false)
  const [ miningStartTime, setMiningStartTime ] = useState<number>(0)
  const [ miningEndTime, setMiningEndTime ] = useState<number>(0)

  // set up worker and listener
  useEffect(() => {
    const worker = new Worker();
    setWorkerInstance(worker)
    worker.onmessage = (message) => {
      // @todo remove this log, debug only
      evaluateWork(message.data as ConstructMinerMessageReceive)
      if (['complete','stopped'].includes(message.data.status)) {
        setMiningEndTime(performance.now())
        setMiningActive(false)
      }
    }
    return () => {
      worker.terminate()
    }
  }, []);

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

  // worker functions
  const postMessageToWorker = (message: ConstructMinerMessageSend) => {
    if (workerInstance) {
      workerInstance.postMessage(message)
    }
  }

  const startMining = () => {
    setMiningStartTime(performance.now())
    setMiningEndTime(0)
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
    setMiningEndTime(performance.now())
    setMiningActive(false)
  }

  return (
    <>
      { validTargetHash ? <><br/><br/>{ miningActive ? <button onClick={stopMining}>Stop Mining 🛑</button> : <button onClick={startMining}>Start Mining ▶</button>}</> : null}
      <hr/>
      { miningStartTime ? <p>Mining started at {miningStartTime}</p> : null }
      { miningEndTime ? <p>Mining ended at {miningEndTime}</p> : null }
      { miningStartTime && miningEndTime ? <p>Mining took {((miningEndTime - miningStartTime) / 1000).toFixed(2)}s</p> : null }
    </>
  )

}