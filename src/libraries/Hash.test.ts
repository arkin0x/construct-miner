import { getConstructProofOfWork } from './Hash'

  const targetHash = new Uint8Array([0b11100011]);
  const currentHash = new Uint8Array([0b11100011]);
  const proofOfWork = getConstructProofOfWork(targetHash, currentHash, 7);
  console.log(proofOfWork, proofOfWork === 7)

  const targetHash2 = new Uint8Array([0b11100011]);
  const currentHash2 = new Uint8Array([0b11100010]);
  const proofOfWork2 = getConstructProofOfWork(targetHash2, currentHash2, 7);
  console.log(proofOfWork2, proofOfWork2 === 6)
