// export type NostrIdentity = string | null;
export type NostrIdentity = {
  pubkey: string
  name?: string
  username?: string
  display_name?: string
  displayName?: string
  about?: string
  nip05?: string
  website?: string
  picture?: string
  banner?: string
  lud16?: string
  [key: string]: string | undefined
}
export type NostrIdentityContext = {
  identity: NostrIdentity;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setIdentityHandler: Function;
}
export function validateNostrIdentity(value: string): boolean {
  if (value && value.length === 64 && value.match(/^[0-9a-fA-F]+$/)) {
    return true;
  }
  return false;
}