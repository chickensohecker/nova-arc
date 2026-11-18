// Nova Arc — everything the player sees, drawn on one canvas: the starfield,
// planets with their gravity rings, black holes, portals, the Star Gate, the
// comet and its trail, the aim preview, the HUD and every menu panel. No DOM
// UI: buttons are drawn rects and hit-tested from the same layout the input
// module reads, so what you see is exactly what you can click.

import { VIEW_W, VIEW_H, PALETTE, PLANET_SKINS } from './config.js';
import { planetPosition } from './physics.js';

const FONT = '"Trebuchet MS", "Segoe UI", Verdana, sans-serif';

// Button layouts, shared with input.js through these helpers.
export function titleButtons() {
  return [
    { id: 'play', label: '▶  PLAY', x: VIEW_W / 2 - 150, y: 452, w: 300, h: 58 },
    { id: 'howto', label: 'HOW TO PLAY', x: VIEW_W / 2 - 150, y: 522, w: 300, h: 48 },
  ];
}
export function howtoButtons() {
  return [{ id: 'back', label: '←  BACK', x: VIEW_W / 2 - 110, y: 590, w: 220, h: 50 }];
}
export function completeButtons() {
  return [
    { id: 'next', label: 'NEXT CHART  →', x: VIEW_W / 2 - 250, y: 512, w: 240, h: 54 },
    { id: 'replay', label: '↻  REPLAY', x: VIEW_W / 2 + 10, y: 512, w: 240, h: 54 },
  ];
}
export function failedButtons() {
  return [
    { id: 'retry', label: '↻  RETRY CHART', x: VIEW_W / 2 - 250, y: 512, w: 240, h: 54 },
    { id: 'menu', label: 'MENU', x: VIEW_W / 2 + 10, y: 512, w: 240, h: 54 },
  ];
}
export function victoryButtons() {
  return [
    { id: 'again', label: '↻  PLAY AGAIN', x: VIEW_W / 2 - 250, y: 522, w: 240, h: 54 },
    { id: 'menu', label: 'MENU', x: VIEW_W / 2 + 10, y: 522, w: 240, h: 54 },
  ];
}
export function hudButtons() {
  return [
    { id: 'mute', label: '', x: VIEW_W - 116, y: 12, w: 44, h: 40 },
    { id: 'restart', label: '', x: VIEW_W - 64, y: 12, w: 44, h: 40 },
  ];
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawButton(ctx, b, hover, small) {
  ctx.save();
  ctx.fillStyle = hover ? PALETTE.buttonHover : PALETTE.button;
  ctx.strokeStyle = PALETTE.panelLine;
  ctx.lineWidth = 1.5;
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.font = `700 ${small ? 17 : 21}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 1);
  ctx.restore();
}

function drawBackground(ctx, game, time) {
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, PALETTE.skyTop);
  g.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  const nebulaColors = [PALETTE.nebulaA, PALETTE.nebulaB, PALETTE.nebulaC];
  for (const n of game.starfield.nebulae) {
    const rg = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r);
    rg.addColorStop(0, nebulaColors[n.hue].replace(/[\d.]+\)$/, `${0.55 * n.alpha})`));
    rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(n.x - n.r, n.y - n.r, n.r * 2, n.r * 2);
  }

  ctx.save();
  game.starfield.layers.forEach((stars, layer) => {
    const alpha = [0.5, 0.7, 0.95][layer];
    for (const s of stars) {
      const tw = 0.7 + 0.3 * Math.sin(time * s.speed + s.twinkle);
      ctx.globalAlpha = alpha * tw;
      ctx.fillStyle = '#dfe8ff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  ctx.restore();
}

function drawPlanet(ctx, planet, time) {
  const p = planetPosition(planet, time);
  const skin = PLANET_SKINS[planet.skin % PLANET_SKINS.length];
  if (planet.orbit) {
    ctx.save();
    ctx.strokeStyle = 'rgba(160, 190, 255, 0.14)';
    ctx.setLineDash([3, 7]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(planet.orbit.cx, planet.orbit.cy, planet.orbit.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // Gravity reach, dashed so the player reads the danger zone.
  ctx.save();
  ctx.strokeStyle = skin.ring;
  ctx.setLineDash([4, 9]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.x, p.y, planet.r * 2.6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // Glow, body, shaded night side, craters.
  const glow = ctx.createRadialGradient(p.x, p.y, planet.r * 0.4, p.x, p.y, planet.r * 2.1);
  glow.addColorStop(0, skin.glow);
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(p.x - planet.r * 2.1, p.y - planet.r * 2.1, planet.r * 4.2, planet.r * 4.2);
  const body = ctx.createRadialGradient(
    p.x - planet.r * 0.35, p.y - planet.r * 0.35, planet.r * 0.1,
    p.x, p.y, planet.r,
  );
  body.addColorStop(0, skin.base);
  body.addColorStop(1, skin.dark);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(p.x, p.y, planet.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.arc(p.x + planet.r * 0.28, p.y + planet.r * 0.22, planet.r * 0.78, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  const seed = planet.x * 7 + planet.y * 13;
  for (let i = 0; i < 4; i++) {
    const a = ((seed + i * 97) % 360) * (Math.PI / 180);
    const d = planet.r * (0.25 + ((seed + i * 31) % 40) / 100);
    ctx.beginPath();
    ctx.arc(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d, planet.r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawBlackHole(ctx, hole, time) {
  const spin = time * 1.4;
  const glow = ctx.createRadialGradient(hole.x, hole.y, 0, hole.x, hole.y, 74);
  glow.addColorStop(0, 'rgba(255, 120, 40, 0.5)');
  glow.addColorStop(0.5, 'rgba(160, 60, 200, 0.22)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(hole.x - 74, hole.y - 74, 148, 148);
  ctx.save();
  ctx.translate(hole.x, hole.y);
  ctx.rotate(spin);
  ctx.strokeStyle = '#ff9a3d';
  ctx.lineWidth = 5;
  ctx.setLineDash([26, 18]);
  ctx.beginPath();
  ctx.arc(0, 0, hole.r + 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([10, 14]);
  ctx.strokeStyle = '#c96fff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, hole.r + 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 170, 90, 0.9)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPortal(ctx, portal, time) {
  const colors = ['#b07fff', '#ffb347'];
  const c = colors[portal.hue % 2];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g2 = ctx.createRadialGradient(portal.x, portal.y, portal.r * 0.2, portal.x, portal.y, portal.r * 1.7);
  g2.addColorStop(0, 'rgba(255,255,255,0.10)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(portal.x - portal.r * 1.7, portal.y - portal.r * 1.7, portal.r * 3.4, portal.r * 3.4);
  ctx.restore();
  ctx.save();
  ctx.translate(portal.x, portal.y);
  ctx.rotate(time * 0.9 * (portal.hue === 0 ? 1 : -1));
  ctx.strokeStyle = c;
  ctx.lineWidth = 5;
  ctx.setLineDash([20, 12]);
  ctx.beginPath();
  ctx.arc(0, 0, portal.r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, portal.r - 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawGate(ctx, gate, time) {
  const pulse = 1 + Math.sin(time * 2.4) * 0.08;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(gate.x, gate.y, 0, gate.x, gate.y, gate.r * 2.6);
  glow.addColorStop(0, 'rgba(255, 215, 106, 0.4)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(gate.x - gate.r * 2.6, gate.y - gate.r * 2.6, gate.r * 5.2, gate.r * 5.2);
  ctx.restore();
  ctx.save();
  ctx.translate(gate.x, gate.y);
  ctx.rotate(time * 0.7);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 4;
  ctx.setLineDash([18, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, gate.r * pulse, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(255, 240, 190, 0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, gate.r * 0.62, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = '#fff6d8';
  ctx.beginPath();
  ctx.arc(gate.x, gate.y, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `700 13px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('★ STAR GATE ★', gate.x, gate.y + gate.r + 22);
  ctx.restore();
}

