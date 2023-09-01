import { getConstructProofOfWork } from './Hash'

  const targetHash = new Uint8Array([0b11100011])
  const currentHash = new Uint8Array([0b11100011])
  const proofOfWork = getConstructProofOfWork(targetHash, currentHash, 7)
  console.log(proofOfWork, proofOfWork === 7)

  const targetHash2 = new Uint8Array([0b01111111])
  const currentHash2 = new Uint8Array([0b00101010])
  const proofOfWork2 = getConstructProofOfWork(targetHash2, currentHash2, 7)
  console.log(proofOfWork2, proofOfWork2 === 3)

  // const targetHash3 = new Uint8Array([ 183, 170, 43, 148, 240, 127, 175, 26, 189, 29, 72, 233, 226, 159, 140, 235, 80, 191, 218, 71, 15, 169, 39, 221, 225, 242, 238, 232, 16, 171, 142, 107 ])
  const targetHash3 = new Uint8Array([ 231, 237, 55, 152, 198, 255, 235, 255, 160, 133, 1, 172, 57, 226, 113, 102, 43, 253, 22, 15, 104, 143, 148, 196, 93, 105, 45, 135, 103, 221, 52, 90 ])
  const currentHash3 = new Uint8Array([ 232, 237, 55, 152, 198, 255, 235, 255, 160, 133, 1, 172, 57, 226, 113, 102, 43, 253, 22, 15, 104, 143, 148, 196, 93, 105, 45, 135, 103, 221, 52, 90 ])
  const proofOfWork3 = getConstructProofOfWork(targetHash3, currentHash3, 255)
  console.log(proofOfWork3)