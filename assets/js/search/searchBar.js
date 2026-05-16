/* ═══════════════════════════════════════════════════
   SEARCH BAR — debounced autocomplete UI
═══════════════════════════════════════════════════ */

import { dom } from '../dom.js';
import { getProvider } from './index.js';

const DEBOUNCE_MS = 250;
const MIN_QUERY = 2;

let selectedTrack = null;
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
  const list = dom.songResults;

  if (!input || !list) return;

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', 'songResults');
  input.setAttribute('aria-expanded', 'false');

  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeyDown);

  input.addEventListener('blur', () => {
    setTimeout(closeDropdown, 150);
  });

  input.addEventListener('focus', () => {
    if (lastResults.length) openDropdown();
  });

  document.addEventListener('click', (e) => {
    if (e.target !== input && !list.contains(e.target)) {
      closeDropdown();
    }
  });
}

function onInput() {
  if (suppressNextInput) {
    suppressNextInput = false;
    return;
  }

  selectedTrack = null;

  const q = dom.songInput.value.trim();

  clearTimeout(debounceTimer);

  if (activeController) {
    try {
      activeController.abort();
    } catch {}
  }

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
    const provider = getProvider();

    if (!provider?.search || typeof provider.search !== 'function') {
      throw new Error('Provider search() is missing');
    }

    const results = await provider.search(q, {
      signal: activeController.signal,
      limit: 8,
    });

    lastResults = Array.isArray(results) ? results : [];
    activeIndex = -1;

    if (!lastResults.length) {
      renderNoResults();
    } else {
      renderResults(lastResults);
    }

  } catch (err) {
    const debug = {
      name: err?.name,
      message: err?.message,
      code: err?.code,
      stack: err?.stack,
    };

    console.error('[search] error:', debug);

    const cancelled =
      err?.name === 'AbortError' ||
      err?.code === 20 ||
      err?.code === 'ERR_CANCELED' ||
      err?.message?.toLowerCase?.().includes('abort') ||
      err?.message?.toLowerCase?.().includes('cancel');

    if (cancelled) return;

    // Shows exact issue on mobile devices
    alert(JSON.stringify(debug, null, 2));

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

    if (t?.artworkUrl) {
      img.src = t.artworkUrl;
    }

    const text = document.createElement('div');
    text.className = 'search-result-text';

    const title = document.createElement('div');
    title.className = 'search-result-title';
    title.textContent = t?.title || 'Unknown title';

    const meta = document.createElement('div');
    meta.className = 'search-result-meta';
    meta.textContent =
      (t?.artist || 'Unknown artist') +
      (t?.album ? ` · ${t.album}` : '');

    text.append(title, meta);
    li.append(img, text);

    li.addEventListener('mousedown', (e) => {
      e.preventDefault();
      pick(i);
    });

    list.appendChild(li);
  });

  openDropdown();
}

function renderLoading() {
  dom.songResults.innerHTML =
    '<li class="search-result-empty">Searching…</li>';
}

function renderNoResults() {
  dom.songResults.innerHTML =
    '<li class="search-result-empty">No matches.</li>';
}

function renderError() {
  dom.songResults.innerHTML =
    '<li class="search-result-empty">Couldn’t reach the song service. You can still type it manually.</li>';
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
    activeIndex =
      (activeIndex - 1 + lastResults.length) % lastResults.length;

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
  const items =
    dom.songResults.querySelectorAll('.search-result-item');

  items.forEach((el, i) => {
    el.classList.toggle('active', i === activeIndex);

    if (i === activeIndex) {
      el.scrollIntoView?.({
        block: 'nearest',
      });
    }
  });
}

function pick(i) {
  const t = lastResults[i];
  if (!t) return;

  selectedTrack = t;

  suppressNextInput = true;
  dom.songInput.value = t.title || '';

  if (dom.artistInput) {
    dom.artistInput.value = t.artist || '';
  }

  closeDropdown();
}