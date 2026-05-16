import React, { useRef, useMemo } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import MagneticButton from './MagneticButton';

export default function ConfirmationSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Móvil: menos partículas para ahorrar GPU
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const particleCount = isMobile ? 28 : 55;

  const particleData = useMemo(() =>
    Array.from({ length: particleCount }, (_, i) => {
      const size = Math.random() * 5 + 1.5;
      const isLarge = i % 7 === 0;
      return {
        size,
        isLarge,
        left: Math.random() * 100,
        top: Math.random() * 110 + 10,
        w: isLarge ? size * 1.8 : size,
        h: isLarge ? size * 1.8 : size,
      };
    }),
    [particleCount]);

  const whatsappLink = "https://wa.me/526145038073?text=Hola!%20Confirmo%20mi%20asistencia%20al%20Baby%20Shower%20de%20Emma%20Luc%C3%ADa.";

  useGSAP(() => {
    // Texto de entrada — solo opacity + translateY (sin blur)
    gsap.fromTo('.fairy-text',
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0,
        duration: 1.2, stagger: 0.25, ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          once: true,
        },
      }
    );

    // Luciérnagas — promover a GPU antes de iniciar
    const fireflies = gsap.utils.toArray<HTMLElement>('.firefly');
    gsap.set(fireflies, { willChange: 'transform, opacity', force3D: true });

    fireflies.forEach((firefly) => {
      // Movimiento vertical
      gsap.to(firefly, {
        y: `-=${gsap.utils.random(300, 800)}`,
        duration: gsap.utils.random(9, 20),
        ease: 'none',
        repeat: -1,
        delay: gsap.utils.random(0, 5),
        force3D: true,
      });

      // Balanceo lateral
      gsap.to(firefly, {
        x: `+=${gsap.utils.random(-100, 100)}`,
        duration: gsap.utils.random(2, 5),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: gsap.utils.random(0, 3),
        force3D: true,
      });

      // Brillo (solo opacity — sin scale para reducir compositing)
      gsap.to(firefly, {
        opacity: gsap.utils.random(0.3, 0.9),
        duration: gsap.utils.random(1, 2.5),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: gsap.utils.random(0, 2),
      });
    });

  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 py-24 relative overflow-hidden"
    >
      {/* ── Sistema de partículas (Luciérnagas) ─────────────────────── */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {particleData.map((p, i) => (
          <div
            key={i}
            className="firefly absolute rounded-full"
            style={{
              width: `${p.w}px`,
              height: `${p.h}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              opacity: 0,
              background: p.isLarge
                ? 'radial-gradient(circle, rgba(255,240,230,1) 0%, rgba(232,180,184,0.6) 50%, transparent 100%)'
                : 'rgba(232,180,184,0.9)',
              boxShadow: p.isLarge
                ? '0 0 12px 3px rgba(232,180,184,0.7)'
                : '0 0 8px 2px rgba(232,180,184,0.6)',
            }}
          />
        ))}
      </div>

      {/* ── Contenido central ────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">

        {/* Decoración superior */}
        <div className="w-24 h-px mb-10 bg-gradient-to-r from-transparent via-dusty-400/60 to-transparent" aria-hidden="true" />

        {/* Título */}
        <h2
          className="fairy-text leading-none mb-6 font-display text-[clamp(3.5rem,12vw,7rem)] text-dusty-50"
          style={{
            textShadow: '0 0 40px rgba(255,255,255,0.35), 0 0 80px rgba(232,180,184,0.2)',
          }}
        >
          Te Esperamos
        </h2>

        {/* Subtítulo */}
        <p className="fairy-text text-dusty-100/90 text-lg md:text-xl font-light tracking-wide max-w-md mx-auto mb-12 drop-shadow-[0_2px_10px_rgba(139,106,114,0.5)]">
          Para vivir este momento juntos y celebrar la llegada de{' '}
          <span className="font-semibold text-dusty-50">Emma Lucía</span>.
        </p>

        {/* Separador decorativo */}
        <div className="fairy-text w-16 h-px mb-12 bg-gradient-to-r from-transparent via-dusty-400/50 to-transparent" aria-hidden="true" />

        {/* Botón WhatsApp */}
        <div className="fairy-text">
          <MagneticButton>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-10 py-5 text-sm font-medium text-dusty-50 transition-all duration-700 rounded-[2rem] overflow-hidden backdrop-blur-md"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.2)',
                boxShadow: '0 0 30px rgba(139,106,114,0.5)',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,255,255,0.1)';
                el.style.borderColor = 'rgba(232,180,184,0.6)';
                el.style.boxShadow = '0 0 50px rgba(252,231,243,0.3)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = 'rgba(255,255,255,0.05)';
                el.style.borderColor = 'rgba(255,255,255,0.2)';
                el.style.boxShadow = '0 0 30px rgba(139,106,114,0.5)';
              }}
            >
              {/* Shimmer en hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-dusty-100/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] skew-x-[-20deg]" />

              <span className="relative flex items-center gap-3 tracking-[0.15em]">
                {/* Icono WhatsApp */}
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current text-dusty-200 group-hover:text-dusty-50 transition-colors duration-500"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                {/* F3: CTA narrativo en Great Vibes */}
                <span className="font-script text-[1.25rem]">
                  Confirmo mi asistencia
                </span>
              </span>
            </a>
          </MagneticButton>
        </div>

      </div>
    </section>
  );
}
