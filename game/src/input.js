// Nova Arc — mouse, touch and keyboard. Pointer input is a slingshot: press
// anywhere, drag back from the comet, release to launch. Buttons are hit-tested
// against the layouts render.js draws, so clicks land where the eye expects.
// The module only reports intents; main.js owns what they do.

import { VIEW_W, VIEW_H } from './config.js';

export class Input {
  constructor(canvas, hooks) {
    this.canvas = canvas;
    this.hooks = hooks; // {onPress(x,y), onMove(x,y), onRelease(x,y), onKey(key)}
    this.dragging = false;
    canvas.addEventListener('pointerdown', (e) => this.press(e));
    canvas.addEventListener('pointermove', (e) => this.move(e));
    canvas.addEventListener('pointerup', (e) => this.release(e));
    canvas.addEventListener('pointercancel', (e) => this.release(e));
    canvas.addEventListener('pointerleave', (e) => this.move(e));
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.hooks.onKey(e.key.toLowerCase());
    });
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  toGameCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VIEW_W,
      y: ((e.clientY - rect.top) / rect.height) * VIEW_H,
    };
  }

  press(e) {
    e.preventDefault();
    const p = this.toGameCoords(e);
    this.dragging = true;
    this.hooks.onPress(p.x, p.y);
  }

  move(e) {
    const p = this.toGameCoords(e);
    this.hooks.onMove(p.x, p.y);
    if (this.dragging) this.hooks.onDrag(p.x, p.y);
  }

  release(e) {
    if (!this.dragging) return;
    this.dragging = false;
    const p = this.toGameCoords(e);
    this.hooks.onRelease(p.x, p.y);
  }
}

export function hitButton(buttons, x, y) {
  for (const b of buttons) {
    if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) return b.id;
  }
  return null;
}
