import { getConstructProofOfWork } from "../libraries/Hash"
import { digest } from "@chainsafe/as-sha256"
// import { encode } from "@webassemblyjs/utf8/lib/encoder.js"
import { encoder } from "../libraries/Hash"
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
  

self.onmessage = function(message) {
  const { command, data } = message.data
  switch (command) {
    case 'startMining':
      active = true
      initiateMining(data)
      break
    case 'stopMining':
      active = false
      break
  }
}


function initiateMining(data){
  console.log(data)
  let { serializedEvent, targetWork, targetHexBytes, nonce, createdAt, batch } = data

  let batchSize = batch
  highestWork = 0

  function mine() {

    let start = performance.now()

    while(nonce < batchSize && active){
      // splice current nonce into serialized event
      let e_string = updateNonce(serializedEvent, nonce)
      let e_bin = encoder.encode(e_string)
      e_bin = digest(e_bin)

      let work = getConstructProofOfWork(e_bin, targetHexBytes)

      if (work > highestWork) {
        highestWork = work
        // send highest work to main thread
        reportHighestWork(work, nonce, createdAt, e_bin)
        if (work >= targetWork) {
          // send completed work to main thread
          postMessage({
            status: 'complete',
            data: {
              work, nonce, createdAt, e_bin 
            },
          })
          return
        }
      }
      if (nonce % 100_000 === 0){
        reportHeartbeat(work, nonce, createdAt, performance.now()-start)
      }
      // increment nonce
      nonce++
      e_string = null
      e_bin = null
    }

    let end = performance.now()

    batchComplete(end-start)

    // ready for next batch
    batchSize += batch 
    postMessage({status: 'cooldown start', data: null })
    setTimeout(() => {
      postMessage({
        status: 'cooldown complete',
        data: null
      })
      mine()
    }, 1000 * 30)
  }

  mine()
}

function batchComplete(duration){
  postMessage({
    status: 'batchcomplete',
    data: {
      duration,
      perf: Object.keys(performance)
    },
  })
}

function reportHeartbeat(work, nonce, createdAt, duration){
  postMessage({
    status: 'heartbeat',
    data: {
      work, nonce, createdAt, duration
    },
  })
}

function reportHighestWork(work, nonce, createdAt, e_bin){
  postMessage({
    status: 'newhigh',
    data: {
      work, nonce, createdAt, e_bin
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

