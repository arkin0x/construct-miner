import { Event, UnsignedEvent } from "nostr-tools"

export type UnpublishedConstructType = {
  readyForSignature: UnsignedEvent,
  workCompleted: number,
  createdAt: number,
  id: string,
}

export type UnpublishedConstructsReducerState = {
  [key: string]: UnpublishedConstructType
}
export type UnpublishedConstructsReducerAction = {
  type: 'add' | 'clear',
  construct?: UnpublishedConstructType
  published?: PublishedConstructsReducerState
}


export type PublishedConstructType = Event<331>

export type PublishedConstructsReducerState = {
  [key: string]: PublishedConstructType 
}

export type PublishedConstructsReducerAction = {
  type: 'add',
  construct: PublishedConstructType
}
