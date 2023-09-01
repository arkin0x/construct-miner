import { useContext, useEffect, useState } from 'react'
import { Filter } from "nostr-tools"
import { IdentityContextType } from "../types/IdentityType"
import { IdentityContext } from "../providers/IdentityProvider"
import { defaultRelays, getRelayList, pool } from '../libraries/Nostr'
import { PublishedConstructsReducerAction, PublishedConstructsReducerState, PublishedConstructType } from '../types/Construct'
import { sortPublishedConstructsPOW, sortUnpublishedConstructsPOW } from '../libraries/Constructs'

type MyConstructsProps = {
  constructs: PublishedConstructsReducerState
  updatePublishedConstructs: React.Dispatch<PublishedConstructsReducerAction>
}

const MyConstructs = ({constructs, updatePublishedConstructs}: MyConstructsProps) => {
  const { identity } = useContext<IdentityContextType>(IdentityContext)

  const [ foundNone, setFoundNone ] = useState<boolean>(false)

  useEffect(() => {
    const loadMyConstructs = async () => {
      const relayList = getRelayList(defaultRelays, ['write'])
      const filter: Filter = {kinds: [331], authors: [identity.pubkey]}
      const sub = pool.sub(relayList, [filter])
      sub.on('event', event => {
        updatePublishedConstructs({type: 'add', construct: event as PublishedConstructType})
      })


      // if (myConstructs[kind331]?.length){
      //   setConstructs(myConstructs[kind331])
      // } else {
      //   setFoundNone(true)
      // }
    }
    loadMyConstructs()
  }, [identity.pubkey, constructs, updatePublishedConstructs]) // @todo add some kind of dependency for when new constructs are published

  const constructsArray = Object.values(constructs).sort(sortPublishedConstructsPOW)

  if (constructsArray.length)

  return (
    <div id="my-constructs">
      <h1>Published Constructs</h1>
      { constructsArray.length ? constructsArray.map((construct) => <div>{construct.id}</div>) : 'no constructs found.' }
    </div>
  )

}

export default MyConstructs