function drawShard(ctx, shard, time, index) {
  const bob = Math.sin(time * 2 + index * 1.7) * 3;
  const rot = time * 1.2 + index;
  ctx.save();
  ctx.translate(shard.x, shard.y + bob);
  ctx.rotate(rot);
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
  glow.addColorStop(0, 'rgba(111, 227, 255, 0.5)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(-22, -22, 44, 44);
  ctx.restore();
  ctx.save();
  ctx.translate(shard.x, shard.y + bob);
  ctx.rotate(rot);
  ctx.fillStyle = PALETTE.cyan;
  ctx.beginPath();
  ctx.moveTo(0, -11);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 11);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#eafcff';
  ctx.beginPath();
  ctx.moveTo(0, -6);
  ctx.lineTo(4, 0);
  ctx.lineTo(0, 6);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPad(ctx, pad, time) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 106, 0.55)';
  ctx.setLineDash([6, 8]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(pad.x, pad.y, 26 + Math.sin(time * 2) * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 215, 106, 0.25)';
  ctx.beginPath();
  ctx.arc(pad.x, pad.y, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `700 12px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('LAUNCH PAD', pad.x, pad.y + 44);
  ctx.restore();
}

function drawComet(ctx, x, y, time) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(x, y, 0, x, y, 34);
  glow.addColorStop(0, 'rgba(255, 240, 190, 0.9)');
  glow.addColorStop(0.35, 'rgba(255, 200, 100, 0.35)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 34, y - 34, 68, 68);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = PALETTE.comet;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x - 2, y - 2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawAim(ctx, game) {
  const { aim, prediction, level } = game;
  if (!aim.active || !prediction) return;
  const pad = level.pad;
  // Slingshot band from pad to the pointer.
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 106, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pad.x, pad.y);
  ctx.lineTo(aim.x, aim.y);
  ctx.stroke();
  // Predicted path: gold dots when the shot reaches the Gate, red on a crash.
  const color =
    prediction.outcome === 'gate'
      ? 'rgba(255, 215, 106, 0.95)'
      : prediction.outcome === 'crash' || prediction.outcome === 'swallowed'
        ? 'rgba(255, 93, 115, 0.9)'
        : 'rgba(234, 240, 255, 0.75)';
  ctx.fillStyle = color;
  for (let i = 0; i < prediction.points.length; i++) {
    const p = prediction.points[i];
    const r = 4.5 - (i / prediction.points.length) * 2.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, Math.max(1.4, r), 0, Math.PI * 2);
    ctx.fill();
  }
  // Outcome tag at the end of the preview.
  const last = prediction.points[prediction.points.length - 1];
  if (last && prediction.outcome !== 'flying') {
    const label =
      prediction.outcome === 'gate'
        ? '★ GATE!'
        : prediction.outcome === 'crash'
          ? '✕ CRASH'
          : prediction.outcome === 'swallowed'
            ? '✕ THE MAW'
            : '… DRIFTS AWAY';
    ctx.font = `700 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = color;
    ctx.fillText(label, last.x, last.y - 16);
  }
  ctx.restore();
  // Power meter beside the pad.
  const power = Math.min(1, Math.hypot(aim.x - pad.x, aim.y - pad.y) / 230);
  ctx.save();
  ctx.fillStyle = 'rgba(6, 10, 26, 0.7)';
  roundRect(ctx, pad.x - 52, pad.y + 58, 104, 12, 6);
  ctx.fill();
  ctx.fillStyle = power > 0.85 ? PALETTE.danger : PALETTE.gold;
  roundRect(ctx, pad.x - 50, pad.y + 60, 100 * power, 8, 4);
  ctx.fill();
  ctx.restore();
}

