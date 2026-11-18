// Nova Arc — a tiny seeded random generator (mulberry32) so the starfield and
// every deterministic screenshot look the same on every run with the same seed.

export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build the background starfield for a level: three parallax layers of stars
// plus a few soft nebula blobs. Deterministic for a given seed.
export function buildStarfield(seed) {
  const rng = makeRng(seed);
  const layers = [];
  const counts = [90, 55, 30];
  const sizes = [1.1, 1.7, 2.6];
  for (let l = 0; l < 3; l++) {
    const stars = [];
    for (let i = 0; i < counts[l]; i++) {
      stars.push({
        x: rng() * 1280,
        y: rng() * 720,
        r: sizes[l] * (0.6 + rng() * 0.8),
        twinkle: rng() * Math.PI * 2,
        speed: 0.4 + rng() * 1.2,
      });
    }
    layers.push(stars);
  }
  const nebulae = [];
  for (let i = 0; i < 5; i++) {
    nebulae.push({
      x: rng() * 1280,
      y: rng() * 720,
      r: 180 + rng() * 260,
      hue: i % 3,
      alpha: 0.5 + rng() * 0.5,
    });
  }
  return { layers, nebulae };
}
