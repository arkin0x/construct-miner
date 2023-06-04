import { useContext } from "react";
import { NostrIdentityContext } from "../types/NostrIdentity";
import { IdentityContext } from "./IdentityContext";

const Miner = () => {
  const { identity } = useContext<NostrIdentityContext>(IdentityContext);
  return (
    <div id="miner">
      <h1>Miner</h1>
      <p>Welcome {identity}</p>
    </div>
  )
}

export default Miner;