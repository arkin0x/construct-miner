import { digest } from "@chainsafe/as-sha256";

const encoder = new TextEncoder()

export function hash(data: string): string {
  const encoded = encoder.encode(data)
  const hash = digest(encoded);
  const hex = uint8ToHex(hash);
  return hex
}

// hex should be a hexadecimal string (with no 0x prefix)
export function countLeadingZeroes(hex) {
  let count = 0;

  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16);
    if (nibble === 0) {
      count += 4;
    } else {
      count += Math.clz32(nibble) - 28;
      break;
    }
  }

  return count;
}

export function uint8ToHex(hash: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < hash.length; i++) {
    let byte = hash[i].toString(16);
    if (byte.length < 2) {
      byte = '0' + byte;  // pad with leading zero if necessary
    }
    hex += byte;
  }
  return hex;
}

export function hammingDistance(arr1: Uint8Array, arr2: Uint8Array): number {
  if (arr1.length !== arr2.length) {
    throw new Error('Input arrays must have the same length');
  }

  let dist = 0;
  for (let i = 0; i < arr1.length; i++) {
    let xorResult = arr1[i] ^ arr2[i];  // XOR the bytes

    // Count the number of set bits in xorResult
    while (xorResult) {
      dist += xorResult & 1;  // Increment dist if the least significant bit is 1
      xorResult >>= 1;  // Right shift by 1
    }
  }

  return dist;
}

export function getConstructProofOfWork(targetHash: Uint8Array, currentHash: Uint8Array) {
  const length = 255
  // ignore 256th bit (it's ignored in the spec)
  // we do this before calculating the hamming distance because we shouldn't change how hamming function works but we need to ignore the last bit as it is not used in any coordinate.
  // zero out last bit in last byte of targetHash
  targetHash[targetHash.length - 1] &= 0b01111111;
  // zero out last bit in last byte of currentHash
  currentHash[currentHash.length - 1] &= 0b01111111;
  const distance = hammingDistance(targetHash, currentHash)
  const proofOfWorkTotal = length - distance
  return proofOfWorkTotal;
}
