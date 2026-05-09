/* ═══════════════════════════════════════════════════
   STATE — shared mutable app state
═══════════════════════════════════════════════════ */

export const state = {
  format: 'cassette',   // 'cassette' or 'vinyl'
  song: '',
  artist: '',
  message: '',
  from: '',
  theme: 'pink',
  songUrl: '',          // public link to the song (e.g. iTunes trackViewUrl)
  artwork: '',          // optional album artwork URL
  isPlaying: false,
  progressInterval: null,
  currentSeconds: 0,
  totalSeconds: 227,    // 3:47 simulated duration
};
