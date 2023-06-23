import { getConstructProofOfWork } from "../libraries/Hash"
import { digest } from "@chainsafe/as-sha256"
import { incrementNonceBuffer } from "../libraries/Miner"
// import { constructSize } from "../assets/pow-table";

/**
 * ConstructMiner.worker.js
 * 1. receive message from main thread
 * 2. set starting nonce locally, set target work locally
 * 3. start mining loop
 * 3a. splice current nonce into serialized event
 * 3b. encode serialized event
 * 3c. digest encoded event
 * 3d. get construct proof of work
 * 4. if work is higher than current highest work, update highest work and send digest and completed work to main thread
 */

let active = false
let highestWork = 0
let hash = null
let work = null
let start = null
let hashDurationBegin = null
  
self.onmessage = function(message) {
  const { command, data } = message.data
  switch (command) {
    case 'startmining':
      active = true
      initiateMining(data)
      break
    case 'stopmining':
      active = false
      break
  }
}

function initiateMining(data){
  // let { serializedEvent, targetWork, targetHexBytes, nonce, createdAt, batch } = data
  let { workerNumber, nonceStart, nonceBounds, binaryEvent, binaryTarget, batch, createdAt, targetWork } = data

  let nonce = nonceStart
  let batchSize = batch
  highestWork = 0

  function mine() {

    start = performance.now()
    hashDurationBegin = start

    while(nonce < batchSize && active){

      binaryEvent = incrementNonceBuffer(binaryEvent, nonceBounds[0], nonceBounds[1])
      nonce++
      hash = digest(binaryEvent)
      work = getConstructProofOfWork(hash, binaryTarget)

      if (work > highestWork) {
        highestWork = work
        // send highest work to main thread
        reportHighestWork(workerNumber, work, nonce, createdAt, hash)
        if (work >= targetWork) {
          // send completed work to main thread
          postMessage({
            status: 'complete',
            data: {
              workerNumber, work, nonce, createdAt, hash 
            },
          })
          return
        }
      }
      if (nonce % 1_000_000 === 0){
        reportHeartbeat(workerNumber, highestWork, nonce, createdAt, performance.now()-hashDurationBegin)
        hashDurationBegin = performance.now()
      }
    }

    batchComplete(workerNumber, work, nonce, createdAt, hash, performance.now()-start)
    active = false
  }

  mine()
}

function batchComplete(workerNumber, work, nonce, createdAt, hash, duration){
  postMessage({
    status: 'batchcomplete',
    data: {
      workerNumber, work, nonce, createdAt, hash, duration
    },
  })
}

function reportHeartbeat(workerNumber, work, nonce, createdAt, duration){
  postMessage({
    status: 'heartbeat',
    data: {
      workerNumber, work, nonce, createdAt, duration
    },
  })
}

function reportHighestWork(workerNumber, work, nonce, createdAt, e_bin){
  postMessage({
    status: 'newhigh',
    data: {
      workerNumber, work, nonce, createdAt, e_bin
    },
  })
}

function updateNonce(serializedEvent, nonce) {
  const nonceTag = '"nonce","'
  const nonceStart = serializedEvent.indexOf(nonceTag) + nonceTag.length
  const nonceEnd = serializedEvent.indexOf('"', nonceStart)
  if (nonceStart === -1 || nonceEnd === -1) {
      return serializedEvent // nonce not found, return original
  }
  return serializedEvent.substring(0, nonceStart) + nonce + serializedEvent.substring(nonceEnd)
}

// // hyperoptimized version of commented-out above updateNonce
// function updateNonce(serializedEvent, nonce) {
//   return serializedEvent.substring(0, serializedEvent.indexOf('"nonce","') + 11) + nonce + serializedEvent.substring(serializedEvent.indexOf('"', serializedEvent.indexOf('"nonce","') + 11))
// }

