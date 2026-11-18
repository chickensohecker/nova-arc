// Nova Arc — the game itself: a state machine (title, how-to, aim, flying,
// level complete, level failed, victory) over ten charts of gravity-slingshot
// puzzles. Drag back from the comet like a slingshot, release, and bend your
// flight around planets into the Star Gate. Shards and spare shots are points;
// three stars need a clean run.

import {
  VIEW_W,
  VIEW_H,
  DRAG_MAX,
  MAX_LAUNCH_SPEED,
  LEVEL_BASE_SCORE,
  UNUSED_SHOT_BONUS,
  SHARD_BONUS,
} from './config.js';
import { LEVELS } from './levels.js';
import { buildStarfield } from './random.js';
import { stepFlight, predictPath } from './physics.js';
import { sfx, unlockAudio, toggleMute } from './audio.js';
import { Particles } from './particles.js';
import {
  drawScene,
  titleButtons,
  howtoButtons,
  completeButtons,
  failedButtons,
  victoryButtons,
  hudButtons,
} from './render.js';
import { Input, hitButton } from './input.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const game = {
  state: 'title',
  levelIndex: 0,
  level: LEVELS[0],
  starfield: buildStarfield(7),
  comet: { x: 140, y: 360, vx: 0, vy: 0, visible: false },
  aim: { active: false, x: 0, y: 0 },
  prediction: null,
  shotsLeft: 3,
  shotsUsed: 0,
  shardsCollected: new Set(),
  score: 0,
  totalScore: 0,
  totalStars: 0,
  totalShards: 0,
  starsEarned: 0,
  levelScore: 0,
  levelScoreBase: 0,
  levelScoreShots: 0,
  levelScoreShards: 0,
  particles: new Particles(),
  time: 0,
  levelTime: 0,
  frozenTime: null,
  hover: null,
  muted: false,
  bestScore: 0,
  recoverAt: 0,
};

try {
  game.bestScore = parseInt(localStorage.getItem('nova-arc-best') || '0', 10) || 0;
} catch (e) {
  game.bestScore = 0;
}

function saveBest() {
  if (game.totalScore > game.bestScore) {
    game.bestScore = game.totalScore;
    try {
      localStorage.setItem('nova-arc-best', String(game.bestScore));
    } catch (e) {
      /* storage unavailable; best score just lives for the session */
    }
  }
}

game.startLevel = function (index, seed) {
  game.levelIndex = index;
  game.level = LEVELS[index];
  game.starfield = buildStarfield(seed == null ? 100 + index * 13 : seed);
  game.comet.x = game.level.pad.x;
  game.comet.y = game.level.pad.y;
  game.comet.vx = 0;
  game.comet.vy = 0;
  game.comet.visible = true;
  game.aim.active = false;
  game.prediction = null;
  game.shotsLeft = game.level.shots;
  game.shotsUsed = 0;
  game.shardsCollected = new Set();
  game.levelTime = 0;
  game.recoverAt = 0;
  game.particles.clear();
  game.state = 'aim';
};

function launchFromDrag() {
  const pad = game.level.pad;
  let dx = pad.x - game.aim.x;
  let dy = pad.y - game.aim.y;
  const len = Math.hypot(dx, dy);
  if (len < 14) {
    game.aim.active = false;
    game.prediction = null;
    return;
  }
  const cl = Math.min(len, DRAG_MAX);
  dx = (dx / len) * cl;
  dy = (dy / len) * cl;
  const speed = (cl / DRAG_MAX) * MAX_LAUNCH_SPEED;
  game.comet.vx = (dx / cl) * speed;
  game.comet.vy = (dy / cl) * speed;
  game.aim.active = false;
  game.prediction = null;
  game.shotsUsed += 1;
  game.shotsLeft -= 1;
  game.state = 'flying';
  game.particles.clear();
  sfx.launch();
}

