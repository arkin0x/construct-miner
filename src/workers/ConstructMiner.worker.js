import { encoder, hexToUint8, getConstructProofOfWork } from "../libraries/Hash"
import { digest } from "@chainsafe/as-sha256"
import { encode } from "@webassemblyjs/utf8"
import { serializeEvent } from "nostr-tools"
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
  let { event, serializedEvent, targetWork, targetHexBytes, nonce, createdAt, batch } = data

  let highestWork = 0
  
  function mine() {

    while(nonce < batch){
      // splice current nonce into serialized event
      let e_string = updateNonce(serializedEvent, nonce)
      let e_bin = encode(e)
      e_bin = digest(e_bin)

      let work = getConstructProofOfWork(e_bin, targetHexBytes)

      if (work > highestWork) {
        highestWork = work
        // send highest work to main thread
        reportHighestWork(work, nonce, e_bin)
      }
      // increment nonce
      nonce++
    }

    if (nonce === batch){
      batchComplete()
    }
  }
}

function batchComplete(){
  postMessage({
    status: 'batch complete',
    data: null,
  })
}

function reportHighestWork(work, nonce, digest){
  postMessage({
    status: 'newhigh',
    data: {
      work, nonce, digest
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


function initiateMining(pubkey, targetHex, targetWork = 10) {
  let highestWork = 0
  let highestWorkNonce = 0
  let latestWork = 0
  let nonce = 0
  let chunk = 0
  let created_at = Math.floor(Date.now() / 1000)
  const targetUint8 = hexToUint8(targetHex)
  
  function mineChunk(){
    while (active && highestWork < targetWork && chunk < CHUNK_SIZE) {
      const result = mine(pubkey, nonce, targetUint8, targetHex, created_at)

      if (result > highestWork) {
        highestWork = result;
        highestWorkNonce = nonce;
        postMessage({ status: 'new high', highestWork, highestWorkNonce, highestCreatedAt: created_at });
      }

      nonce++
      chunk++
      latestWork = result
    }
    if (active && highestWork < targetWork && chunk >= CHUNK_SIZE) {
      // keep mining, schedule next chunk
      created_at = Math.floor(Date.now() / 1000)
      postMessage({ status: 'heartbeat ' + created_at, highestWork, highestWorkNonce, latestWork, latestNonce: nonce, highestCreatedAt: created_at });
      chunk = 0
      setTimeout(mineChunk, 100)
    } else {
      active = false
      if (highestWork >= targetWork) {
        postMessage({ status: 'complete', highestWork, highestWorkNonce, highestCreatedAt: created_at });
      } else if (!active) {
        postMessage({ status: 'stopped', highestWork, highestWorkNonce });
      }
    }
  }

  mineChunk()
  // done mining, we found our target OR active is already false
}

function mine(pubkey, nonce, targetBinary, targetHex, created_at) {
  let event = {
    kind: 332,
    created_at,
    tags: [['nonce', nonce.toString(), targetHex.toString()]],
    content: '',
    pubkey
  }

  let encodedEvent = encoder.encode(serializeEvent(event));

  event = null;

  let id_uint8Array = digest(encodedEvent);

  encodedEvent = null;

  let work = getConstructProofOfWork(id_uint8Array, targetBinary);

  id_uint8Array = null;

  return work
}



