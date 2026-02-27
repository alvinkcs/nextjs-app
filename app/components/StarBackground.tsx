'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

export default function StarBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let stars: Star[] = [];
    const shootingStars: ShootingStar[] = [];

    const nebulaSpots = [
      { x: 0.2, y: 0.3, r: 0.15, color: [102, 126, 234] },
      { x: 0.7, y: 0.15, r: 0.12, color: [118, 75, 162] },
      { x: 0.5, y: 0.7, r: 0.18, color: [78, 205, 196] },
      { x: 0.85, y: 0.6, r: 0.1, color: [255, 107, 138] },
      { x: 0.15, y: 0.8, r: 0.13, color: [102, 126, 234] },
    ];

    const init = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = window.innerWidth;
      const h = window.innerHeight;

      stars = [];
      for (let i = 0; i < 350; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 2 + 0.3,
          brightness: Math.random() * 0.7 + 0.3,
          twinkleSpeed: Math.random() * 2 + 0.5,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    };

    init();

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);

    let lastTime = 0;

    const loop = (now: number) => {
      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 16.667, 3);
      lastTime = now;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const time = now * 0.001;

      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, w, h);

      for (const n of nebulaSpots) {
        const nx = n.x * w;
        const ny = n.y * h;
        const nr = n.r * Math.max(w, h);
        const drift = Math.sin(time * 0.1 + n.x * 10) * 20;
        const gradient = ctx.createRadialGradient(nx + drift, ny, 0, nx + drift, ny, nr);
        gradient.addColorStop(0, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0.06)`);
        gradient.addColorStop(0.5, `rgba(${n.color[0]}, ${n.color[1]}, ${n.color[2]}, 0.02)`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      for (const star of stars) {
        const twinkle = (Math.sin(time * star.twinkleSpeed + star.twinkleOffset) + 1) / 2;
        const alpha = star.brightness * (0.4 + twinkle * 0.6);

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        if (star.size > 1.3) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200, 210, 255, ${alpha * 0.12})`;
          ctx.fill();
        }
      }

      if (Math.random() < 0.004 * dt) {
        shootingStars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.4,
          vx: (3 + Math.random() * 5) * (Math.random() > 0.5 ? 1 : -1),
          vy: 2 + Math.random() * 4,
          life: 1,
          size: 1 + Math.random() * 1.5,
        });
      }

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx * dt * 3;
        ss.y += ss.vy * dt * 3;
        ss.life -= 0.02 * dt;

        if (ss.life <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        const trail = 25 * ss.life;
        const gradient = ctx.createLinearGradient(
          ss.x, ss.y,
          ss.x - ss.vx * trail * 0.3, ss.y - ss.vy * trail * 0.3
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${ss.life})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = ss.size;
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * trail * 0.3, ss.y - ss.vy * trail * 0.3);
        ctx.stroke();
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