function drawHud(ctx, game) {
  const level = game.level;
  ctx.save();
  ctx.fillStyle = PALETTE.hudBar;
  ctx.fillRect(0, 0, VIEW_W, 64);
  ctx.strokeStyle = PALETTE.hudLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 64.5);
  ctx.lineTo(VIEW_W, 64.5);
  ctx.stroke();
  ctx.textBaseline = 'middle';
  ctx.fillStyle = PALETTE.text;
  ctx.font = `700 19px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(`CHART ${game.levelIndex + 1}/10 — ${level.name}`, 20, 26);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `15px ${FONT}`;
  ctx.fillText(level.hint, 20, 48);
  // Shots left as little comets.
  ctx.textAlign = 'left';
  ctx.font = `700 17px ${FONT}`;
  ctx.fillStyle = PALETTE.text;
  ctx.fillText('SHOTS', 640, 26);
  for (let i = 0; i < level.shots; i++) {
    const x = 710 + i * 26;
    ctx.save();
    ctx.globalAlpha = i < game.shotsLeft ? 1 : 0.25;
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(x, 26, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 2, 26 - 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  // Shards and score.
  ctx.fillStyle = PALETTE.cyan;
  ctx.font = `700 18px ${FONT}`;
  ctx.fillText(`◆ ${game.shardsCollected.size}/${level.shards.length}`, 640, 50);
  ctx.textAlign = 'right';
  ctx.fillStyle = PALETTE.text;
  ctx.fillText(`SCORE  ${game.score.toLocaleString('en-US')}`, VIEW_W - 140, 26);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `14px ${FONT}`;
  ctx.fillText(`TOTAL  ${game.totalScore.toLocaleString('en-US')}`, VIEW_W - 140, 48);
  // Mute and restart buttons.
  for (const b of hudButtons()) {
    const hover = game.hover === b.id;
    ctx.fillStyle = hover ? PALETTE.buttonHover : PALETTE.button;
    ctx.strokeStyle = PALETTE.panelLine;
    ctx.lineWidth = 1.5;
    roundRect(ctx, b.x, b.y, b.w, b.h, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `700 19px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(b.id === 'mute' ? (game.muted ? '🔇' : '🔊') : '↻', b.x + b.w / 2, b.y + b.h / 2 + 1);
  }
  ctx.restore();
}

