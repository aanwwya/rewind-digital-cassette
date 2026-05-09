/* ═══════════════════════════════════════════════════
   REWIND — JavaScript
   Handles: page routing, form, URL sharing,
   player simulation, sparkles, download card
═══════════════════════════════════════════════════ */

// ── STATE ──────────────────────────────────────────
// Tracks current app state
const state = {
  format: 'cassette',   // 'cassette' or 'vinyl'
  song: '',
  artist: '',
  message: '',
  from: '',
  photo: '',
  theme: 'pink',
  isPlaying: false,
  progressInterval: null,
  currentSeconds: 0,
  totalSeconds: 227,    // 3:47 simulated duration
};

// ── DOM REFERENCES ─────────────────────────────────
const songInput    = document.getElementById('songInput');
const artistInput  = document.getElementById('artistInput');
const msgInput     = document.getElementById('msgInput');
const fromInput    = document.getElementById('fromInput');
const themeSelector = document.getElementById('themeSelector');
const charCount    = document.getElementById('charCount');
const formError    = document.getElementById('formError');
const playBtn      = document.getElementById('playBtn');
const progressBar  = document.getElementById('progressBar');
const currentTime  = document.getElementById('currentTime');
const reelLeft     = document.getElementById('reelLeft');
const reelRight    = document.getElementById('reelRight');
const vinylDisc    = document.getElementById('vinylDisc');
const messageCard  = document.getElementById('messageCard');
const nowPlaying   = document.querySelector('.now-playing');
const toast        = document.getElementById('toast');
const cassetteEl   = document.getElementById('cassetteEl');
const vinylEl      = document.getElementById('vinylEl');

/* ════════════════════════════════════════════════════
   PAGE ROUTING
   Simple show/hide system — no frameworks needed
════════════════════════════════════════════════════ */

/**
 * Show a specific page by its element ID.
 * Hides all other pages with the .hidden class.
 */
function showPage(pageId) {
  // Stop any playing state when navigating away
  if (state.isPlaying && pageId !== 'playerPage') {
    stopPlayer();
  }

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));

  // Show the target page — remove hidden, re-trigger animation
  const target = document.getElementById(pageId);
  target.classList.remove('hidden');

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
}


/* ════════════════════════════════════════════════════
   FORMAT SELECTOR
   Toggle between cassette and vinyl
════════════════════════════════════════════════════ */

/**
 * Called when user clicks a format button (cassette/vinyl)
 * @param {string} fmt - 'cassette' or 'vinyl'
 */
function selectFormat(fmt) {
  state.format = fmt;

  // Update button active states
  document.getElementById('btnCassette').classList.toggle('active', fmt === 'cassette');
  document.getElementById('btnVinyl').classList.toggle('active', fmt === 'vinyl');
}

function applyTheme(theme) {
  const body = document.body;
  ['theme-pink', 'theme-brown', 'theme-dark', 'theme-pastel'].forEach(c => body.classList.remove(c));
  body.classList.add(`theme-${theme}`);
  state.theme = theme;
}


/* ════════════════════════════════════════════════════
   CHARACTER COUNTER
   Live counter for the message textarea
════════════════════════════════════════════════════ */

msgInput.addEventListener('input', () => {
  const len = msgInput.value.length;
  charCount.textContent = `${len} / 200`;
  // Warn when close to limit
  charCount.style.color = len > 180 ? 'var(--rose)' : 'var(--text-muted)';
});


/* ════════════════════════════════════════════════════
   CREATE CARD
   Validates inputs and navigates to player page,
   encoding data into the URL
════════════════════════════════════════════════════ */

function createCard() {
  const song    = songInput.value.trim();
  const artist  = artistInput.value.trim();
  const message = msgInput.value.trim();
  const from    = fromInput ? fromInput.value.trim() : '';
  const theme   = themeSelector ? themeSelector.value : state.theme;
  const file    = document.getElementById('photoInput')?.files[0];
  const imageURL = file ? URL.createObjectURL(file) : '';

  // Basic validation — song and message are required
  if (!song || !message) {
    formError.classList.remove('hidden');
    // Shake animation on the empty fields
    if (!song) shake(songInput);
    if (!message) shake(msgInput);
    return;
  }
  formError.classList.add('hidden');

  // Store in state
  state.song    = song;
  state.artist  = artist;
  state.message = message;
  state.from    = from;
  state.photo   = imageURL;
  state.theme   = theme;

  // Encode into URL query params — no server needed!
  const params = new URLSearchParams({
    song:   song,
    artist: artist,
    msg:    message,
    fmt:    state.format,
    from:   from,
    theme:  theme,
  });

  // Update browser URL without page reload
  const newUrl = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', newUrl);

  applyTheme(theme);

  // Populate the player page with the data
  populatePlayer(song, artist, message, state.format);

  // Navigate to player
  showPage('playerPage');
}

