import { useContext } from "react"
import { ConstructLogo } from './ConstructLogo'
import { NostrIdentityContext } from "../types/NostrIdentity"
import { IdentityContext } from "./IdentityContext"

export const MinerIntro = () => {
  const { identity } = useContext<NostrIdentityContext>(IdentityContext)
  return (
    <>
      <div className="logo"><ConstructLogo/></div>
      <h1>Construct Miner</h1>
      <h2>Welcome {identity.nip05}</h2>
      <p>Your pubkey: {identity.pubkey}</p>
    </>
  )
}