function drawPanel(ctx, x, y, w, h, title, titleColor) {
  ctx.save();
  ctx.fillStyle = 'rgba(2, 4, 12, 0.55)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = PALETTE.panel;
  ctx.strokeStyle = PALETTE.panelLine;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 18);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = titleColor;
  ctx.font = `800 40px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(title, VIEW_W / 2, y + 66);
  ctx.restore();
}

function drawStars(ctx, cx, y, earned, size) {
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * (size * 1.7);
    const filled = i < earned;
    ctx.save();
    ctx.translate(x, y);
    ctx.font = `${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = filled ? PALETTE.gold : 'rgba(160, 175, 210, 0.3)';
    ctx.fillText('★', 0, 0);
    ctx.restore();
  }
}

function drawTitle(ctx, game, time) {
  // A decorative comet arc sweeping behind the title.
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cx = VIEW_W / 2;
  const cy = 250;
  for (let i = 0; i < 40; i++) {
    const t = i / 40;
    const a = Math.PI * (0.15 + t * 0.7) + Math.sin(time * 0.4) * 0.05;
    const x = cx + Math.cos(a) * 420;
    const y = cy + Math.sin(a) * 190;
    ctx.globalAlpha = t * 0.7;
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(x, y, 1 + t * 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `800 92px ${FONT}`;
  ctx.shadowColor = 'rgba(255, 180, 60, 0.55)';
  ctx.shadowBlur = 34;
  ctx.fillText('NOVA ARC', VIEW_W / 2, 218);
  ctx.shadowBlur = 0;
  ctx.fillStyle = PALETTE.text;
  ctx.font = `600 25px ${FONT}`;
  ctx.fillText('A comet slingshot puzzle', VIEW_W / 2, 268);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `17px ${FONT}`;
  ctx.fillText('Bend your comet around planets · Dodge the Maw · Sink it in the Star Gate', VIEW_W / 2, 306);
  ctx.fillText('10 charts · Drag to aim · Collect the shards · Mind your shots', VIEW_W / 2, 334);
  ctx.restore();
  for (const b of titleButtons()) {
    drawButton(ctx, b, game.hover === b.id, b.id === 'howto');
  }
  ctx.save();
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `15px ${FONT}`;
  ctx.textAlign = 'center';
  if (game.bestScore > 0) {
    ctx.fillText(`BEST SCORE  ${game.bestScore.toLocaleString('en-US')}`, VIEW_W / 2, 606);
  }
  ctx.fillText('Mouse or touch to aim · R restart · M mute · H help', VIEW_W / 2, 636);
  ctx.restore();
}

function drawHowTo(ctx, game) {
  drawPanel(ctx, VIEW_W / 2 - 330, 78, 660, 500, 'HOW TO PLAY', PALETTE.gold);
  const lines = [
    ['🎯', 'AIM', 'Press and drag back from the comet, like a slingshot. The dotted line is your true flight path.'],
    ['🪐', 'BEND', 'Planets pull your comet — use their gravity to curve around corners. Touch one and you crash.'],
    ['🕳️', 'DODGE', 'Black holes drink comets whole. Violet and amber rings are portals: fly in one, out the other.'],
    ['◆', 'SCORE', 'Reach the Star Gate to clear the chart. Shards and spare shots are worth points; 3 stars for a perfect run.'],
  ];
  ctx.save();
  ctx.textAlign = 'left';
  lines.forEach(([icon, head, body], i) => {
    const y = 196 + i * 84;
    ctx.font = '30px ' + FONT;
    ctx.fillText(icon, VIEW_W / 2 - 290, y);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `800 19px ${FONT}`;
    ctx.fillText(head, VIEW_W / 2 - 238, y - 12);
    ctx.fillStyle = PALETTE.textDim;
    ctx.font = `16px ${FONT}`;
    wrapText(ctx, body, VIEW_W / 2 - 238, y + 12, 500, 21);
  });
  ctx.restore();
  for (const b of howtoButtons()) drawButton(ctx, b, game.hover === b.id, true);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let yy = y;
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, yy);
      line = word;
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) ctx.fillText(line, x, yy);
}

