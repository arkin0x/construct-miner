import { encoder, hexToUint8, getConstructProofOfWork } from "../libraries/Hash"
import { digest } from "@chainsafe/as-sha256"
import { serializeEvent } from "nostr-tools"

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

function initiateMining(pubkey, targetHex, targetWork = 10) {
  let highestWork = 0;
  let highestWorkNonce = 0;
  let nonce = 0;
  const targetUint8 = hexToUint8(targetHex);
  
  while (active && highestWork < targetWork) {
    const result = mine(pubkey, nonce, targetUint8);
    
    if (result > highestWork) {
      highestWork = result;
      highestWorkNonce = nonce;
      postMessage({ highestWork, highestWorkNonce });
    }

    nonce++;
  }

  // done mining, we found our target OR active is already false
  active = false
}

function mine(pubkey, nonce, target) {
  const event = {
    kind: 332,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['nonce', nonce, target]],
    content: '',
    pubkey
  }

  const id_uint8Array = digest(encoder.encode(serializeEvent(event)));
  const dist = getConstructProofOfWork(id_uint8Array, target);

  return dist;
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
