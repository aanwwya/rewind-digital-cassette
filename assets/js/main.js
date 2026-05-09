/* ═══════════════════════════════════════════════════
   MAIN — entry point: wires DOM events to modules
═══════════════════════════════════════════════════ */

import { showPage } from './router.js';
import { applyTheme } from './theme.js';
import {
  togglePlay, rewindPlayer, forwardPlayer, selectFormat,
} from './player.js';
import { createCard, initCharCounter } from './form.js';
import { copyShareLink, parseUrlAndLoad } from './share.js';
import { downloadCard } from './download.js';
import { startSparkles } from './sparkles.js';
import { showSuggestions } from './moods.js';
import { initSearchBar } from './search/searchBar.js';

function wireNavButtons() {
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.nav));
  });

  // Player back button uses data-target so it can be retargeted on shared loads
  const back = document.getElementById('playerBackBtn');
  if (back) {
    back.addEventListener('click', () => {
      showPage(back.dataset.target || 'createPage');
    });
  }
}

function wireFormatButtons() {
  document.querySelectorAll('[data-format]').forEach(btn => {
    btn.addEventListener('click', () => selectFormat(btn.dataset.format));
  });
}

function wireMoodButtons() {
  document.querySelectorAll('[data-mood]').forEach(btn => {
    btn.addEventListener('click', () => showSuggestions(btn.dataset.mood));
  });
}

function wireThemeSelector() {
  const sel = document.getElementById('themeSelector');
  if (sel) sel.addEventListener('change', () => applyTheme(sel.value));
}

function wirePlayerControls() {
  document.getElementById('playBtn')?.addEventListener('click', togglePlay);
  document.querySelector('[data-action="rewind"]')?.addEventListener('click', rewindPlayer);
  document.querySelector('[data-action="forward"]')?.addEventListener('click', forwardPlayer);

  document.getElementById('tapeWrapper')?.addEventListener('click', () => {
    const playerPage = document.getElementById('playerPage');
    if (playerPage && !playerPage.classList.contains('hidden')) togglePlay();
  });
}

function wireActionButtons() {
  document.getElementById('createBtn')?.addEventListener('click', createCard);
  document.getElementById('copyLinkBtn')?.addEventListener('click', copyShareLink);
  document.getElementById('downloadBtn')?.addEventListener('click', downloadCard);
}

function wireKeyboard() {
  document.addEventListener('keydown', (e) => {
    const playerPage = document.getElementById('playerPage');
    if (!playerPage.classList.contains('hidden') && e.code === 'Space') {
      const tag = document.activeElement?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        togglePlay();
      }
    }
  });
}

function init() {
  wireNavButtons();
  wireFormatButtons();
  wireMoodButtons();
  wireThemeSelector();
  wirePlayerControls();
  wireActionButtons();
  wireKeyboard();

  initCharCounter();
  initSearchBar();
  startSparkles();

  parseUrlAndLoad();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
