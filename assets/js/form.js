/* ═══════════════════════════════════════════════════
   FORM — create-card validation & submission
═══════════════════════════════════════════════════ */

import { state } from './state.js';
import { dom } from './dom.js';
import { applyTheme } from './theme.js';
import { populatePlayer } from './player.js';
import { showPage } from './router.js';
import { pushStateUrl } from './share.js';
import { getSelectedTrack, clearSelectedTrack } from './search/searchBar.js';

export function initCharCounter() {
  dom.msgInput.addEventListener('input', () => {
    const len = dom.msgInput.value.length;
    dom.charCount.textContent = `${len} / 200`;
    dom.charCount.style.color = len > 180 ? 'var(--rose)' : 'var(--text-muted)';
  });
}

export function shake(el) {
  el.style.transition = 'transform 0.1s ease';
  let i = 0;
  const dirs = [6, -6, 4, -4, 2, -2, 0];
  const interval = setInterval(() => {
    el.style.transform = `translateX(${dirs[i]}px)`;
    i++;
    if (i >= dirs.length) {
      clearInterval(interval);
      el.style.transform = '';
    }
  }, 60);
}

export function createCard() {
  const song    = dom.songInput.value.trim();
  const artist  = dom.artistInput.value.trim();
  const message = dom.msgInput.value.trim();
  const from    = dom.fromInput ? dom.fromInput.value.trim() : '';
  const theme   = dom.themeSelector ? dom.themeSelector.value : state.theme;
  if (!song || !message) {
    dom.formError.classList.remove('hidden');
    if (!song) shake(dom.songInput);
    if (!message) shake(dom.msgInput);
    return;
  }
  dom.formError.classList.add('hidden');

  // Pull track URL/artwork from the search bar selection if present and
  // it still matches the current song name (otherwise treat as manual entry).
  const picked = getSelectedTrack();
  let songUrl = '';
  let artwork = '';
  if (picked && picked.title.toLowerCase() === song.toLowerCase()) {
    songUrl = picked.url || '';
    artwork = picked.artworkUrl || '';
  } else {
    // Fallback for mood suggestions which set a hidden link via state directly
    songUrl = state.songUrl || '';
    artwork = state.artwork || '';
    clearSelectedTrack();
  }

  state.song    = song;
  state.artist  = artist;
  state.message = message;
  state.from    = from;
  state.theme   = theme;
  state.songUrl = songUrl;
  state.artwork = artwork;

  pushStateUrl();
  applyTheme(theme);
  populatePlayer(song, artist, message, state.format);
  showPage('playerPage');
}
