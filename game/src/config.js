// Nova Arc — tuning constants and the visual palette. One place for every
// number the rest of the game shares, so balancing is a single edit.

// The playfield is a fixed 1280x720 logical space; the canvas scales to the window.
export const VIEW_W = 1280;
export const VIEW_H = 720;

// Physics: acceleration from a body is G * mass / (dist^2 + SOFT), so a comet
// feels a gentle bend far away and a hard slingshot up close without exploding.
export const GRAVITY_G = 30000;
export const GRAVITY_SOFT = 900;
export const MAX_LAUNCH_SPEED = 760; // px per second at a full drag
export const DRAG_MAX = 230; // px of slingshot pull for full power
export const COMET_RADIUS = 7;
export const TRAIL_MAX = 90; // points kept in the glowing trail
export const PREDICT_STEPS = 220; // dots simulated for the aim preview
export const PREDICT_DT = 1 / 60;

// Scoring.
export const LEVEL_BASE_SCORE = 1000;
export const UNUSED_SHOT_BONUS = 250;
export const SHARD_BONUS = 150;

// Palette: deep-space blues, warm gold for the goal, cyan for collectibles.
export const PALETTE = {
  skyTop: '#04050d',
  skyBottom: '#0d1b3e',
  nebulaA: 'rgba(88, 60, 180, 0.20)',
  nebulaB: 'rgba(20, 120, 160, 0.16)',
  nebulaC: 'rgba(200, 80, 120, 0.10)',
  hudBar: 'rgba(6, 10, 26, 0.72)',
  hudLine: 'rgba(140, 170, 255, 0.25)',
  text: '#eaf0ff',
  textDim: '#9fb0d8',
  gold: '#ffd76a',
  goldDim: '#c9a13b',
  cyan: '#6fe3ff',
  comet: '#fff3c4',
  panel: 'rgba(8, 14, 34, 0.92)',
  panelLine: 'rgba(150, 180, 255, 0.35)',
  button: '#1c2c5e',
  buttonHover: '#2a3f83',
  danger: '#ff5d73',
};

// Planet looks, cycled by index: a base colour, a darker rim and a glow tint.
export const PLANET_SKINS = [
  { base: '#c96f4a', dark: '#7a3a22', glow: 'rgba(201, 111, 74, 0.35)', ring: 'rgba(233, 150, 100, 0.20)' },
  { base: '#4aa8a0', dark: '#22605a', glow: 'rgba(74, 168, 160, 0.35)', ring: 'rgba(110, 220, 205, 0.20)' },
  { base: '#7a68c9', dark: '#453a7d', glow: 'rgba(122, 104, 201, 0.35)', ring: 'rgba(160, 140, 235, 0.20)' },
  { base: '#c9a13b', dark: '#7d5f1c', glow: 'rgba(201, 161, 59, 0.35)', ring: 'rgba(240, 200, 90, 0.20)' },
  { base: '#4a7ec9', dark: '#274a7d', glow: 'rgba(74, 126, 201, 0.35)', ring: 'rgba(110, 160, 240, 0.20)' },
  { base: '#c94a7a', dark: '#7d2749', glow: 'rgba(201, 74, 122, 0.35)', ring: 'rgba(235, 120, 160, 0.20)' },
];
