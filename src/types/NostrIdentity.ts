export type NostrIdentity = string | null;
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