function updateAim(x, y) {
  game.aim.x = x;
  game.aim.y = y;
  const pad = game.level.pad;
  let dx = pad.x - x;
  let dy = pad.y - y;
  const len = Math.hypot(dx, dy);
  if (len < 14) {
    game.prediction = null;
    return;
  }
  const cl = Math.min(len, DRAG_MAX);
  dx = (dx / len) * cl;
  dy = (dy / len) * cl;
  const speed = (cl / DRAG_MAX) * MAX_LAUNCH_SPEED;
  game.prediction = predictPath(
    game.level,
    (dx / cl) * speed,
    (dy / cl) * speed,
    game.levelTime,
  );
}

function finishLevel() {
  game.levelScoreBase = LEVEL_BASE_SCORE;
  game.levelScoreShots = (game.level.shots - game.shotsUsed) * UNUSED_SHOT_BONUS;
  game.levelScoreShards = game.shardsCollected.size * SHARD_BONUS;
  game.levelScore = game.levelScoreBase + game.levelScoreShots + game.levelScoreShards;
  const allShards = game.shardsCollected.size === game.level.shards.length;
  game.starsEarned =
    allShards && game.shotsUsed <= 2 ? 3 : allShards || game.shotsUsed <= 2 ? 2 : 1;
  game.totalStars += game.starsEarned;
  game.totalShards += game.shardsCollected.size;
  game.score += game.levelScore;
  game.totalScore = game.score;
  game.comet.visible = false;
  game.state = 'complete';
  sfx.capture();
}

function loseComet(kind) {
  game.particles.burst(game.comet.x, game.comet.y, '#ffd76a', 46, 320, 4);
  game.particles.burst(game.comet.x, game.comet.y, '#ff5d73', 26, 220, 3);
  game.particles.ring(game.comet.x, game.comet.y, 'rgba(255, 215, 106, 0.9)');
  game.particles.addShake(10);
  game.comet.visible = false;
  if (kind === 'swallowed') sfx.swallowed();
  else sfx.crash();
  if (game.shotsLeft > 0) {
    game.recoverAt = game.time + 0.9;
    game.state = 'recovering';
  } else {
    saveBest();
    game.state = 'failed';
    sfx.fail();
  }
}

function stepFlying(dt) {
  const sub = 1 / 120;
  let left = dt;
  let cooldown = game.portalCooldown || 0;
  while (left > 0) {
    const h = Math.min(sub, left);
    const hit = stepFlight(game.comet, game.level, game.levelTime, h, game.shardsCollected, cooldown);
    game.levelTime += h;
    left -= h;
    if (hit && hit.cooldown) cooldown = hit.cooldown;
    cooldown = Math.max(0, cooldown - h);
    if (!hit) continue;
    if (hit.event === 'shard') {
      game.shardsCollected.add(hit.index);
      game.score += SHARD_BONUS;
      game.totalScore = game.score;
      const s = game.level.shards[hit.index];
      game.particles.burst(s.x, s.y, '#6fe3ff', 22, 200, 3);
      game.particles.floatText(s.x, s.y - 14, `+${SHARD_BONUS}`, '#6fe3ff');
      sfx.collect();
    } else if (hit.event === 'portal') {
      game.particles.burst(game.comet.x, game.comet.y, '#b07fff', 26, 240, 3);
      game.particles.ring(game.comet.x, game.comet.y, 'rgba(176, 127, 255, 0.9)');
      sfx.portal();
      game.portalCooldown = 0.5;
    } else if (hit.event === 'gate') {
      game.particles.burst(game.comet.x, game.comet.y, '#ffd76a', 60, 380, 4);
      game.particles.ring(game.comet.x, game.comet.y, 'rgba(255, 215, 106, 0.9)');
      game.particles.floatText(game.comet.x, game.comet.y - 30, 'GATE!', '#ffd76a');
      finishLevel();
      return;
    } else if (hit.event === 'crash' || hit.event === 'swallowed' || hit.event === 'lost') {
      loseComet(hit.event);
      return;
    }
  }
  game.portalCooldown = cooldown;
  game.particles.pushTrail(game.comet.x, game.comet.y);
}