function drawComplete(ctx, game) {
  const cx = VIEW_W / 2;
  drawPanel(ctx, cx - 300, 130, 600, 440, 'CHART CLEAR!', PALETTE.gold);
  drawStars(ctx, cx, 268, game.starsEarned, 54);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `17px ${FONT}`;
  ctx.fillText(`${game.level.name}  ·  ${game.shotsUsed} shot${game.shotsUsed === 1 ? '' : 's'}  ·  ${game.shardsCollected.size}/${game.level.shards.length} shards`, cx, 316);
  ctx.fillStyle = PALETTE.text;
  ctx.font = `20px ${FONT}`;
  const rows = [
    ['Chart cleared', game.levelScoreBase],
    ['Spare shots', game.levelScoreShots],
    ['Shards', game.levelScoreShards],
  ];
  rows.forEach(([label, value], i) => {
    const y = 356 + i * 34;
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.textDim;
    ctx.fillText(label, cx - 190, y);
    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(`+${value.toLocaleString('en-US')}`, cx + 190, y);
  });
  ctx.strokeStyle = PALETTE.hudLine;
  ctx.beginPath();
  ctx.moveTo(cx - 190, 468);
  ctx.lineTo(cx + 190, 468);
  ctx.stroke();
  ctx.font = `800 26px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText('CHART SCORE', cx - 190, 500);
  ctx.textAlign = 'right';
  ctx.fillText(game.levelScore.toLocaleString('en-US'), cx + 190, 500);
  ctx.restore();
  const buttons = game.levelIndex + 1 < 10 ? completeButtons() : victoryButtons();
  for (const b of buttons) drawButton(ctx, b, game.hover === b.id, false);
}

function drawFailed(ctx, game) {
  const cx = VIEW_W / 2;
  drawPanel(ctx, cx - 300, 150, 600, 420, 'OUT OF COMETS', PALETTE.danger);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `19px ${FONT}`;
  ctx.fillText(`${game.level.name} got the better of you this time.`, cx, 268);
  ctx.fillText('Study the gravity rings, time the wanderers,', cx, 300);
  ctx.fillText('and slingshot around — never through — the Maw.', cx, 332);
  ctx.fillStyle = PALETTE.text;
  ctx.font = `17px ${FONT}`;
  ctx.fillText(`SCORE SO FAR  ${game.totalScore.toLocaleString('en-US')}`, cx, 396);
  ctx.restore();
  for (const b of failedButtons()) drawButton(ctx, b, game.hover === b.id, false);
}

function drawVictory(ctx, game) {
  const cx = VIEW_W / 2;
  drawPanel(ctx, cx - 320, 110, 640, 470, 'ALL CHARTS CLEAR!', PALETTE.gold);
  drawStars(ctx, cx, 258, Math.min(3, Math.round(game.totalStars / 10)), 54);
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.text;
  ctx.font = `21px ${FONT}`;
  ctx.fillText('You bent light around ten worlds and came home.', cx, 316);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `18px ${FONT}`;
  ctx.fillText(`${game.totalStars} / 30 stars  ·  ${game.totalShards} shards collected`, cx, 350);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = `800 30px ${FONT}`;
  ctx.fillText(`FINAL SCORE  ${game.totalScore.toLocaleString('en-US')}`, cx, 408);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = `16px ${FONT}`;
  if (game.totalScore > game.bestScore) {
    ctx.fillText('★ New best score! ★', cx, 448);
  } else if (game.bestScore > 0) {
    ctx.fillText(`Best score  ${game.bestScore.toLocaleString('en-US')}`, cx, 448);
  }
  ctx.restore();
  for (const b of victoryButtons()) drawButton(ctx, b, game.hover === b.id, false);
}

export function drawScene(ctx, game, time) {
  ctx.save();
  const shake = game.particles.shakeOffset();
  ctx.translate(shake.x, shake.y);
  drawBackground(ctx, game, time);
  if (game.state !== 'title' && game.state !== 'howto') {
    const level = game.level;
    for (const planet of level.planets) drawPlanet(ctx, planet, time);
    for (const hole of level.blackholes) drawBlackHole(ctx, hole, time);
    for (const portal of level.portals) drawPortal(ctx, portal, time);
    drawGate(ctx, level.gate, time);
    level.shards.forEach((s, i) => {
      if (!game.shardsCollected.has(i)) drawShard(ctx, s, time, i);
    });
    drawPad(ctx, level.pad, time);
    game.particles.drawTrail(ctx);
    if (game.comet.visible) drawComet(ctx, game.comet.x, game.comet.y, time);
    if (game.state === 'aim') drawAim(ctx, game);
    game.particles.draw(ctx);
    drawHud(ctx, game);
  } else {
    game.particles.draw(ctx);
  }
  ctx.restore();
  if (game.state === 'title') drawTitle(ctx, game, time);
  else if (game.state === 'howto') drawHowTo(ctx, game);
  else if (game.state === 'complete') drawComplete(ctx, game);
  else if (game.state === 'failed') drawFailed(ctx, game);
  else if (game.state === 'victory') drawVictory(ctx, game);
}
