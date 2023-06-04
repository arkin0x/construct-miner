import { useContext, useEffect, useState } from 'react'
import { Event } from "nostr-tools"
import { NostrIdentityContext } from "../types/NostrIdentity";
import { IdentityContext } from "./IdentityContext";
import { getAll } from '../libraries/Nostr'
// My Constructs

const MyConstructs = () => {
  const { identity } = useContext<NostrIdentityContext>(IdentityContext);

  const [ constructs, setConstructs ] = useState<Event[]>([])
  const [ foundNone, setFoundNone ] = useState<boolean>(false)

  useEffect(() => {
    const loadMyConstructs = async () => {
      const kind332 = 332
      const myConstructs = await getAll([identity.pubkey], [kind332])
      if (myConstructs[kind332]?.length){
        setConstructs(myConstructs[kind332])
      } else {
        setFoundNone(true)
      }
    }
    loadMyConstructs()
  }) // @todo add some kind of dependency for when new constructs are published

  return (
    <div id="my-constructs">
      <h1>My Constructs</h1>
      { constructs.length ? constructs.map((construct) => <div>{construct.id}</div>) : ( foundNone ? 'no constructs found.' : 'loading...')}
    </div>
  )

}

export default MyConstructs