import { UnsignedEvent } from "nostr-tools"

export type UnpublishedConstructType = {
  readyForSignature: UnsignedEvent,
  workCompleted: number,
  createdAt: number,
  id: string,
}