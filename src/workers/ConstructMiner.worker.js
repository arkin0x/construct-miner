import { encoder, hexToUint8, getConstructProofOfWork } from "../libraries/Hash"
import { digest } from "@chainsafe/as-sha256"
// import { serializeEvent } from "nostr-tools"
// import { constructSize } from "../assets/pow-table";

function serializeEvent(event) {
  return JSON.stringify([
    0,
    event.pubkey,
    event.created_at,
    event.kind,
    event.tags,
    event.content
  ]);
}

let active = false;

self.onmessage = function(message) {
  const { command, data } = message.data;
  switch (command) {
    case 'startMining':
      active = true
      initiateMining(data.pubkey, data.targetHex, data.targetWork)
      break
    case 'stopMining':
      active = false
      break
  }
}

const CHUNK_SIZE = 100_000

function initiateMining(pubkey, targetHex, targetWork = 10) {
  let highestWork = 0
  let highestWorkNonce = 0
  let latestWork = 0
  let nonce = 0
  let chunk = 0
  const targetUint8 = hexToUint8(targetHex);
  
  function mineChunk(){
    while (active && highestWork < targetWork && chunk < CHUNK_SIZE) {
      const result = mine(pubkey, nonce, targetUint8, targetHex);

      if (result > highestWork) {
        highestWork = result;
        highestWorkNonce = nonce;
        postMessage({ status: 'new high', highestWork, highestWorkNonce });
      }

      nonce++
      chunk++
      latestWork = result
    }
    if (active && highestWork < targetWork && chunk >= CHUNK_SIZE) {
      // keep mining, schedule next chunk
      postMessage({ status: 'heartbeat ' +(+new Date), highestWork, highestWorkNonce, latestWork, latestNonce: nonce });
      chunk = 0
      setTimeout(mineChunk, 0)
    } else {
      active = false
      if (highestWork >= targetWork) {
        postMessage({ status: 'complete', highestWork, highestWorkNonce });
      } else if (!active) {
        postMessage({ status: 'stopped', highestWork, highestWorkNonce });
      }
    }
  }

  mineChunk()
  // done mining, we found our target OR active is already false
}

function mine(pubkey, nonce, targetBinary, targetHex) {
  const event = {
    kind: 332,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['nonce', nonce.toString(), targetHex.toString()]],
    content: '',
    pubkey
  }

  const id_uint8Array = digest(encoder.encode(serializeEvent(event)));
  const work = getConstructProofOfWork(id_uint8Array, targetBinary);

  return work;
}




// self.onmessage = function(event) {
//   const { command, data } = event.data;
//   switch (command) {
//     case 'startMining':
//       initiateMining(data.pubkey, data.targetHex, data.targetWork);
//       break;
//     case 'stopMining':
//       // Stop mining
//     // Add more commands if needed
//   }
// };

// function initiateMining(pubkey, targetHex, targetWork = 10) {
//   let highestWork = 0;
//   let highestWorkNonce = 0;
//   let nonce = 0;
//   let targetUint8 = hexToUint8(targetHex);
//   mine(pubkey, nonce, targetUint8, targetWork, highestWork, highestWorkNonce);
// }

// function mine(pubkey, nonce, target, targetWork, highestWork, highestWorkNonce) {
//   let result = work(pubkey, nonce, target);
//   if (result > highestWork) {
//     highestWork = result;
//     highestWorkNonce = nonce;
//   }
//   nonce++;
//   if (highestWork < targetWork) {
//     // Post a message back to the main script
//     self.postMessage({ highestWork, highestWorkNonce });
//     setTimeout(() => mine(pubkey, nonce, target, targetWork, highestWork, highestWorkNonce), 0);
//   }
// }
// // ... rest of your code for mining
