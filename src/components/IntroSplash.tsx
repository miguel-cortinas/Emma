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
  framesLoaded: number;
  totalFrames: number;
}

export default function IntroSplash({ onEnter, framesLoaded, totalFrames }: IntroSplashProps) {
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false); // cargando frames post-tap
  const splashRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

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

  // ── Observar progreso de carga cuando loading === true ──────────
  useEffect(() => {
    if (!loading) return;
    if (totalFrames > 0 && framesLoaded >= totalFrames) {
      exitSplash();
    }
  }, [loading, framesLoaded, totalFrames, exitSplash]);

  // ── Tap en el botón: música + pantalla de carga ──────────────────
  const handleEnter = () => {
    // 1. Disparar la música (mismo gesto → el navegador lo permite)
    onEnter();

    // 2. Si ya están todos los frames cargados, salir directamente
    if (totalFrames > 0 && framesLoaded >= totalFrames) {
      document.body.style.overflow = '';
      exitSplash();
      return;
    }

    // 3. Mostrar pantalla de carga animada
    setLoading(true);

    // 4. Animar la transición del botón al loader
    gsap.to('.splash-button-area', {
      opacity: 0, y: 10, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        gsap.fromTo(loaderRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
        );
      },
    });
  };

  if (!visible) return null;

  const loadPercent = totalFrames > 0
    ? Math.min(100, Math.floor((framesLoaded / totalFrames) * 100))
    : 0;

  return (
    <div
      ref={splashRef}
      className="fixed top-0 left-0 w-full h-[100svh] flex flex-col items-center justify-center z-[200] overflow-hidden"
    >


      {/* ── Fondo: imagen 19.jpg ────────────────────────────────────────── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/19.jpg')",
        }}
      />

      {/* ── Capa de viñeta rosada sobre el patrón ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 55%, rgba(251,207,232,0.18) 0%, rgba(45, 10, 25, 0.65) 70%, rgba(25, 5, 15, 0.90) 100%)',
        }}
      />

      {/* ── Halo central suave ────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 55%, rgba(251,207,232,0.10) 0%, transparent 70%)',
        }}
      />

      {/* F1: Capa de destello de luz (flash radial) */}
      <div
        ref={flashRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(252,231,243,0.95) 0%, rgba(251,207,232,0.6) 40%, transparent 70%)',
          zIndex: 10,
        }}
      />

      {/* Contenido centrado */}
      <div
        className="splash-content relative flex flex-col items-center text-center px-8 gap-4 mt-12"
        style={{ zIndex: 5 }}
      >
        {/* Etiqueta superior */}
        <span className="splash-tagline text-[10px] tracking-[0.55em] text-pink-200/60 uppercase">
          te esperamos en el
        </span>

        {/* Script: "Baby Shower" */}
        <div className="splash-script font-script text-5xl sm:text-6xl text-pink-200/80">
          Baby Shower
        </div>

        {/* Nombre principal */}
        <div className="splash-name font-display text-[clamp(4.5rem,22vw,8rem)] leading-none text-white drop-shadow-[0_0_40px_rgba(251,207,232,0.4)]">
          Emma<br />Lucía
        </div>

        {/* Línea decorativa */}
        <div className="w-20 h-px my-4 bg-gradient-to-r from-transparent via-pink-300/50 to-transparent" />

        {/* Área de botón / loader — se intercambian con animación */}
        <div className="splash-button-area flex flex-col items-center gap-4" style={{ minHeight: '80px' }}>
          {/* Botón de entrada */}
          <button
            ref={btnRef}
            onClick={handleEnter}
            type="button"
            disabled={loading}
            className="group relative flex items-center px-10 py-4 rounded-full overflow-hidden transition-all duration-500"
            style={{
              opacity: 0,          // GSAP lo anima
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(251,207,232,0.35)',
              boxShadow: '0 0 30px rgba(25,5,15,0.4)',
              backdropFilter: 'blur(12px)',
            }}
            onMouseEnter={e => {
              if (loading) return;
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'rgba(251,207,232,0.12)';
              el.style.borderColor = 'rgba(251,207,232,0.6)';
              el.style.boxShadow = '0 0 40px rgba(251,207,232,0.2)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement;
              el.style.background = 'rgba(255,255,255,0.07)';
              el.style.borderColor = 'rgba(251,207,232,0.35)';
              el.style.boxShadow = '0 0 30px rgba(25,5,15,0.4)';
            }}
          >
            {/* Shimmer en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-100/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease_1] skew-x-[-20deg]" />

            <span
              className="relative text-sm tracking-[0.25em] uppercase text-white/90 group-hover:text-white transition-colors duration-300"
            >
              Abrir invitación
            </span>
          </button>
        </div>

        {/* Pantalla de carga (se revela sobre el botón con GSAP) */}
        <div
          ref={loaderRef}
          className="absolute flex flex-col items-center gap-5"
          style={{
            opacity: 0,
            marginTop: '0px',
            // reposicionado dinámicamente: se muestra donde estaba el botón
            position: 'relative',
            top: 'auto',
          }}
        >
          {/* Spinner + porcentaje */}
          <div className="flex flex-col items-center gap-3">
            {/* Anillo giratorio */}
            <div className="splash-spinner" />

            {/* Texto de preparando */}
            <p
              className="text-[9px] tracking-[0.45em] uppercase text-pink-200/50"
            >
              Preparando experiencia…
            </p>
          </div>

          {/* Barra de progreso de frames */}
          <div className="flex flex-col items-center gap-2" style={{ width: '160px' }}>
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${loadPercent}%`,
                  background: 'linear-gradient(90deg, rgba(251,207,232,0.6), rgba(251,207,232,0.9))',
                  transition: 'width 0.4s ease-out',
                  boxShadow: '0 0 12px rgba(251,207,232,0.5)',
                }}
              />
            </div>
            <p
              className="text-[8px] tracking-[0.4em] uppercase text-center"
              style={{ color: 'rgba(251,207,232,0.35)' }}
            >
              {loadPercent}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
