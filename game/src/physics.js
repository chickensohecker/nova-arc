// Nova Arc — the flight model. One integrator drives both the live comet and
// the aim preview, so the dotted path you see is the path you fly.
//
// Bodies: planets pull with a softened inverse-square law, black holes pull
// much harder and swallow the comet, portals teleport it (keeping velocity) to
// their linked partner, shards are collected on contact, and the Star Gate
// captures the comet. A comet that hits a planet, falls into a black hole, or
// leaves the chart is lost.

import {
  GRAVITY_G,
  GRAVITY_SOFT,
  PREDICT_STEPS,
  PREDICT_DT,
  COMET_RADIUS,
  VIEW_W,
  VIEW_H,
} from './config.js';

const BOUNDS_MARGIN = 70;
const BLACKHOLE_PULL = 260; // effective mass of a black hole
const PORTAL_COOLDOWN = 0.5;

// Where a planet with an orbit is right now (t in seconds since level start).
export function planetPosition(planet, t) {
  if (!planet.orbit) return { x: planet.x, y: planet.y };
  const o = planet.orbit;
  const a = o.angle + o.speed * t;
  return { x: o.cx + Math.cos(a) * o.radius, y: o.cy + Math.sin(a) * o.radius };
}

// One gravity step: move the body by dt under every pull. Returns nothing;
// mutates body {x, y, vx, vy}. Pure except for the level it reads.
function gravityStep(body, level, t, dt) {
  let ax = 0;
  let ay = 0;
  for (const planet of level.planets) {
    const p = planetPosition(planet, t);
    const dx = p.x - body.x;
    const dy = p.y - body.y;
    const d2 = dx * dx + dy * dy + GRAVITY_SOFT;
    const pull = (GRAVITY_G * planet.mass) / (d2 * Math.sqrt(d2));
    ax += dx * pull;
    ay += dy * pull;
  }
  for (const hole of level.blackholes) {
    const dx = hole.x - body.x;
    const dy = hole.y - body.y;
    const d2 = dx * dx + dy * dy + GRAVITY_SOFT;
    const pull = (GRAVITY_G * BLACKHOLE_PULL) / (d2 * Math.sqrt(d2));
    ax += dx * pull;
    ay += dy * pull;
  }
  body.vx += ax * dt;
  body.vy += ay * dt;
  body.x += body.vx * dt;
  body.y += body.vy * dt;
}

// What happened this step, if anything: 'crash' | 'swallowed' | 'gate' |
// 'lost' | 'shard' (with index) | null. Portal hops are applied in place.
export function stepFlight(comet, level, t, dt, collected, portalCooldown) {
  gravityStep(comet, level, t, dt);

  for (const planet of level.planets) {
    const p = planetPosition(planet, t);
    const dx = comet.x - p.x;
    const dy = comet.y - p.y;
    if (dx * dx + dy * dy < (planet.r + COMET_RADIUS) * (planet.r + COMET_RADIUS)) {
      return { event: 'crash' };
    }
  }
  for (const hole of level.blackholes) {
    const dx = comet.x - hole.x;
    const dy = comet.y - hole.y;
    if (dx * dx + dy * dy < (hole.r + COMET_RADIUS) * (hole.r + COMET_RADIUS)) {
      return { event: 'swallowed' };
    }
  }
  if (portalCooldown <= 0) {
    for (const portal of level.portals) {
      const dx = comet.x - portal.x;
      const dy = comet.y - portal.y;
      if (dx * dx + dy * dy < portal.r * portal.r) {
        const other = level.portals[portal.link];
        comet.x = other.x;
        comet.y = other.y;
        return { event: 'portal', cooldown: PORTAL_COOLDOWN };
      }
    }
  }
  const g = level.gate;
  const gdx = comet.x - g.x;
  const gdy = comet.y - g.y;
  if (gdx * gdx + gdy * gdy < g.r * g.r) return { event: 'gate' };
  for (let i = 0; i < level.shards.length; i++) {
    if (collected.has(i)) continue;
    const s = level.shards[i];
    const dx = comet.x - s.x;
    const dy = comet.y - s.y;
    if (dx * dx + dy * dy < 26 * 26) return { event: 'shard', index: i };
  }
  if (
    comet.x < -BOUNDS_MARGIN || comet.x > VIEW_W + BOUNDS_MARGIN ||
    comet.y < -BOUNDS_MARGIN || comet.y > VIEW_H + BOUNDS_MARGIN
  ) {
    return { event: 'lost' };
  }
  return null;
}

// The aim preview: simulate from the pad with a launch velocity and return the
// dotted path (every third step) plus how the flight ends. Uses the same step
// function as live flight, so the preview never lies.
export function predictPath(level, vx, vy, t0) {
  const comet = { x: level.pad.x, y: level.pad.y, vx, vy };
  const points = [];
  const collected = new Set();
  let cooldown = 0;
  let outcome = 'flying';
  for (let i = 0; i < PREDICT_STEPS; i++) {
    const t = t0 + i * PREDICT_DT;
    const hit = stepFlight(comet, level, t, PREDICT_DT, collected, cooldown);
    if (hit && hit.cooldown) cooldown = hit.cooldown;
    cooldown = Math.max(0, cooldown - PREDICT_DT);
    if (i % 3 === 0) points.push({ x: comet.x, y: comet.y });
    if (hit) {
      if (hit.event === 'gate') outcome = 'gate';
      else if (hit.event === 'crash') outcome = 'crash';
      else if (hit.event === 'swallowed') outcome = 'swallowed';
      else if (hit.event === 'lost') outcome = 'lost';
      else if (hit.event === 'shard') collected.add(hit.index);
      if (outcome !== 'flying') break;
    }
  }
  return { points, outcome, shards: collected.size };
}
