import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/* ────────────────────────────────────────────────────────────────────
   IntroSplash
   • Pantalla de bienvenida que aparece ENCIMA de todo
   • El usuario toca "Abrir invitación" → se muestra animación de carga
     mientras se precargan todos los frames del canvas
   • Cuando todos los frames están listos → transición cinematográfica
   • El fondo usa el patrón SVG futurista con turbulencia fractal
   • onEnter: callback que dispara la música
──────────────────────────────────────────────────────────────────── */

interface IntroSplashProps {
  onEnter: () => void;
}

export default function IntroSplash({ onEnter }: IntroSplashProps) {
  const [visible, setVisible] = useState(true);
  const splashRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

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

    tl.fromTo('.splash-tagline',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
    )
      .fromTo('.splash-script',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        '-=0.6'
      )
      .fromTo('.splash-name',
        { opacity: 0, y: 30, filter: 'blur(12px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.4, ease: 'power3.out'
        },
        '-=0.6'
      )
      .fromTo(btnRef.current,
        { opacity: 0, scale: 0.88, y: 16 },
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(2)' },
        '-=0.8'
      );
  }, { scope: splashRef });

  // ── Cuando todos los frames estén cargados, ejecutar salida ─────
  const exitSplash = useCallback(() => {
    // Restaurar scroll inmediatamente
    document.body.style.overflow = '';

    const tl = gsap.timeline({
      onComplete: () => setVisible(false),
    });

    // Destello de luz
    tl.fromTo(flashRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 2.5, duration: 0.35, ease: 'power2.out' }
    )
      .to(flashRef.current,
        { opacity: 0, scale: 3.5, duration: 0.55, ease: 'power2.in' },
        '-=0.05'
      )
      .to('.splash-content', {
        opacity: 0,
        scale: 1.06,
        duration: 0.5,
        ease: 'power2.inOut',
      }, 0.1)
      .to(splashRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      }, '-=0.15');
  }, []);

  // ── Tap en el botón: música + salida directa ───────────────────
  const handleEnter = () => {
    onEnter();
    document.body.style.overflow = '';
    exitSplash();
  };

  if (!visible) return null;

  return (
    <div
      ref={splashRef}
      className="fixed top-0 left-0 w-full h-[100svh] flex flex-col items-center justify-center z-[200] overflow-hidden"
      style={{ backgroundColor: '#C9A89B' }}
    >


      {/* ── Fondo: gradiente rosado de la paleta ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 130% 70% at 10% 0%,   #F5EDE8 0%, #E8B4B8 35%, transparent 65%)',
            'radial-gradient(ellipse 80%  60% at 90% 0%,   #EDD5C8 0%, #E8B4B8 40%, transparent 65%)',
            'radial-gradient(ellipse 70%  55% at 50% 40%,  #D4A4AC 0%, transparent 60%)',
            'radial-gradient(ellipse 100% 70% at 15% 100%, #C4848A 0%, transparent 55%)',
            'radial-gradient(ellipse 90%  60% at 85% 90%,  #B5767C 0%, transparent 55%)',
            'linear-gradient(150deg, #F0EAE0 0%, #E8B4B8 25%, #C9A89B 50%, #B5767C 75%, #8B6A72 100%)',
          ].join(', '),
        }}
      />

      {/* ── Halo central suave — realza el contenido ─────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 65% 55% at 50% 48%, rgba(252,234,235,0.20) 0%, transparent 65%)',
        }}
      />

      {/* F1: Capa de destello de luz (flash radial) */}
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(252,231,243,0.95) 0%, rgba(232,180,184,0.6) 40%, transparent 70%)',
          zIndex: 10,
        }}
      />

      {/* Contenido centrado */}
      <div
        className="splash-content relative flex flex-col items-center text-center px-8 gap-4 mt-12"
        style={{ zIndex: 5 }}
      >
        {/* Etiqueta superior */}
        <span className="splash-tagline text-[10px] tracking-[0.55em] text-dusty-200/60 uppercase">
          te esperamos en el
        </span>

        {/* Script: "Baby Shower" */}
        <div className="splash-script font-script text-5xl sm:text-6xl text-dusty-200/80">
          Baby Shower
        </div>

        {/* Nombre principal */}
        <div className="splash-name font-display text-[clamp(4.5rem,22vw,8rem)] leading-none text-dusty-50 drop-shadow-[0_0_40px_rgba(232,180,184,0.4)]">
          Emma<br />Lucía
        </div>

        {/* Línea decorativa */}
        <div className="w-20 h-px my-4 bg-gradient-to-r from-transparent via-dusty-400/50 to-transparent" />

        {/* Área de botón / loader — se intercambian con animación */}
        <div className="splash-button-area flex flex-col items-center gap-4" style={{ minHeight: '80px' }}>
          {/* Botón de entrada */}
          <button
            ref={btnRef}
            onClick={handleEnter}
            type="button"
            className="group relative flex items-center px-10 py-4 rounded-full overflow-hidden transition-all duration-500"
            style={{
              opacity: 0,          // GSAP lo anima
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(232,180,184,0.35)',
              boxShadow: '0 0 30px rgba(139,106,114,0.4)',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'rgba(232,180,184,0.12)';
              el.style.borderColor = 'rgba(232,180,184,0.6)';
              el.style.boxShadow = '0 0 40px rgba(232,180,184,0.2)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'rgba(255,255,255,0.07)';
              el.style.borderColor = 'rgba(232,180,184,0.35)';
              el.style.boxShadow = '0 0 30px rgba(139,106,114,0.4)';
            }}
          >
            {/* Shimmer en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dusty-100/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease_1] skew-x-[-20deg]" />

            <span
              className="relative text-sm tracking-[0.25em] uppercase text-dusty-50/90 group-hover:text-dusty-50 transition-colors duration-300"
            >
              Abrir invitación
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
