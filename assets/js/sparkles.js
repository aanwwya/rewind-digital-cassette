/* ═══════════════════════════════════════════════════
   SPARKLES — floating decorative stars
═══════════════════════════════════════════════════ */

import { dom } from './dom.js';

function createSparkle() {
  const container = dom.sparklesContainer;
  if (!container) return;

  const sparkle = document.createElement('div');
  sparkle.classList.add('sparkle');
  sparkle.style.left = `${Math.random() * 100}vw`;
  sparkle.style.top  = `${Math.random() * 100}vh`;

  const dur   = 3 + Math.random() * 4;
  const delay = Math.random() * 3;
  sparkle.style.setProperty('--dur',   `${dur}s`);
  sparkle.style.setProperty('--delay', `${delay}s`);

  const scale = 0.5 + Math.random() * 1;
  sparkle.style.transform = `scale(${scale})`;

  container.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), (dur + delay) * 1000);
}

export function startSparkles() {
  setInterval(createSparkle, 600);
  for (let i = 0; i < 6; i++) setTimeout(createSparkle, i * 300);
}