function buttonsForState() {
  switch (game.state) {
    case 'title':
      return titleButtons();
    case 'howto':
      return howtoButtons();
    case 'complete':
      return game.levelIndex + 1 < LEVELS.length ? completeButtons() : victoryButtons();
    case 'failed':
      return failedButtons();
    case 'victory':
      return victoryButtons();
    case 'aim':
    case 'flying':
    case 'recovering':
      return hudButtons();
    default:
      return [];
  }
}

function pressButton(id) {
  sfx.click();
  switch (id) {
    case 'play':
      game.score = 0;
      game.totalScore = 0;
      game.totalStars = 0;
      game.totalShards = 0;
      game.startLevel(0);
      break;
    case 'howto':
      game.state = 'howto';
      break;
    case 'back':
      game.state = 'title';
      break;
    case 'next':
      if (game.levelIndex + 1 < LEVELS.length) game.startLevel(game.levelIndex + 1);
      else {
        saveBest();
        game.state = 'victory';
        sfx.win();
      }
      break;
    case 'replay':
    case 'retry':
      game.startLevel(game.levelIndex);
      break;
    case 'menu':
      saveBest();
      game.state = 'title';
      break;
    case 'again':
      game.score = 0;
      game.totalScore = 0;
      game.totalStars = 0;
      game.totalShards = 0;
      game.startLevel(0);
      break;
    case 'mute':
      game.muted = toggleMute();
      break;
    case 'restart':
      game.startLevel(game.levelIndex);
      break;
    default:
      break;
  }
}

// Debug/testing hook: lets automated play-tests read the live game state.
window.__novaArc = game;

const input = new Input(canvas, {
  onPress(x, y) {
    unlockAudio();
    const id = hitButton(buttonsForState(), x, y);
    if (id) {
      pressButton(id);
      return;
    }
    if (game.state === 'aim') {
      game.aim.active = true;
      updateAim(x, y);
    }
  },
  onMove(x, y) {
    game.hover = hitButton(buttonsForState(), x, y);
  },
  onDrag(x, y) {
    if (game.state === 'aim' && game.aim.active) updateAim(x, y);
  },
  onRelease() {
    if (game.state === 'aim' && game.aim.active) launchFromDrag();
  },
  onKey(key) {
    unlockAudio();
    if (key === 'm') {
      game.muted = toggleMute();
      return;
    }
    if (key === 'r' && (game.state === 'aim' || game.state === 'flying' || game.state === 'recovering')) {
      game.startLevel(game.levelIndex);
      return;
    }
    if (key === 'h' && (game.state === 'title' || game.state === 'aim')) {
      game.state = game.state === 'howto' ? 'title' : 'howto';
      return;
    }
    if (key === 'escape') {
      if (game.state === 'howto') game.state = 'title';
      else if (game.state === 'aim' || game.state === 'flying') game.state = 'title';
      return;
    }
    if ((key === 'enter' || key === ' ') && game.state === 'title') {
      pressButton('play');
    } else if ((key === 'enter' || key === ' ') && game.state === 'complete') {
      pressButton('next');
    } else if ((key === 'enter' || key === ' ') && game.state === 'failed') {
      pressButton('retry');
    }
  },
});

// Deterministic screenshot mode: freeze on one frame and do not run the loop.
const params = new URLSearchParams(window.location.search);
if (applyShot(game, params)) {
  drawScene(ctx, game, game.frozenTime || 1.2);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    game.time += dt;
    if (game.state === 'flying') stepFlying(dt);
    else if (game.state === 'aim' || game.state === 'recovering') game.levelTime += dt;
    if (game.state === 'recovering' && game.time >= game.recoverAt) {
      game.comet.x = game.level.pad.x;
      game.comet.y = game.level.pad.y;
      game.comet.vx = 0;
      game.comet.vy = 0;
      game.comet.visible = true;
      game.particles.clear();
      game.state = 'aim';
    }
    game.particles.update(dt);
    drawScene(ctx, game, game.time);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
