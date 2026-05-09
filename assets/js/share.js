/* ═══════════════════════════════════════════════════
   SHARE — URL builder, clipboard, toast, URL parsing
═══════════════════════════════════════════════════ */

import { state } from './state.js';
import { dom } from './dom.js';
import { applyTheme } from './theme.js';
import { populatePlayer, selectFormat } from './player.js';
import { showPage } from './router.js';

/** Build a URLSearchParams and only include non-empty values */
function buildParams(data) {
  const params = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, v);
  });
  return params;
}

export function getShareUrl() {
  const params = buildParams({
    song:   state.song,
    artist: state.artist,
    msg:    state.message,
    fmt:    state.format,
    from:   state.from,
    theme:  state.theme,
    url:    state.songUrl,
  });
  const base = window.location.href.split('?')[0];
  return `${base}?${params.toString()}`;
}

export function pushStateUrl() {
  const params = buildParams({
    song:   state.song,
    artist: state.artist,
    msg:    state.message,
    fmt:    state.format,
    from:   state.from,
    theme:  state.theme,
    url:    state.songUrl,
  });
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);
}

export function copyShareLink() {
  if (!state.song || !state.message) {
    showToast('Create a card first before copying a link.');
    return;
  }
  const url = getShareUrl();

  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied! 🌙'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast('Link copied! 🌙');
  }
}

export function showToast(msg) {
  const toast = dom.toast;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

export function parseUrlAndLoad() {
  const params = new URLSearchParams(window.location.search);
  const song    = params.get('song');
  const artist  = params.get('artist') || '';
  const message = params.get('msg');
  const from    = params.get('from') || '';
  const theme   = params.get('theme') || 'pink';
  const fmt     = params.get('fmt') || 'cassette';
  const songUrl = params.get('url') || '';

  applyTheme(theme);

  if (song && message) {
    state.song    = song;
    state.artist  = artist;
    state.message = message;
    state.from    = from;
    state.theme   = theme;
    state.format  = fmt;
    state.songUrl = songUrl;

    if (dom.songInput)   dom.songInput.value   = song;
    if (dom.artistInput) dom.artistInput.value = artist;
    if (dom.msgInput)    dom.msgInput.value    = message;
    if (dom.fromInput)   dom.fromInput.value   = from;
    if (dom.themeSelector) dom.themeSelector.value = theme;
    if (dom.charCount)   dom.charCount.textContent = `${message.length} / 200`;
    selectFormat(fmt);

    populatePlayer(song, artist, message, fmt);
    showPage('playerPage');

    if (dom.playerBackBtn) {
      dom.playerBackBtn.dataset.target = 'homePage';
    }
  }
}
