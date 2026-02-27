'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Vec2 {
  x: number;
  y: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

interface Decoration {
  x: number;
  y: number;
  type: 'tree' | 'rock' | 'bush' | 'flower';
  size: number;
  hue: number;
}

const AVATAR_SPEED = 4;
const CAMERA_SMOOTHING = 0.06;
const WORLD_SIZE = 3000;
const GRID_SIZE = 80;

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(-4, -20, 8, 28);

  ctx.fillStyle = '#2d7a3a';
  ctx.beginPath();
  ctx.moveTo(0, -55);
  ctx.lineTo(-22, -18);
  ctx.lineTo(22, -18);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3a9e4a';
  ctx.beginPath();
  ctx.moveTo(0, -45);
  ctx.lineTo(-18, -15);
  ctx.lineTo(18, -15);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawRock(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#8a8a8a';
  ctx.beginPath();
  ctx.ellipse(0, -4, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#9e9e9e';
  ctx.beginPath();
  ctx.ellipse(-2, -6, 10, 7, -0.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawBush(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, hue: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.beginPath();
  ctx.ellipse(0, 5, 18, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const g = 100 + Math.floor(hue * 50);
  ctx.fillStyle = `rgb(40, ${g}, 50)`;
  ctx.beginPath();
  ctx.arc(-6, -5, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(6, -4, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, -10, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFlower(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number, hue: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.strokeStyle = '#3a7a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.lineTo(0, -4);
  ctx.stroke();

  const colors = ['#ff6b8a', '#ffaa4d', '#ff4d6a', '#ff8866', '#dd66ff'];
  const color = colors[Math.floor(hue * colors.length)];
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(angle) * 5;
    const py = Math.sin(angle) * 5 - 4;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px, py, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ffdd44';
  ctx.beginPath();
  ctx.arc(0, -4, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawAvatar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bob: number,
  isMoving: boolean,
  facingRight: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.beginPath();
  ctx.ellipse(0, 12, 14, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const lean = isMoving ? (facingRight ? 2 : -2) : 0;

  ctx.fillStyle = '#3366cc';
  ctx.beginPath();
  ctx.roundRect(-10 + lean, -14 + bob, 20, 24, 4);
  ctx.fill();

  ctx.fillStyle = '#4488ee';
  ctx.beginPath();
  ctx.roundRect(-8 + lean, -12 + bob, 16, 10, 3);
  ctx.fill();

  ctx.fillStyle = '#ffcc88';
  ctx.beginPath();
  ctx.arc(0 + lean, -24 + bob, 10, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffddaa';
  ctx.beginPath();
  ctx.arc(0 + lean, -24 + bob, 9, 0, Math.PI * 2);
  ctx.fill();

  const eyeX = facingRight ? 2 : -2;
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(-3 + eyeX + lean, -26 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3 + eyeX + lean, -26 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  if (!isMoving) {
    ctx.strokeStyle = '#cc6644';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(eyeX + lean, -22 + bob, 3, 0.1, Math.PI - 0.1);
    ctx.stroke();
  }

  ctx.fillStyle = '#553322';
  ctx.beginPath();
  ctx.ellipse(0 + lean, -33 + bob, 11, 4, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-11 + lean, -33 + bob, 22, 2);

  ctx.restore();
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pos: Vec2,
  isMoving: boolean,
  hasKeyboard: boolean
) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(width - 200, 10, 190, 70, 8);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = '12px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`X: ${Math.round(pos.x)}`, width - 20, 35);
  ctx.fillText(`Y: ${Math.round(pos.y)}`, width - 20, 52);
  ctx.fillText(isMoving ? 'Moving...' : 'Idle', width - 20, 69);

  const hint = hasKeyboard
    ? 'Click or use WASD / Arrow keys'
    : 'Click anywhere to move';
  const hintWidth = Math.max(200, ctx.measureText(hint).width + 40);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(width / 2 - hintWidth / 2, height - 45, hintWidth, 35, 8);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(hint, width / 2, height - 22);
}

const KEYBOARD_SPEED = 5;
const KEY_MOVE_MAP: Record<string, Vec2> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
  W: { x: 0, y: -1 },
  S: { x: 0, y: 1 },
  A: { x: -1, y: 0 },
  D: { x: 1, y: 0 },
};

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  const avatar = useRef<Vec2>({ x: 0, y: 0 });
  const target = useRef<Vec2 | null>(null);
  const camera = useRef<Vec2>({ x: 0, y: 0 });
  const bobPhase = useRef(0);
  const moving = useRef(false);
  const facingRight = useRef(true);
  const ripples = useRef<Ripple[]>([]);
  const dust = useRef<Particle[]>([]);
  const decorations = useRef<Decoration[]>([]);
  const lastTime = useRef(0);
  const dprRef = useRef(1);
  const keysDown = useRef<Set<string>>(new Set());
  const hasKeyboard = useRef(false);
  const cssWidth = useRef(0);
  const cssHeight = useRef(0);

  useEffect(() => {
    const rng = seededRandom(42);
    const decs: Decoration[] = [];
    const types: Decoration['type'][] = ['tree', 'rock', 'bush', 'flower'];

    while (decs.length < 120) {
      const dx = (rng() - 0.5) * WORLD_SIZE;
      const dy = (rng() - 0.5) * WORLD_SIZE;
      if (Math.abs(dx) < 60 && Math.abs(dy) < 60) continue;

      decs.push({
        x: dx,
        y: dy,
        type: types[Math.floor(rng() * types.length)],
        size: 0.5 + rng() * 0.8,
        hue: rng(),
      });
    }
    decorations.current = decs;
  }, []);

  const setTargetFromScreen = useCallback((screenX: number, screenY: number) => {
    const cw = cssWidth.current;
    const ch = cssHeight.current;
    if (!cw || !ch) return;

    const wx = screenX + camera.current.x - cw / 2;
    const wy = screenY + camera.current.y - ch / 2;

    const half = WORLD_SIZE / 2;
    const clampedX = Math.max(-half, Math.min(half, wx));
    const clampedY = Math.max(-half, Math.min(half, wy));

    target.current = { x: clampedX, y: clampedY };
    moving.current = true;

    if (clampedX > avatar.current.x) facingRight.current = true;
    else if (clampedX < avatar.current.x) facingRight.current = false;

    ripples.current.push({ x: clampedX, y: clampedY, radius: 0, opacity: 1 });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    setTargetFromScreen(e.clientX - rect.left, e.clientY - rect.top);
  }, [setTargetFromScreen]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (KEY_MOVE_MAP[e.key]) {
      e.preventDefault();
      keysDown.current.add(e.key);
      hasKeyboard.current = true;
      target.current = null;
    }
  }, []);

  const handleKeyUp = useCallback((e: React.KeyboardEvent<HTMLCanvasElement>) => {
    keysDown.current.delete(e.key);
  }, []);

  // Consolidated effect: resize, game loop, keyboard
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      const cw = parent.clientWidth;
      const ch = parent.clientHeight;
      cssWidth.current = cw;
      cssHeight.current = ch;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = (now: number) => {
      if (lastTime.current === 0) lastTime.current = now;
      const rawDt = (now - lastTime.current) / 16.667;
      const dt = Math.min(rawDt, 3); // cap to avoid spiral on tab switch
      lastTime.current = now;

      const dpr = dprRef.current;
      const w = cssWidth.current;
      const h = cssHeight.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Keyboard movement
      let kx = 0;
      let ky = 0;
      keysDown.current.forEach((key) => {
        const dir = KEY_MOVE_MAP[key];
        if (dir) {
          kx += dir.x;
          ky += dir.y;
        }
      });
      if (kx !== 0 || ky !== 0) {
        const len = Math.sqrt(kx * kx + ky * ky);
        avatar.current.x += (kx / len) * KEYBOARD_SPEED * dt;
        avatar.current.y += (ky / len) * KEYBOARD_SPEED * dt;

        const half = WORLD_SIZE / 2;
        avatar.current.x = Math.max(-half, Math.min(half, avatar.current.x));
        avatar.current.y = Math.max(-half, Math.min(half, avatar.current.y));

        moving.current = true;
        if (kx > 0) facingRight.current = true;
        else if (kx < 0) facingRight.current = false;

        if (Math.random() < 0.35 * dt) {
          dust.current.push({
            x: avatar.current.x + (Math.random() - 0.5) * 12,
            y: avatar.current.y + 10 + Math.random() * 5,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -Math.random() * 0.4 - 0.1,
            life: 1,
            size: 2 + Math.random() * 3,
          });
        }
      } else if (!target.current) {
        moving.current = false;
      }

      bobPhase.current = (bobPhase.current + (moving.current ? 0.12 : 0.04) * dt) % (Math.PI * 200);

      // Click-to-move
      if (target.current && keysDown.current.size === 0) {
        const dx = target.current.x - avatar.current.x;
        const dy = target.current.y - avatar.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 3) {
          const step = Math.min(AVATAR_SPEED * dt, dist * 0.08 * dt);
          avatar.current.x += (dx / dist) * step;
          avatar.current.y += (dy / dist) * step;
          moving.current = true;

          if (Math.random() < 0.35 * dt) {
            dust.current.push({
              x: avatar.current.x + (Math.random() - 0.5) * 12,
              y: avatar.current.y + 10 + Math.random() * 5,
              vx: (Math.random() - 0.5) * 0.8,
              vy: -Math.random() * 0.4 - 0.1,
              life: 1,
              size: 2 + Math.random() * 3,
            });
          }
        } else {
          avatar.current.x = target.current.x;
          avatar.current.y = target.current.y;
          moving.current = false;
          target.current = null;
        }
      }

      // Frame-rate independent camera lerp
      const camSmooth = 1 - Math.pow(1 - CAMERA_SMOOTHING, dt);
      camera.current.x = lerp(camera.current.x, avatar.current.x, camSmooth);
      camera.current.y = lerp(camera.current.y, avatar.current.y, camSmooth);

      ripples.current = ripples.current.filter((r) => {
        r.radius += 1.5 * dt;
        r.opacity -= 0.015 * dt;
        return r.opacity > 0;
      });

      dust.current = dust.current.filter((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= 0.018 * dt;
        return p.life > 0;
      });

      // --- Render ---
      const ox = w / 2 - camera.current.x;
      const oy = h / 2 - camera.current.y;

      ctx.fillStyle = '#4a7c59';
      ctx.fillRect(0, 0, w, h);

      const gStartX = Math.floor((camera.current.x - w / 2) / GRID_SIZE) * GRID_SIZE;
      const gStartY = Math.floor((camera.current.y - h / 2) / GRID_SIZE) * GRID_SIZE;
      const gEndX = camera.current.x + w / 2;
      const gEndY = camera.current.y + h / 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let gx = gStartX; gx <= gEndX; gx += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(gx + ox, 0);
        ctx.lineTo(gx + ox, h);
        ctx.stroke();
      }
      for (let gy = gStartY; gy <= gEndY; gy += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, gy + oy);
        ctx.lineTo(w, gy + oy);
        ctx.stroke();
      }

      const half = WORLD_SIZE / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(-half + ox, -half + oy, WORLD_SIZE, WORLD_SIZE);
      ctx.setLineDash([]);

      const sortables: Array<{ y: number; draw: () => void }> = [];

      for (const dec of decorations.current) {
        const sx = dec.x + ox;
        const sy = dec.y + oy;
        if (sx < -60 || sx > w + 60 || sy < -80 || sy > h + 60) continue;

        sortables.push({
          y: dec.y,
          draw: () => {
            if (dec.type === 'tree') drawTree(ctx, sx, sy, dec.size);
            else if (dec.type === 'rock') drawRock(ctx, sx, sy, dec.size);
            else if (dec.type === 'bush') drawBush(ctx, sx, sy, dec.size, dec.hue);
            else drawFlower(ctx, sx, sy, dec.size, dec.hue);
          },
        });
      }

      sortables.push({
        y: avatar.current.y,
        draw: () => {
          const ax = avatar.current.x + ox;
          const ay = avatar.current.y + oy;
          const bob = Math.sin(bobPhase.current) * (moving.current ? 4 : 2);
          drawAvatar(ctx, ax, ay, bob, moving.current, facingRight.current);
        },
      });

      sortables.sort((a, b) => a.y - b.y);
      for (const s of sortables) s.draw();

      for (const r of ripples.current) {
        const rx = r.x + ox;
        const ry = r.y + oy;
        ctx.beginPath();
        ctx.arc(rx, ry, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 220, 100, ${r.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      if (target.current && moving.current) {
        const tx = target.current.x + ox;
        const ty = target.current.y + oy;
        const pulse = Math.sin(bobPhase.current * 3) * 3;

        ctx.beginPath();
        ctx.arc(tx, ty, 10 + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 220, 100, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 220, 100, 0.9)';
        ctx.fill();
      }

      for (const p of dust.current) {
        const px = p.x + ox;
        const py = p.y + oy;
        ctx.beginPath();
        ctx.arc(px, py, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 140, 100, ${p.life * 0.4})`;
        ctx.fill();
      }

      drawHUD(ctx, w, h, avatar.current, moving.current, hasKeyboard.current);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []); // all mutable state lives in refs — stable deps

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      tabIndex={0}
      role="application"
      aria-label="Click-to-move adventure game. Click anywhere or use WASD and arrow keys to move your character."
      style={{ display: 'block', cursor: 'pointer', outline: 'none' }}
    />
  );
}
