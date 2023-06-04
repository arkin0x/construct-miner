import { createContext } from 'react';
import { NostrIdentityContext } from '../types/NostrIdentity';

const defaultIdentityContext: NostrIdentityContext = {
  identity: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setIdentityHandler: () => { },
};

export const IdentityContext = createContext<NostrIdentityContext>(defaultIdentityContext);
