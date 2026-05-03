import React, { useEffect, useRef } from 'react';

interface ParticleConfig {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  maxOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  isCross: boolean;
}

// ─── Sprite cache: un canvas offscreen por "tamaño bucketizado" ───────────
// Evita crear radialGradient en cada frame (el principal cuello de botella GPU)
const spriteCache = new Map<number, HTMLCanvasElement>();
const getSprite = (size: number): HTMLCanvasElement => {
  const bucket = Math.round(size * 2) / 2; // cuantiza a 0.5px
  if (spriteCache.has(bucket)) return spriteCache.get(bucket)!;

  const r   = bucket * 3;
  const dim = r * 2 + 2;
  const oc  = document.createElement('canvas');
  oc.width  = dim;
  oc.height = dim;
  const octx = oc.getContext('2d')!;
  const cx   = r + 1;
  const grad = octx.createRadialGradient(cx, cx, 0, cx, cx, r);
  grad.addColorStop(0,   'rgba(255, 240, 230, 1)');
  grad.addColorStop(0.4, 'rgba(254, 205, 211, 0.6)');
  grad.addColorStop(1,   'rgba(254, 205, 211, 0)');
  octx.fillStyle = grad;
  octx.beginPath();
  octx.arc(cx, cx, r, 0, Math.PI * 2);
  octx.fill();

  spriteCache.set(bucket, oc);
  return oc;
};

export default function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Detección mobile para throttle de FPS
    const isMobile = window.matchMedia('(pointer: coarse)').matches;

    let particlesArray: ParticleConfig[] = [];
    let animationFrameId: number;
    let t = 0;
    let lastFrameTime = 0;
    // En móvil limitamos a ~30fps para liberar GPU para el canvas principal
    const fpsInterval = isMobile ? 1000 / 30 : 1000 / 60;

    // ── Tamaño del canvas (sin DPR para no multiplicar píxeles en el canvas de fondo) ──
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', resize, { passive: true });

    // ── Scroll ────────────────────────────────────────────────────────────
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Crear partícula ───────────────────────────────────────────────────
    const createParticle = (): ParticleConfig => {
      const size = Math.random() * 1.6 + 0.4;
      return {
        x:            Math.random() * canvas.width,
        y:            Math.random() * canvas.height,
        size,
        speedX:       (Math.random() - 0.5) * 0.2,
        speedY:       -(Math.random() * 0.4 + 0.05),
        opacity:      0,
        maxOpacity:   Math.random() * 0.45 + 0.1,
        twinkleSpeed: Math.random() * 0.018 + 0.006,
        twinklePhase: Math.random() * Math.PI * 2,
        isCross:      Math.random() < 0.15 && size > 1.2, // solo 15% son cruces
      };
    };

    // ── Pool de partículas ────────────────────────────────────────────────
    const init = () => {
      // En móvil reducimos el conteo a la mitad
      const base  = Math.floor((canvas.width * canvas.height) / 10000);
      const count = Math.min(isMobile ? Math.floor(base * 0.55) : base, isMobile ? 60 : 120);
      particlesArray = Array.from({ length: count }, createParticle);
    };

    resize();

    // ── Loop de animación con throttle de FPS ─────────────────────────────
    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < fpsInterval) return; // skip frame si no ha pasado suficiente tiempo
      lastFrameTime = timestamp - (elapsed % fpsInterval);

      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scroll = scrollRef.current;
      const visibleFraction = 0.3 + scroll * 0.7;
      const visibleCount    = Math.floor(particlesArray.length * visibleFraction);
      const brightnessBoost = 0.8 + scroll * 0.8;

      for (let i = 0; i < visibleCount; i++) {
        const p = particlesArray[i];

        // Twinkle
        p.opacity = p.maxOpacity * brightnessBoost
          * (0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.twinklePhase));

        // Movimiento
        p.x += p.speedX;
        p.y += p.speedY * (1 + scroll * 0.4);

        // Reciclar
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        const alpha = Math.max(0, Math.min(1, p.opacity));
        if (alpha < 0.01) continue;

        ctx.globalAlpha = alpha;

        if (p.isCross) {
          // Destello cruciforme ligero
          const s = p.size * 2.5;
          ctx.strokeStyle = 'rgba(255, 228, 230, 1)';
          ctx.lineWidth   = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x - s, p.y);
          ctx.lineTo(p.x + s, p.y);
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x, p.y + s);
          ctx.stroke();
        } else {
          // Usar sprite precalculado → sin createRadialGradient por frame
          const sprite = getSprite(p.size);
          const r      = p.size * 3;
          ctx.drawImage(sprite, p.x - r - 1, p.y - r - 1);
        }
      }

      ctx.globalAlpha = 1;
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5, mixBlendMode: 'screen' }}
    />
  );
}
