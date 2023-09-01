import { expect, test } from "vitest"
import { decodeHexToCoordinates } from "../libraries/Constructs"

// testing with jest
test("decodeHexToCoordinates", () => {
    const hexString = "e000000000000000000000000000000000000000000000000000000000000000"
    const bigCoords = decodeHexToCoordinates(hexString)
    expect(bigCoords.x).toBe(BigInt("19342813113834066795298816"))
    expect(bigCoords.y).toBe(BigInt("19342813113834066795298816"))
    expect(bigCoords.z).toBe(BigInt("19342813113834066795298816"))
    expect(bigCoords.plane).toBe("d-space")

    // trying to find the middle of the universe
    const hexString2 = "0049249249249249249249249249249249249249249249249249249249249248"
    const bigCoords2 = decodeHexToCoordinates(hexString2)
    console.log(bigCoords2)

})
