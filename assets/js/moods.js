/* ═══════════════════════════════════════════════════
   MOODS — quick-pick song suggestions
═══════════════════════════════════════════════════ */

import { state } from './state.js';
import { dom } from './dom.js';

const moodSongs = {
  romantic: [
    { song: "I Wanna Be Yours", artist: "Arctic Monkeys", link: "https://open.spotify.com/track/5XeFesFbtLpXzIVDNQP22n" },
    { song: "Until I Found You", artist: "Stephen Sanchez", link: "https://open.spotify.com/track/3r8RuvgbX9s7ammBn07D3W" }
  ],
  sad: [
    { song: "Another Love", artist: "Tom Odell", link: "https://open.spotify.com/track/3JvKfv6T31zO0ini8iNItO" }
  ],
  happy: [
    { song: "Golden", artist: "Harry Styles", link: "https://open.spotify.com/track/45S5WTQEGOB1VHr1Q4FuPl" }
  ],
  nostalgic: [
    { song: "Yellow", artist: "Coldplay", link: "https://open.spotify.com/track/3AJwUDP919kvQ9QcozQPxg" }
  ],
  lofi: [
    { song: "Lofi Study Beats", artist: "Various", link: "https://open.spotify.com/track/1nFtiJxYdhtFfFtfXBjDTq" }
  ]
};

export function showSuggestions(mood) {
  const box = dom.suggestionsBox;
  const songs = moodSongs[mood] || [];
  box.innerHTML = '';
  songs.forEach((s, i) => {
    const item = document.createElement('div');
    item.className = 'suggestion-item';
    item.textContent = `🎵 ${s.song} — ${s.artist}`;
    item.addEventListener('click', () => selectSuggestion(mood, i));
    box.appendChild(item);
  });
}

export function selectSuggestion(mood, index) {
  const s = moodSongs[mood][index];
  if (!s) return;
  if (dom.songInput)   dom.songInput.value   = s.song;
  if (dom.artistInput) dom.artistInput.value = s.artist;
  // Stash the link so createCard() can pick it up
  state.songUrl = s.link || '';
  state.artwork = '';
}
