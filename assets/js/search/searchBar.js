/* ═══════════════════════════════════════════════════
   SEARCH BAR — debounced autocomplete UI
═══════════════════════════════════════════════════ */

import { dom } from '../dom.js';
import { getProvider } from './index.js';

const DEBOUNCE_MS = 250;
const MIN_QUERY = 2;

let selectedTrack = null;   // last user-picked track
let debounceTimer = null;
let activeController = null;
let lastResults = [];
let activeIndex = -1;
let suppressNextInput = false;

export function getSelectedTrack() {
  return selectedTrack;
}

export function clearSelectedTrack() {
  selectedTrack = null;
}

export function initSearchBar() {
  const input = dom.songInput;
  const list  = dom.songResults;
  if (!input || !list) return;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', 'songResults');
  input.setAttribute('aria-expanded', 'false');

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeyDown);
  input.addEventListener('blur', () => {
    // Delay so click on a result still fires
    setTimeout(closeDropdown, 150);
  });
  input.addEventListener('focus', () => {
    if (lastResults.length) openDropdown();
  });

  document.addEventListener('click', (e) => {
    if (e.target !== input && !list.contains(e.target)) closeDropdown();
  });
}

function onInput() {
  if (suppressNextInput) {
    suppressNextInput = false;
    return;
  }
  // Editing the input invalidates a previous selection
  selectedTrack = null;

  const q = dom.songInput.value.trim();
  clearTimeout(debounceTimer);
  if (activeController) activeController.abort();

  if (q.length < MIN_QUERY) {
    renderEmpty();
    closeDropdown();
    return;
  }

  renderLoading();
  openDropdown();

  debounceTimer = setTimeout(() => runSearch(q), DEBOUNCE_MS);
}

async function runSearch(q) {
  activeController = new AbortController();
  try {
    const results = await getProvider().search(q, {
      signal: activeController.signal,
      limit: 8,
    });
    lastResults = results;
    activeIndex = -1;
    if (!results.length) renderNoResults();
    else renderResults(results);
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('[search] error:', err);
    renderError();
  }
}

function renderResults(results) {
  const list = dom.songResults;
  list.innerHTML = '';
  results.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = 'search-result-item';
    li.setAttribute('role', 'option');
    li.dataset.index = String(i);

    const img = document.createElement('img');
    img.className = 'search-result-thumb';
    img.alt = '';
    img.loading = 'lazy';
    if (t.artworkUrl) img.src = t.artworkUrl;

    const text = document.createElement('div');
    text.className = 'search-result-text';
    const title = document.createElement('div');
    title.className = 'search-result-title';
    title.textContent = t.title;
    const meta = document.createElement('div');
    meta.className = 'search-result-meta';
    meta.textContent = t.artist + (t.album ? ` · ${t.album}` : '');
    text.append(title, meta);

    li.append(img, text);
    li.addEventListener('mousedown', (e) => {
      // mousedown fires before blur, preserving the click
      e.preventDefault();
      pick(i);
    });
    list.appendChild(li);
  });
  openDropdown();
}

function renderLoading() {
  dom.songResults.innerHTML = '<li class="search-result-empty">Searching…</li>';
}
function renderNoResults() {
  dom.songResults.innerHTML = '<li class="search-result-empty">No matches.</li>';
}
function renderError() {
  dom.songResults.innerHTML = '<li class="search-result-empty">Couldn’t reach the song service. You can still type it manually.</li>';
}
function renderEmpty() {
  dom.songResults.innerHTML = '';
  lastResults = [];
  activeIndex = -1;
}

function openDropdown() {
  dom.songResults.classList.add('open');
  dom.songInput.setAttribute('aria-expanded', 'true');
}
function closeDropdown() {
  dom.songResults.classList.remove('open');
  dom.songInput.setAttribute('aria-expanded', 'false');
  activeIndex = -1;
  highlight();
}

function onKeyDown(e) {
  const open = dom.songResults.classList.contains('open');
  if (e.key === 'ArrowDown') {
    if (!open || !lastResults.length) return;
    e.preventDefault();
    activeIndex = (activeIndex + 1) % lastResults.length;
    highlight();
  } else if (e.key === 'ArrowUp') {
    if (!open || !lastResults.length) return;
    e.preventDefault();
    activeIndex = (activeIndex - 1 + lastResults.length) % lastResults.length;
    highlight();
  } else if (e.key === 'Enter') {
    if (open && activeIndex >= 0) {
      e.preventDefault();
      pick(activeIndex);
    }
  } else if (e.key === 'Escape') {
    closeDropdown();
  }
}

function highlight() {
  const items = dom.songResults.querySelectorAll('.search-result-item');
  items.forEach((el, i) => {
    el.classList.toggle('active', i === activeIndex);
    if (i === activeIndex) el.scrollIntoView({ block: 'nearest' });
  });
}

function pick(i) {
  const t = lastResults[i];
  if (!t) return;
  selectedTrack = t;
  // Avoid re-triggering search on programmatic value change
  suppressNextInput = true;
  dom.songInput.value = t.title;
  if (dom.artistInput) dom.artistInput.value = t.artist || '';
  closeDropdown();
}
