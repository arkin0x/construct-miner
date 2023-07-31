export const encoder = new TextEncoder()
export const decoder = new TextDecoder()
export const incrementNonceBuffer = (buffer, startIndex, endIndex) => {
  // go from right to left to update count, because the number is big-endian
  for (let i = endIndex-1; i >= startIndex; i--) {
    if (buffer[i] === 255) {
      buffer[i] = 0
    } else {
      buffer[i]++
      break
    }
  }
  return buffer
}

const testString = JSON.stringify({str:"Hello World!\x00\x00\x00\x00\x00\x00Goodbye World!"})

console.log(testString)

let buffer = encoder.encode(testString)

let count = 256 * 256

while(count--){
  buffer = incrementNonceBuffer(buffer, 12, 18)
}

const resultString = decoder.decode(buffer)

console.log(resultString)
console.log(resultString.split('').map((char,i) => i >= 12 && i < 18 ? char.charCodeAt(0) : false).filter(x => x !== false))
