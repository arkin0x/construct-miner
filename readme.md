# Construct Miner

This is a convenient web interface to help people easily get started with claiming real-estate in [cyberspace](https://github.com/arkin0x/cyberspace#claiming-space-and-building-structures).

Cyberspace is a permissionless finite digital extension of reality where proof-of-work governs all actions. Scarce space in cyberspace can be claimed via mining proof-of-work; the cryptographic keypair that owns the highest proof-of-work for a given space is the rightful owner of that space.

The amount of proof-of-work determines the size of the space (bounding box) and the location of the space is a 3 dimensional coordinate derived from the proof.

More advanced operators will graduate from this interface to more advanced construct mining software that does not run in the web browser. Right now, this is the only public mining software created for such purpose.

## Application Structure

The UI is React (Vite) + Three.js. The miner uses a wasm sha-256 implementation to benefit from bytecode-speed hashing.

## Resources

https://github.com/rustwasm/team

https://www.assemblyscript.org/introduction.html#frequently-asked-questions

https://github.com/ChainSafe/ssz/tree/master/packages/as-sha256

https://blog.logrocket.com/react-router-v6-guide/#what-react-router