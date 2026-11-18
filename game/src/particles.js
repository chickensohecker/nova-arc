// Nova Arc — juice: the comet's glowing trail, explosion bursts, drifting
// sparkles, floating score text and screen shake. All of it is cheap canvas
// work, updated once per frame and drawn additively where it glows.

export class Particles {
  constructor() {
    this.list = [];
    this.texts = [];
    this.shake = 0;
    this.trail = [];
  }

  clear() {
    this.list.length = 0;
    this.texts.length = 0;
    this.trail.length = 0;
    this.shake = 0;
  }

  addShake(amount) {
    this.shake = Math.min(18, this.shake + amount);
  }

  shakeOffset() {
    if (this.shake < 0.3) return { x: 0, y: 0 };
    return {
      x: (Math.random() * 2 - 1) * this.shake,
      y: (Math.random() * 2 - 1) * this.shake,
    };
  }

  pushTrail(x, y) {
    this.trail.push({ x, y, life: 1 });
    if (this.trail.length > 90) this.trail.shift();
  }

  burst(x, y, color, count, speed, size) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      this.list.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        life: 1,
        decay: 0.8 + Math.random() * 1.4,
        size: size * (0.5 + Math.random()),
        color,
      });
    }
  }

  ring(x, y, color) {
    this.list.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 1,
      decay: 1.1,
      size: 6,
      color,
      ring: true,
    });
  }

  floatText(x, y, text, color) {
    this.texts.push({ x, y, text, color, life: 1 });
  }

  update(dt) {
    this.shake = Math.max(0, this.shake - dt * 26);
    for (const p of this.list) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 1.6 * dt;
      p.vy *= 1 - 1.6 * dt;
      p.life -= p.decay * dt;
    }
    this.list = this.list.filter((p) => p.life > 0);
    for (const t of this.texts) {
      t.y -= 34 * dt;
      t.life -= dt * 0.9;
    }
    this.texts = this.texts.filter((t) => t.life > 0);
    for (const t of this.trail) t.life -= dt * 1.1;
    this.trail = this.trail.filter((t) => t.life > 0);
  }

  drawTrail(ctx) {
    if (this.trail.length < 2) return;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i < this.trail.length; i++) {
      const a = this.trail[i - 1];
      const b = this.trail[i];
      const alpha = Math.max(0, b.life) * (i / this.trail.length);
      ctx.strokeStyle = `rgba(255, 214, 110, ${alpha * 0.55})`;
      ctx.lineWidth = 1 + (i / this.trail.length) * 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.list) {
      if (p.ring) {
        const r = (1 - p.life) * 90 + 8;
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.lineWidth = 3 * p.life + 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.stroke();
        continue;
      }
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, p.size * p.life), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 22px "Trebuchet MS", "Segoe UI", sans-serif';
    for (const t of this.texts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, t.life * 1.4));
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }
}
