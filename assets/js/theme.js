/* ═══════════════════════════════════════════════════
   THEME — body background variants
═══════════════════════════════════════════════════ */

import { state } from './state.js';

const THEMES = ['theme-pink', 'theme-brown', 'theme-dark', 'theme-pastel'];

export function applyTheme(theme) {
  const body = document.body;
  THEMES.forEach(c => body.classList.remove(c));
  body.classList.add(`theme-${theme}`);
  state.theme = theme;
}
