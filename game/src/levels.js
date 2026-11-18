// Nova Arc — the ten charts. Each chart is one puzzle: a launch pad, a Star
// Gate to reach, planets whose gravity bends the comet, optional black holes
// (a hard pull that swallows the comet), portals (a linked pair that flings the
// comet across the chart) and star shards to collect on the way. Coordinates
// live in the 1280x720 playfield. Shots are the comet launches a chart allows.

export const LEVELS = [
  {
    name: 'First Light',
    hint: 'Drag back from the comet, aim, and let go. Bend around the planet.',
    shots: 3,
    pad: { x: 140, y: 360 },
    gate: { x: 1140, y: 360, r: 26 },
    planets: [{ x: 640, y: 360, r: 30, mass: 90, skin: 0 }],
    shards: [{ x: 400, y: 180 }, { x: 640, y: 540 }, { x: 880, y: 180 }],
    blackholes: [],
    portals: [],
  },
  {
    name: 'Twin Suns',
    hint: 'Thread the gap between the two suns. The middle shard is a dare.',
    shots: 3,
    pad: { x: 140, y: 360 },
    gate: { x: 1150, y: 360, r: 26 },
    planets: [
      { x: 560, y: 240, r: 32, mass: 110, skin: 1 },
      { x: 720, y: 480, r: 32, mass: 110, skin: 4 },
    ],
    shards: [{ x: 640, y: 360 }, { x: 400, y: 600 }, { x: 900, y: 120 }],
    blackholes: [],
    portals: [],
  },
  {
    name: 'The Long Bend',
    hint: 'A heavy world sits above the line. Slingshot under its belly.',
    shots: 3,
    pad: { x: 140, y: 180 },
    gate: { x: 1140, y: 560, r: 26 },
    planets: [{ x: 640, y: 300, r: 44, mass: 170, skin: 2 }],
    shards: [{ x: 640, y: 620 }, { x: 900, y: 300 }, { x: 350, y: 500 }],
    blackholes: [],
    portals: [],
  },
  {
    name: 'Crosswind',
    hint: 'Two crosswinds pull in opposite directions. Ride the first, dodge the second.',
    shots: 3,
    pad: { x: 140, y: 560 },
    gate: { x: 1150, y: 200, r: 26 },
    planets: [
      { x: 500, y: 200, r: 28, mass: 90, skin: 3 },
      { x: 800, y: 520, r: 28, mass: 90, skin: 5 },
    ],
    shards: [{ x: 640, y: 360 }, { x: 950, y: 600 }, { x: 300, y: 120 }],
    blackholes: [],
    portals: [],
  },
  {
    name: 'The Wanderer',
    hint: 'The Wanderer circles its star. Time your launch for the gap.',
    shots: 3,
    pad: { x: 140, y: 360 },
    gate: { x: 1150, y: 360, r: 26 },
    planets: [
      {
        x: 640, y: 360, r: 30, mass: 120, skin: 1,
        orbit: { cx: 640, cy: 360, radius: 140, angle: 0.6, speed: 0.35 },
      },
    ],
    shards: [{ x: 640, y: 120 }, { x: 640, y: 600 }, { x: 1000, y: 360 }],
    blackholes: [],
    portals: [],
  },
  {
    name: 'The Maw',
    hint: 'The Maw drinks light itself. Arc wide around it — or be eaten.',
    shots: 4,
    pad: { x: 140, y: 360 },
    gate: { x: 1150, y: 360, r: 26 },
    planets: [
      { x: 400, y: 180, r: 26, mass: 80, skin: 4 },
      { x: 880, y: 540, r: 26, mass: 80, skin: 0 },
    ],
    shards: [{ x: 640, y: 140 }, { x: 640, y: 580 }, { x: 980, y: 180 }],
    blackholes: [{ x: 640, y: 360, r: 14 }],
    portals: [],
  },
  {
    name: 'Twin Gates',
    hint: 'Fly into the violet ring and out the amber one, right beside the Gate.',
    shots: 3,
    pad: { x: 140, y: 540 },
    gate: { x: 1150, y: 180, r: 26 },
    planets: [{ x: 500, y: 480, r: 34, mass: 110, skin: 2 }],
    shards: [{ x: 640, y: 200 }, { x: 830, y: 360 }, { x: 1150, y: 600 }],
    blackholes: [],
    portals: [
      { x: 640, y: 200, r: 30, link: 1, hue: 0 },
      { x: 980, y: 520, r: 30, link: 0, hue: 1 },
    ],
  },
  {
    name: 'The Gauntlet',
    hint: 'Three worlds and a Maw in a row. One clean arc, no second chances.',
    shots: 4,
    pad: { x: 140, y: 360 },
    gate: { x: 1150, y: 360, r: 26 },
    planets: [
      { x: 420, y: 360, r: 28, mass: 100, skin: 0 },
      { x: 640, y: 240, r: 28, mass: 100, skin: 3 },
      { x: 860, y: 480, r: 28, mass: 100, skin: 5 },
    ],
    shards: [{ x: 530, y: 600 }, { x: 760, y: 120 }, { x: 1000, y: 240 }],
    blackholes: [{ x: 640, y: 560, r: 12 }],
    portals: [],
  },
  {
    name: 'Dance of Worlds',
    hint: 'Two worlds waltz across the sky. Launch when the floor is clear.',
    shots: 4,
    pad: { x: 140, y: 360 },
    gate: { x: 1150, y: 360, r: 26 },
    planets: [
      {
        x: 500, y: 360, r: 28, mass: 110, skin: 1,
        orbit: { cx: 500, cy: 360, radius: 120, angle: 0, speed: 0.4 },
      },
      {
        x: 820, y: 360, r: 28, mass: 110, skin: 4,
        orbit: { cx: 820, cy: 360, radius: 120, angle: Math.PI, speed: -0.35 },
      },
    ],
    shards: [{ x: 640, y: 120 }, { x: 640, y: 600 }, { x: 320, y: 360 }],
    blackholes: [],
    portals: [],
  },
  {
    name: 'The Grand Arc',
    hint: 'Everything at once. The final arc asks for your best shot.',
    shots: 5,
    pad: { x: 140, y: 600 },
    gate: { x: 1150, y: 420, r: 26 },
    planets: [
      {
        x: 560, y: 360, r: 30, mass: 120, skin: 2,
        orbit: { cx: 560, cy: 360, radius: 130, angle: 1.2, speed: 0.3 },
      },
      { x: 1000, y: 540, r: 30, mass: 100, skin: 3 },
    ],
    shards: [{ x: 640, y: 120 }, { x: 900, y: 620 }, { x: 1150, y: 120 }],
    blackholes: [{ x: 880, y: 200, r: 13 }],
    portals: [
      { x: 760, y: 540, r: 30, link: 1, hue: 0 },
      { x: 1080, y: 180, r: 30, link: 0, hue: 1 },
    ],
  },
];
