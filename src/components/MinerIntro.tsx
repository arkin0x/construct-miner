import { useContext } from "react"
import { ConstructLogo } from './ConstructLogo'
import { IdentityContextType } from "../types/IdentityType"
import { IdentityContext } from "../providers/IdentityProvider"

export const MinerIntro = () => {
  const { identity } = useContext<IdentityContextType>(IdentityContext)
  return (
    <>
      <div className="logo"><ConstructLogo/></div>
      <h1>Construct Miner</h1>
      <h2>Welcome {identity.nip05}</h2>
      <p>Your pubkey: {identity.pubkey}</p>
    </>
  )
}
