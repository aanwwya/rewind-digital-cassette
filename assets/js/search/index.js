/* ═══════════════════════════════════════════════════
   SEARCH REGISTRY — swap providers here in the future
═══════════════════════════════════════════════════ */

import { itunesProvider } from './itunes.js';

const providers = {
  itunes: itunesProvider,
};

let active = 'itunes';

export function getProvider(id = active) {
  return providers[id];
}

export function setActiveProvider(id) {
  if (providers[id]) active = id;
}
