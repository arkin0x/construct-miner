
export const CYBERSPACE_SIZE = BigInt(2 ** 85)
export const UNIVERSE_DOWNSCALE = BigInt(2 ** 35)
export const UNIVERSE_SIZE = Number(CYBERSPACE_SIZE / UNIVERSE_DOWNSCALE)
export const UNIVERSE_SIZE_HALF = UNIVERSE_SIZE / 2

/*
Deriving the center coordinate of cyberspace:

Each axis of cyberspace is 2**85 long. However, the axes are index 0 which means the largest coordinate is actually 2**85 - 1, or 38685626227668133590597631.

Dividing this by 2 yields 19342813113834066795298815.5. Having a decimal in the coordinate system is not ideal, so we round down to 19342813113834066795298815.

Python:
from decimal import Decimal
axis = Decimal(2 ** 85 - 1)
half_axis = axis // Decimal(2)
print(half_axis)

The 85-bit representation of 19342813113834066795298815 is 0b01...1.

Python:
bin(19342813113834066795298815)[2:] # 111111111111111111111111111111111111111111111111111111111111111111111111111111111111
len(bin(19342813113834066795298815)[2:]) # 84 (84 1's; the leftmost bit is 0 and omitted as it is implied)

The 85 bits of each axis are interleaved to form the 255-bit cyberspace coordinate. From left (most significant) to right (least significant) the final 255-bit coordinate is formed as follows:

XYZXYZXYZ...XYZP

Since the leftmost bit of the center coordinate on each axis is 0, the resulting 255-bit coordinate will be:

000111111...111P (all implied bits are 1's)

P may be replaced with a 0 for d-space or a 1 for i-space.

*/

const CENTERCOORD_BINARY = '0b0001111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'
// usage: BigInt(CENTERCOORD_BINARY)

export const CENTERCOORD = "1fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"