/**
 * Small horizontal shake animation for invalid fields
 */
function shake(el) {
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


/* ════════════════════════════════════════════════════
   POPULATE PLAYER
   Fills in all the dynamic text on the player page
════════════════════════════════════════════════════ */

/**
 * @param {string} song
 * @param {string} artist
 * @param {string} message
 * @param {string} fmt - 'cassette' or 'vinyl'
 */
function populatePlayer(song, artist, message, fmt) {
  // Reset player state
  stopPlayer();
  state.currentSeconds = 0;
  updateProgress(0);

  // Set song info in all the label spots
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

  // Show correct format visual
  if (fmt === 'vinyl') {
    cassetteEl.classList.add('hidden');
    vinylEl.classList.remove('hidden');
  } else {
    cassetteEl.classList.remove('hidden');
    vinylEl.classList.add('hidden');
  }

  // Reset message reveal state
  messageCard.classList.remove('revealed', 'fade-in');
  messageCard.classList.add('hidden-start');
  if (nowPlaying) {
    nowPlaying.classList.remove('fade-in');
    nowPlaying.classList.add('hidden-start');
  }

  // Remove song highlight
  document.getElementById('npSong').classList.remove('highlighted');
}


/* ════════════════════════════════════════════════════
   PLAYER SIMULATION
   Fake music player — no audio file needed
════════════════════════════════════════════════════ */

/**
 * Toggle play/pause state
 */
function togglePlay() {
  if (state.isPlaying) {
    pausePlayer();
  } else {
    startPlayer();
  }
}

function startPlayer() {
  state.isPlaying = true;

  // Update play button to pause icon
  playBtn.textContent = '⏸';

  // Start spinning animations
  reelLeft.classList.add('spinning');
  reelRight.classList.add('spinning');
  vinylDisc.classList.add('spinning');

  // Reveal the hidden photo if one was provided
  const photoEl = document.getElementById('hiddenPhoto');
  if (state.photo && photoEl) {
    photoEl.style.backgroundImage = `url(${state.photo})`;
    photoEl.classList.add('visible-photo');
  }

  // Fade in the message and now playing info
  messageCard.classList.remove('hidden-start');
  messageCard.classList.add('fade-in');
  if (nowPlaying) {
    nowPlaying.classList.remove('hidden-start');
    nowPlaying.classList.add('fade-in');
  }

  // Highlight song title
  document.getElementById('npSong').classList.add('highlighted');

  // Simulate progress bar ticking every second
  state.progressInterval = setInterval(() => {
    state.currentSeconds++;

    // Loop back if we reach the end
    if (state.currentSeconds >= state.totalSeconds) {
      state.currentSeconds = 0;
    }

    // Update progress bar width (percentage)
    const percent = (state.currentSeconds / state.totalSeconds) * 100;
    updateProgress(percent);

    // Update time display
    currentTime.textContent = formatTime(state.currentSeconds);
  }, 1000);
}

function pausePlayer() {
  state.isPlaying = false;
  playBtn.textContent = '▶';

  // Stop spinning
  reelLeft.classList.remove('spinning');
  reelRight.classList.remove('spinning');
  vinylDisc.classList.remove('spinning');

  // Clear the interval
  clearInterval(state.progressInterval);
  state.progressInterval = null;
}

function stopPlayer() {
  pausePlayer();
  state.currentSeconds = 0;
  updateProgress(0);
  currentTime.textContent = '0:00';
}

/** Rewind 10 seconds */
function rewindPlayer() {
  state.currentSeconds = Math.max(0, state.currentSeconds - 10);
  const percent = (state.currentSeconds / state.totalSeconds) * 100;
  updateProgress(percent);
  currentTime.textContent = formatTime(state.currentSeconds);
}

/** Forward 10 seconds */
function forwardPlayer() {
  state.currentSeconds = Math.min(state.totalSeconds - 1, state.currentSeconds + 10);
  const percent = (state.currentSeconds / state.totalSeconds) * 100;
  updateProgress(percent);
  currentTime.textContent = formatTime(state.currentSeconds);
}

/**
 * Update the visual width of the progress bar
 * @param {number} percent - 0 to 100
 */
function updateProgress(percent) {
  progressBar.style.width = `${percent}%`;
}

/**
 * Convert seconds to M:SS format
 * @param {number} s
 * @returns {string}
 */
function formatTime(s) {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${String(sec).padStart(2, '0')}`;
}


/* ════════════════════════════════════════════════════
   SHARE LINK
   Builds a stable share URL from current card state and copies it
════════════════════════════════════════════════════ */

function getShareUrl() {
  const params = new URLSearchParams({
    song:   state.song,
    artist: state.artist,
    msg:    state.message,
    fmt:    state.format,
    from:   state.from,
    theme:  state.theme,
  });

  const base = window.location.href.split('?')[0];
  return `${base}?${params.toString()}`;
}

function copyShareLink() {
  if (!state.song || !state.message) {
    showToast('Create a card first before copying a link.');
    return;
  }

  const url = getShareUrl();

  // Use the Clipboard API if available, fallback to execCommand
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(url).then(() => showToast('Link copied! 🌙'));
  } else {
    // Fallback for older browsers / non-HTTPS
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

/**
 * Show a toast message that slides up and fades away
 * @param {string} msg
 */
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}


/* ════════════════════════════════════════════════════
   DOWNLOAD CARD
   Generates a canvas image of the message card
   and triggers a download — no external libs
════════════════════════════════════════════════════ */

function downloadCard() {
  // Canvas dimensions
  const W = 600;
  const H = 400;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Background gradient ──
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#f9f3e8');
  bg.addColorStop(1, '#f0e4d0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // ── Grain effect (simple noise overlay) ──
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(61,43,31,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  // ── Top accent stripe ──
  const stripe = ctx.createLinearGradient(0, 0, W, 0);
  stripe.addColorStop(0, '#c9848a');
  stripe.addColorStop(0.5, '#c8895a');
  stripe.addColorStop(1, '#c9848a');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, W, 4);

  // ── Rounded card border ──
  ctx.strokeStyle = 'rgba(201,132,138,0.3)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 16, 16, W - 32, H - 32, 20);
  ctx.stroke();

  // ── Logo ──
  ctx.fillStyle = '#c9848a';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Rewind', W / 2, 60);

  // ── Label ──
  ctx.fillStyle = '#a89080';
  ctx.font = '13px Georgia, serif';
  ctx.fillText('✦  a note for you  ✦', W / 2, 95);

  // ── Divider ──
  ctx.strokeStyle = 'rgba(201,132,138,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 110);
  ctx.lineTo(W - 80, 110);
  ctx.stroke();

  // ── Song name ──
  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'italic bold 22px Georgia, serif';
  ctx.fillText(state.song || '—', W / 2, 155);

  // ── Artist ──
  if (state.artist) {
    ctx.fillStyle = '#c9848a';
    ctx.font = '16px Georgia, serif';
    ctx.fillText(state.artist, W / 2, 185);
  }

  // ── Message text — wrapped ──
  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'italic 17px Georgia, serif';
  const wrapped = wrapText(ctx, `"${state.message}"`, W / 2, 235, W - 100, 30);

  // ── Bottom note ──
  const textBottom = 240 + wrapped * 30 + 20;
  ctx.fillStyle = '#a89080';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('made with Rewind 🌙', W / 2, Math.min(textBottom, H - 30));

  // ── Trigger download ──
  const link = document.createElement('a');
  link.download = `rewind-${(state.song || 'card').replace(/\s+/g, '-').toLowerCase()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  showToast('Card saved! 💾');
}

/**
 * Helper: draw a rounded rectangle path
 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Helper: wrap text on canvas, returns number of lines
 * @returns {number} lines count
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine  = line + words[n] + ' ';
    const metrics   = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, y + lines * lineHeight);
      line = words[n] + ' ';
      lines++;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y + lines * lineHeight);
  return lines + 1;
}


/* ════════════════════════════════════════════════════
   SPARKLES
   Creates floating sparkle elements periodically
════════════════════════════════════════════════════ */

const sparklesContainer = document.getElementById('sparklesContainer');

/**
 * Create a single sparkle at a random position
 */
function createSparkle() {
  const sparkle = document.createElement('div');
  sparkle.classList.add('sparkle');

  // Random position across the viewport
  sparkle.style.left    = `${Math.random() * 100}vw`;
  sparkle.style.top     = `${Math.random() * 100}vh`;

  // Randomize animation duration and delay
  const dur   = 3 + Math.random() * 4;
  const delay = Math.random() * 3;
  sparkle.style.setProperty('--dur',   `${dur}s`);
  sparkle.style.setProperty('--delay', `${delay}s`);

  // Slightly randomize size
  const scale = 0.5 + Math.random() * 1;
  sparkle.style.transform = `scale(${scale})`;

  sparklesContainer.appendChild(sparkle);

  // Remove after animation completes to avoid DOM bloat
  setTimeout(() => sparkle.remove(), (dur + delay) * 1000);
}

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

function showSuggestions(mood) {
  const box = document.getElementById("suggestionsBox");
  const songs = moodSongs[mood] || [];

  box.innerHTML = songs.map((s, i) => `
    <div class="suggestion-item" onclick="selectSuggestion('${mood}', ${i})">
      🎵 ${s.song} — ${s.artist}
    </div>
  `).join("");
}

function selectSuggestion(mood, index) {
  const s = moodSongs[mood][index];
  const songEl = document.getElementById("songInput");
  const artistEl = document.getElementById("artistInput");
  const spotifyEl = document.getElementById("spotifyInput");

  if (songEl) songEl.value = s.song;
  if (artistEl) artistEl.value = s.artist;
  if (spotifyEl) spotifyEl.value = s.link;
}

// Create sparkles on an interval — keeps it subtle
setInterval(createSparkle, 600);
// Seed a few immediately
for (let i = 0; i < 6; i++) {
  setTimeout(createSparkle, i * 300);
}


/* ════════════════════════════════════════════════════
   URL PARSING ON LOAD
   If the page loads with ?song=...&msg=...
   automatically navigate to the player page
════════════════════════════════════════════════════ */

function parseUrlAndLoad() {
  const params = new URLSearchParams(window.location.search);
  const song    = params.get('song');
  const artist  = params.get('artist') || '';
  const message = params.get('msg');
  const from    = params.get('from') || '';
  const theme   = params.get('theme') || 'pink';
  const fmt     = params.get('fmt') || 'cassette';

  applyTheme(theme);

  // Only auto-navigate if both required fields exist
  if (song && message) {
    // Restore state
    state.song    = song;
    state.artist  = artist;
    state.message = message;
    state.from    = from;
    state.theme   = theme;
    state.format  = fmt;

    // Populate form fields too (in case user goes back to edit)
    songInput.value   = song;
    artistInput.value = artist;
    msgInput.value    = message;
    if (fromInput) fromInput.value = from;
    if (themeSelector) themeSelector.value = theme;
    charCount.textContent = `${message.length} / 200`;
    selectFormat(fmt);
    applyTheme(theme);

    // Go straight to player
    populatePlayer(song, artist, message, fmt);
    showPage('playerPage');

    // Update playerBackBtn to go home since there's no previous "create" state
    document.getElementById('playerBackBtn').setAttribute('onclick', "showPage('homePage')");
  }
}

// Run on page load
window.addEventListener('DOMContentLoaded', parseUrlAndLoad);


/* ════════════════════════════════════════════════════
   KEYBOARD SHORTCUT
   Press Space to toggle play when on player page
════════════════════════════════════════════════════ */

document.addEventListener('keydown', (e) => {
  const playerPage = document.getElementById('playerPage');
  if (!playerPage.classList.contains('hidden') && e.code === 'Space') {
    // Don't intercept space in text inputs
    if (document.activeElement.tagName !== 'INPUT' &&
        document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      togglePlay();
    }
  }
});


/* ════════════════════════════════════════════════════
   CASSETTE / VINYL CLICK
   Clicking the visual also toggles play
════════════════════════════════════════════════════ */

document.getElementById('tapeWrapper').addEventListener('click', () => {
  // Only on player page
  const playerPage = document.getElementById('playerPage');
  if (!playerPage.classList.contains('hidden')) {
    togglePlay();
  }
});
