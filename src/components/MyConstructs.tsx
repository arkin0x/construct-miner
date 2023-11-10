import { useContext, useEffect } from 'react'
import { Filter } from "nostr-tools"
import { IdentityContextType } from "../types/IdentityType"
import { IdentityContext } from "../providers/IdentityProvider"
import { defaultRelays, getRelayList, pool } from '../libraries/Nostr'
import { PublishedConstructsReducerAction, PublishedConstructsReducerState, PublishedConstructType} from '../types/Construct'
import { decodeHexToCoordinates, sortPublishedConstructsPOW } from '../libraries/Constructs'

type MyConstructsProps = {
  constructs: PublishedConstructsReducerState
  updatePublishedConstructs: React.Dispatch<PublishedConstructsReducerAction>
}

const MyConstructs = ({constructs, updatePublishedConstructs}: MyConstructsProps) => {
  const { identity } = useContext<IdentityContextType>(IdentityContext)
  // const [ foundNone, setFoundNone ] = useState<boolean>(false)

  useEffect(() => {
    const relayList = getRelayList(defaultRelays, ['write'])
    const filter: Filter = {kinds: [331], authors: [identity.pubkey]}
    const sub = pool.sub(relayList, [filter])
    const loadMyConstructs = async () => {
      sub.on('event', event => {
        console.log('found construct', event.id)
        updatePublishedConstructs({type: 'add', construct: event as PublishedConstructType})
      })
    }
    loadMyConstructs()
    return () => {
      pool.close(relayList)
    }
  }, [identity.pubkey, updatePublishedConstructs]) // @todo add some kind of dependency for when new constructs are published

  const constructsArray = Object.values(constructs).sort(sortPublishedConstructsPOW)

  return (
    <div id="my-constructs">
      <h1>Published Constructs</h1>
      { constructsArray.length ? constructsArray.map((construct) =>{
          const coords = decodeHexToCoordinates(construct.id)
          return (
            <div className="construct saved" key={construct.id} style={{marginBottom: '1rem'}}>
              <h2>{ construct.workCompleted } POW - {coords.plane}</h2>
              <p>
                x: { ((Number(coords.x) / Number(2n**85n)) * 100 ).toFixed(0) }%<br/>
                y: { ((Number(coords.y) / Number(2n**85n)) * 100 ).toFixed(0) }%<br/>
                z: { ((Number(coords.z) / Number(2n**85n)) * 100 ).toFixed(0) }%<br/>
              </p>
              <small className="id" onClick={() => {
                // copy to clipboard
                navigator.clipboard.writeText(construct.id)
              }}>{ construct.id }</small>
              <br/><br/>
            </div>
          )
        }) 
      : 'no constructs found.' }
    </div>
  )

}

export default MyConstructs