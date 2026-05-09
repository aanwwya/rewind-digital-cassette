/* ═══════════════════════════════════════════════════
   DOWNLOAD — generate a PNG card via canvas
═══════════════════════════════════════════════════ */

import { state } from './state.js';
import { showToast } from './share.js';

export function downloadCard() {
  const W = 600;
  const H = 400;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#f9f3e8');
  bg.addColorStop(1, '#f0e4d0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = `rgba(61,43,31,${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }

  const stripe = ctx.createLinearGradient(0, 0, W, 0);
  stripe.addColorStop(0, '#c9848a');
  stripe.addColorStop(0.5, '#c8895a');
  stripe.addColorStop(1, '#c9848a');
  ctx.fillStyle = stripe;
  ctx.fillRect(0, 0, W, 4);

  ctx.strokeStyle = 'rgba(201,132,138,0.3)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, 16, 16, W - 32, H - 32, 20);
  ctx.stroke();

  ctx.fillStyle = '#c9848a';
  ctx.font = 'italic 20px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Rewind', W / 2, 60);

  ctx.fillStyle = '#a89080';
  ctx.font = '13px Georgia, serif';
  ctx.fillText('✦  a note for you  ✦', W / 2, 95);

  ctx.strokeStyle = 'rgba(201,132,138,0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 110);
  ctx.lineTo(W - 80, 110);
  ctx.stroke();

  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'italic bold 22px Georgia, serif';
  ctx.fillText(state.song || '—', W / 2, 155);

  if (state.artist) {
    ctx.fillStyle = '#c9848a';
    ctx.font = '16px Georgia, serif';
    ctx.fillText(state.artist, W / 2, 185);
  }

  ctx.fillStyle = '#3d2b1f';
  ctx.font = 'italic 17px Georgia, serif';
  const wrapped = wrapText(ctx, `"${state.message}"`, W / 2, 235, W - 100, 30);

  const textBottom = 240 + wrapped * 30 + 20;
  ctx.fillStyle = '#a89080';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('made with Rewind 🌙', W / 2, Math.min(textBottom, H - 30));

  const link = document.createElement('a');
  link.download = `rewind-${(state.song || 'card').replace(/\s+/g, '-').toLowerCase()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();

  showToast('Card saved! 💾');
}

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

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = 0;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics  = ctx.measureText(testLine);
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
