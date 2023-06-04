import { useContext, useEffect } from "react"
import { NostrIdentityContext } from "../types/NostrIdentity"
import { IdentityContext } from "./IdentityContext"
import { getMyProfile } from "../libraries/Nostr"
import MyConstructs from "./MyConstructs"

const Miner = () => {
  const { identity, setIdentityHandler } = useContext<NostrIdentityContext>(IdentityContext)

  useEffect(() => {
    const loadProfile = async () => {
      const myProfile = await getMyProfile(identity.pubkey)
      setIdentityHandler(myProfile)
    }
    loadProfile()
  }, [identity])

  return (
    <div id="miner">
      <h1>Miner</h1>
      <h2>Welcome {identity.nip05}</h2>
      <h2>pubkey: {identity.pubkey}</h2>
      <MyConstructs/>
    </div>
  )
}

export default Miner