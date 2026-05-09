/* ═══════════════════════════════════════════════════
   PLAYER — simulated playback for cassette/vinyl
═══════════════════════════════════════════════════ */

import { state } from './state.js';
import { dom } from './dom.js';

export function populatePlayer(song, artist, message, fmt) {
  stopPlayer();
  state.currentSeconds = 0;
  updateProgress(0);

  const labelArtistText = artist || 'Unknown Artist';
  document.getElementById('labelSong').textContent    = song;
  document.getElementById('labelArtist').textContent  = labelArtistText;
  document.getElementById('vinylSong').textContent    = song;
  document.getElementById('vinylArtist').textContent  = labelArtistText;
  document.getElementById('npSong').textContent       = song;
  document.getElementById('npArtist').textContent     = artist ? `— ${artist}` : '';
  document.getElementById('messageText').textContent  = message;

  const signatureEl = document.getElementById('fromSignature');
  if (signatureEl) {
    signatureEl.textContent = state.from ? `made for you — from ${state.from}` : '';
  }

  // Show/hide Listen link
  const songLink = dom.songLink;
  if (songLink) {
    if (state.songUrl) {
      songLink.href = state.songUrl;
      songLink.classList.remove('hidden');
    } else {
      songLink.removeAttribute('href');
      songLink.classList.add('hidden');
    }
  }

  // Format visual
  if (fmt === 'vinyl') {
    dom.cassetteEl.classList.add('hidden');
    dom.vinylEl.classList.remove('hidden');
  } else {
    dom.cassetteEl.classList.remove('hidden');
    dom.vinylEl.classList.add('hidden');
  }

  // Reset reveal state
  dom.messageCard.classList.remove('revealed', 'fade-in');
  dom.messageCard.classList.add('hidden-start');
  if (dom.nowPlaying) {
    dom.nowPlaying.classList.remove('fade-in');
    dom.nowPlaying.classList.add('hidden-start');
  }

  document.getElementById('npSong').classList.remove('highlighted');
}

export function togglePlay() {
  if (state.isPlaying) pausePlayer();
  else startPlayer();
}

export function startPlayer() {
  state.isPlaying = true;
  dom.playBtn.textContent = '⏸';

  dom.reelLeft.classList.add('spinning');
  dom.reelRight.classList.add('spinning');
  dom.vinylDisc.classList.add('spinning');

  dom.messageCard.classList.remove('hidden-start');
  dom.messageCard.classList.add('fade-in');
  if (dom.nowPlaying) {
    dom.nowPlaying.classList.remove('hidden-start');
    dom.nowPlaying.classList.add('fade-in');
  }

  document.getElementById('npSong').classList.add('highlighted');

  state.progressInterval = setInterval(() => {
    state.currentSeconds++;
    if (state.currentSeconds >= state.totalSeconds) state.currentSeconds = 0;
    const percent = (state.currentSeconds / state.totalSeconds) * 100;
    updateProgress(percent);
    dom.currentTime.textContent = formatTime(state.currentSeconds);
  }, 1000);
}

export function pausePlayer() {
  state.isPlaying = false;
  dom.playBtn.textContent = '▶';
  dom.reelLeft.classList.remove('spinning');
  dom.reelRight.classList.remove('spinning');
  dom.vinylDisc.classList.remove('spinning');
  clearInterval(state.progressInterval);
  state.progressInterval = null;
}

export function stopPlayer() {
  pausePlayer();
  state.currentSeconds = 0;
  updateProgress(0);
  if (dom.currentTime) dom.currentTime.textContent = '0:00';
}

export function rewindPlayer() {
  state.currentSeconds = Math.max(0, state.currentSeconds - 10);
  updateProgress((state.currentSeconds / state.totalSeconds) * 100);
  dom.currentTime.textContent = formatTime(state.currentSeconds);
}

export function forwardPlayer() {
  state.currentSeconds = Math.min(state.totalSeconds - 1, state.currentSeconds + 10);
  updateProgress((state.currentSeconds / state.totalSeconds) * 100);
  dom.currentTime.textContent = formatTime(state.currentSeconds);
}

export function updateProgress(percent) {
  if (dom.progressBar) dom.progressBar.style.width = `${percent}%`;
}

export function formatTime(s) {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}

export function selectFormat(fmt) {
  state.format = fmt;
  document.getElementById('btnCassette').classList.toggle('active', fmt === 'cassette');
  document.getElementById('btnVinyl').classList.toggle('active', fmt === 'vinyl');
}
