import { SimplePool, Filter, Sub, Event } from "nostr-tools"
import { NostrIdentity } from "../types/NostrIdentity"

export const defaultRelays = [
  'wss://relay.damus.io/',
  'wss://eden.nostr.land/',
  'wss://nostr-pub.wellorder.net/',
  'wss://nostr-verified.wellorder.net/',
  'wss://bitcoinmaximalists.online/',
  'wss://relay.orangepill.dev/',
  'wss://nostr.bitcoiner.social/',
  'wss://nostr.plebchain.org/',
  'wss://puravida.nostr.land/',
  'wss://nos.lol/',
  'wss://relay.snort.social/',
  'wss://brb.io/',
  'wss://nostrica.nostrnotes.com/',
  'wss://relay.devstr.org/',
]

export const defaultProfile: NostrIdentity = {
  'name': 'unknown',
  'username': 'unknown',
  'display_name': 'unknown',
  'displayName': 'unknown',
  'nip05': 'unknown',
  'pubkey': '0000000000000000000000000000000000000000000000000000000000000000'
}

export const pool = new SimplePool()

export const getMostRecent = async (pubkey: string, kinds: number[], relays: string[] = defaultRelays) => {
  if (kinds.length > 1) console.warn('getMostRecent will only return the single most recent event of all supplied kinds.')
  const filter: Filter<number> = {kinds: [...kinds], authors: [pubkey]}
  const sub: Sub = pool.sub(relays,[filter])
  const kind: Event[] = []
  sub.on('event', event => {
    if (typeof event.created_at === 'number') {
      kind.push(event)
    } else {
      console.warn('event.created_at is not a number',event)
    }
  })
  const mostRecent = await new Promise<Event>((resolve)  => {
    sub.on('eose', () => {
      // find most recent kind event
      const mostRecent = kind.reduce((a, b) => a.created_at > b.created_at ? a : b)
      resolve(mostRecent)
    })
  })
  return mostRecent
}

export const getMyRelays = async (pubkey: string) => {
  const myMetadata = await getMostRecent(pubkey,[3])
  try {
    return JSON.parse(myMetadata.content)
  } catch (e) {
    console.warn('Failed to parse relays from user metadata. Keeping default relay set.')
    return defaultRelays
  }
}

export const getMyProfile = async (pubkey: string): Promise<NostrIdentity> => {
  const myProfile = await getMostRecent(pubkey,[0])
  try {
    const parsedProfile = JSON.parse(myProfile.content) as NostrIdentity
    return Object.assign({}, parsedProfile, {pubkey})
  } catch (e) {
    console.warn('Failed to parse profile from user metadata.')
    return defaultProfile
  }
}