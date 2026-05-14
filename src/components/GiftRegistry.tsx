import React, { useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Gift } from 'lucide-react';
import ScrollFloat from './ScrollFloat';

/* ── Confetti de pétalos ─────────────────────────────────────────── */
function spawnConfetti(origin: HTMLElement) {
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const colors = ['#fecdd3', '#fbcfe8', '#fda4af', '#f9a8d4', '#fff1f2'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 6 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (i / count) * 360;
    const dist = Math.random() * 80 + 40;
    const tx = Math.cos((angle * Math.PI) / 180) * dist;
    const ty = Math.sin((angle * Math.PI) / 180) * dist - 30;
    const rot = Math.random() * 360;

    Object.assign(el.style, {
      position: 'fixed',
      left: `${cx}px`,
      top: `${cy}px`,
      width: `${size}px`,
      height: `${size * 0.6}px`,
      background: color,
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '9999',
      transform: 'translate(-50%, -50%)',
      opacity: '1',
    });

    document.body.appendChild(el);

    gsap.to(el, {
      x: tx,
      y: ty,
      rotation: rot,
      opacity: 0,
      scale: 0,
      duration: 0.9 + Math.random() * 0.4,
      ease: 'power2.out',
      onComplete: () => el.remove(),
    });
  }
}

/* ── Componente principal ─────────────────────────────────────────── */
export default function GiftRegistry() {
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Entrada en viewport ─────────────────────────────────────────
  useGSAP(() => {
    gsap.set(['.gift-card', '.gift-icon'], { willChange: 'opacity, transform' });

    gsap.fromTo('.gift-card',
      { opacity: 0, y: 40, scale: 0.97 },
      {
        opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 82%',
          once: true,
          onComplete: () => gsap.set('.gift-card', { willChange: 'auto' }),
        },
      }
    );

    gsap.fromTo('.gift-icon',
      { rotation: -15, scale: 0.75, opacity: 0 },
      {
        rotation: 0, scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2)',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 78%',
          once: true,
          onComplete: () => gsap.set('.gift-icon', { willChange: 'auto' }),
        },
      }
    );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-20 relative"
    >
      {/* Títulos */}
      <div className="flex flex-col items-center gap-2 mb-16">
        <ScrollFloat
          containerClassName="text-5xl sm:text-6xl text-white drop-shadow-md text-center z-10 relative"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Mesa de Regalos
        </ScrollFloat>

        <div
          className="text-4xl sm:text-5xl text-rose-200/90 -rotate-2 drop-shadow-sm text-center z-20 relative"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Lluvia de Sobres
        </div>
      </div>

      {/* ── Tarjeta glassmorphism ─────────────────────────────────── */}
      <div className="gift-card relative w-full max-w-lg rounded-[2rem] p-8 md:p-12 flex flex-col items-center text-center"
        style={{
          background: 'rgba(120,10,35,0.18)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(254,205,211,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(254,205,211,0.1)',
        }}
      >
        {/* Resplandor superior */}
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent" />

        {/* Icono con rotación de entrada */}
        <div className="gift-icon w-16 h-16 bg-gradient-to-br from-rose-200 to-pink-300 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(254,205,211,0.4)]">
          <Gift className="w-8 h-8 text-rose-950" />
        </div>

        <p className="text-rose-50/90 text-base md:text-lg leading-relaxed mb-4 font-light max-w-sm">
          Tu presencia es nuestro regalo más valioso.
        </p>
        <p className="text-rose-50/80 text-sm md:text-base leading-relaxed font-light max-w-sm mb-4">
          Si deseas tener un detalle adicional con{' '}
          <strong className="font-normal text-white">Emma Lucía</strong>,
          puedes contribuir con la lluvia de sobres o con lo que brinde tu corazón.
        </p>

      </div>
    </section>
  );
}
