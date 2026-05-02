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
}

export default function Particles() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const scrollRef  = useRef(0);  // 0..1 progreso de scroll

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: ParticleConfig[] = [];
    let animationFrameId: number;
    let t = 0; // tiempo global para twinkle

    // ── Tamaño del canvas ─────────────────────────────────────────
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };
    window.addEventListener('resize', resize, { passive: true });

    // ── Seguimiento de scroll ─────────────────────────────────────
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      scrollRef.current = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ── Crear partícula ───────────────────────────────────────────
    const createParticle = (): ParticleConfig => ({
      x:            Math.random() * canvas.width,
      y:            Math.random() * canvas.height,
      size:         Math.random() * 1.6 + 0.4,
      speedX:       (Math.random() - 0.5) * 0.25,
      speedY:       -(Math.random() * 0.5 + 0.05),
      opacity:      0,
      maxOpacity:   Math.random() * 0.45 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinklePhase: Math.random() * Math.PI * 2,
    });

    // ── Inicializar pool de partículas ────────────────────────────
    const init = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 10000), 120);
      particlesArray = Array.from({ length: count }, createParticle);
      // Distribuir fases para evitar flash inicial
      particlesArray.forEach(p => {
        p.y = Math.random() * canvas.height;
      });
    };

    resize();

    // ── Loop de animación ─────────────────────────────────────────
    const animate = () => {
      t++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scroll = scrollRef.current;

      // La densidad visible escala con el scroll:
      //   scroll 0   → 30% visibles
      //   scroll 0.7 → 70% visibles
      //   scroll 1.0 → 100% visibles (más denso en sección final)
      const visibleFraction = 0.3 + scroll * 0.7;
      const visibleCount    = Math.floor(particlesArray.length * visibleFraction);

      // Factor de brillo también aumenta con scroll
      const brightnessBoost = 0.8 + scroll * 0.8;

      for (let i = 0; i < visibleCount; i++) {
        const p = particlesArray[i];

        // Twinkle
        p.opacity = p.maxOpacity * brightnessBoost
          * (0.5 + 0.5 * Math.sin(t * p.twinkleSpeed + p.twinklePhase));

        // Movimiento
        p.x += p.speedX;
        p.y += p.speedY * (1 + scroll * 0.5); // más rápidas hacia el final

        // Reciclar al salir
        if (p.y < -10) {
          p.y = canvas.height + 10;
          p.x = Math.random() * canvas.width;
        }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        // Dibujar — mezcla de circulitos pequeños y destellos
        const alpha = Math.max(0, Math.min(1, p.opacity));
        if (alpha < 0.01) continue;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (i % 5 === 0 && p.size > 1.2) {
          // Destello cruciforme (+) para variedad
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
          // Partícula circular con glow
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
          grad.addColorStop(0,   'rgba(255, 240, 230, 1)');
          grad.addColorStop(0.4, 'rgba(254, 205, 211, 0.6)');
          grad.addColorStop(1,   'rgba(254, 205, 211, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

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
