// Nova Arc — every sound is synthesized with WebAudio, no audio files. A tiny
// helper plays a shaped oscillator tone; each effect is a short recipe on top
// of it. Audio starts only after the player's first gesture (browsers demand
// it), and M or the speaker button mutes everything.

let ctx = null;
let master = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 0.5;
  return muted;
}

// Call from the first user gesture so later sounds are allowed to play.
export function unlockAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  } catch (e) {
    ctx = null;
  }
}

function tone(freq, dur, type, vol, slideTo, delay) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + (delay || 0);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noiseBurst(dur, vol, lowpass) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime;
  const len = Math.floor(ctx.sampleRate * dur);
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(t0);
}

export const sfx = {
  click() {
    tone(660, 0.07, 'sine', 0.25);
  },
  launch() {
    tone(220, 0.35, 'sawtooth', 0.16, 880);
    noiseBurst(0.25, 0.08, 2400);
  },
  collect() {
    tone(880, 0.1, 'sine', 0.3);
    tone(1318, 0.16, 'sine', 0.3, null, 0.07);
  },
  crash() {
    noiseBurst(0.35, 0.5, 900);
    tone(90, 0.4, 'sine', 0.5, 40);
  },
  swallowed() {
    tone(520, 0.5, 'sine', 0.35, 60);
    noiseBurst(0.4, 0.2, 500);
  },
  portal() {
    tone(420, 0.22, 'triangle', 0.3, 1250);
    tone(1250, 0.18, 'triangle', 0.22, 420, 0.1);
  },
  capture() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.3, null, i * 0.09));
  },
  win() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
      tone(f, 0.3, 'triangle', 0.28, null, i * 0.11),
    );
  },
  fail() {
    [392, 330, 262].forEach((f, i) => tone(f, 0.3, 'sine', 0.25, null, i * 0.14));
  },
};
