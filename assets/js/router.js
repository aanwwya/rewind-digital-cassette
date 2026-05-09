/* ═══════════════════════════════════════════════════
   ROUTER — show/hide page sections
═══════════════════════════════════════════════════ */

import { state } from './state.js';
import { stopPlayer } from './player.js';

export function showPage(pageId) {
  if (state.isPlaying && pageId !== 'playerPage') {
    stopPlayer();
  }

  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  const target = document.getElementById(pageId);
  target.classList.remove('hidden');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
