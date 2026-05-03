import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/* ────────────────────────────────────────────────────────────────────
   IntroSplash
   • Pantalla de bienvenida que aparece ENCIMA de todo
   • El usuario toca "Abrir invitación" → música arranca + splash
     se desvanece con transición cinematográfica + destello de luz
   • onEnter: callback que dispara la música (conectado a MusicPlayer)
──────────────────────────────────────────────────────────────────── */

interface IntroSplashProps {
  onEnter: () => void;
}

export default function IntroSplash({ onEnter }: IntroSplashProps) {
  const [visible, setVisible] = useState(true);
  const splashRef = useRef<HTMLDivElement>(null);
  const btnRef    = useRef<HTMLButtonElement>(null);
  const flashRef  = useRef<HTMLDivElement>(null);

  // ── Bloquear scroll del body mientras el splash está activo ──────
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // ── Animación de entrada del splash ───────────────────────────
  useGSAP(() => {
    if (!splashRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo('.splash-name',
      { opacity: 0, y: 30, filter: 'blur(12px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)',
        duration: 1.4, ease: 'power3.out' }
    )
    .fromTo('.splash-script',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
      '-=0.6'
    )
    .fromTo('.splash-tagline',
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo(btnRef.current,
      { opacity: 0, scale: 0.88, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(2)' },
      '-=0.3'
    );
  }, { scope: splashRef });

  // ── Tap en el botón: música + salida cinematográfica ──────────
  const handleEnter = () => {
    // 1. Disparar la música (lo hace el padre via callback)
    onEnter();

    // 2. Restaurar scroll inmediatamente
    document.body.style.overflow = '';

    // 3. Animación de salida del splash con destello de luz (F1)
    const tl = gsap.timeline({
      onComplete: () => setVisible(false),
    });

    // Destello de luz: flash radial blanco-rosado en el centro
    tl.fromTo(flashRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 2.5, duration: 0.35, ease: 'power2.out' }
    )
    .to(flashRef.current,
      { opacity: 0, scale: 3.5, duration: 0.55, ease: 'power2.in' },
      '-=0.05'
    )
    // Contenido del splash se desvanece con el flash
    .to('.splash-content', {
      opacity: 0,
      scale:   1.06,
      duration: 0.5,
      ease:    'power2.inOut',
    }, 0.1)
    .to(splashRef.current, {
      opacity:  0,
      duration: 0.5,
      ease:    'power2.inOut',
    }, '-=0.15');
  };

  if (!visible) return null;

  return (
    <div
      ref={splashRef}
      className="fixed inset-0 flex flex-col items-center justify-center z-[200] overflow-hidden"
      style={{
        // F2: gradiente radial cálido en lugar de negro puro
        background: 'radial-gradient(ellipse at 50% 60%, #1a0510 0%, #050005 60%, #000 100%)',
      }}
    >
      {/* F1: Capa de destello de luz (flash radial) */}
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,228,230,0.95) 0%, rgba(254,205,211,0.6) 40%, transparent 70%)',
          zIndex: 10,
        }}
      />

      {/* Halo de fondo suave */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(254,205,211,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Contenido centrado */}
      <div className="splash-content relative flex flex-col items-center text-center px-8 gap-4" style={{ zIndex: 5 }}>

        {/* Etiqueta superior */}
        <span className="splash-tagline text-[10px] tracking-[0.55em] text-rose-200/50 uppercase">
          te esperamos en el
        </span>

        {/* Script: "Baby Shower" */}
        <div
          className="splash-script text-4xl sm:text-5xl text-rose-200/80"
          style={{ fontFamily: "'Great Vibes', cursive" }}
        >
          Baby Shower
        </div>

        {/* Nombre principal */}
        <div
          className="splash-name leading-none text-white"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize:   'clamp(3.8rem, 18vw, 8rem)',
            textShadow: '0 0 40px rgba(254,205,211,0.4), 0 0 80px rgba(254,205,211,0.15)',
          }}
        >
          Emma<br />Lucía
        </div>

        {/* Línea decorativa */}
        <div className="w-20 h-px my-4 bg-gradient-to-r from-transparent via-rose-300/50 to-transparent" />

        {/* Botón de entrada */}
        <button
          ref={btnRef}
          onClick={handleEnter}
          type="button"
          className="group relative flex items-center px-10 py-4 rounded-full overflow-hidden transition-all duration-500"
          style={{
            opacity:        0,          // GSAP lo anima
            background:     'rgba(255,255,255,0.05)',
            border:         '1px solid rgba(254,205,211,0.3)',
            boxShadow:      '0 0 30px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background   = 'rgba(254,205,211,0.1)';
            el.style.borderColor  = 'rgba(254,205,211,0.6)';
            el.style.boxShadow    = '0 0 40px rgba(254,205,211,0.2)';
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement;
            el.style.background   = 'rgba(255,255,255,0.05)';
            el.style.borderColor  = 'rgba(254,205,211,0.3)';
            el.style.boxShadow    = '0 0 30px rgba(0,0,0,0.4)';
          }}
        >
          {/* Shimmer en hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-100/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease_1] skew-x-[-20deg]" />

          <span
            className="relative text-sm tracking-[0.25em] uppercase text-white/90 group-hover:text-white transition-colors duration-300"
          >
            Abrir invitación
          </span>
        </button>

      </div>
    </div>
  );
}
