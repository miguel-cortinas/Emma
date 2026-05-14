import React, { useRef } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import Countdown from './Countdown';
import ScrollFloat from './ScrollFloat';

// ScrollTrigger ya está registrado en main.tsx

export default function EventDetails() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef      = useRef<HTMLDivElement>(null);

  // ── Tilt 3D en hover (desktop) ─────────────────────────────────
  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;

    const xTo = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power2.out' });
    const yTo = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power2.out' });
    const gTo = gsap.quickTo(card, 'boxShadow', { duration: 0.4 });

    const onMove = (e: MouseEvent) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const cx = e.clientX - left - width  / 2;
      const cy = e.clientY - top  - height / 2;
      xTo( (cx / (width  / 2)) *  5);   // max 5° horizontal
      yTo(-(cy / (height / 2)) *  4);   // max 4° vertical
    };

    const onEnter = () => {
      gsap.to(card, {
        boxShadow: '0 25px 70px rgba(0,0,0,0.6), 0 0 40px rgba(254,205,211,0.15)',
        borderColor: 'rgba(254,205,211,0.45)',
        duration: 0.4,
      });
    };

    const onLeave = () => {
      xTo(0);
      yTo(0);
      gsap.to(card, {
        boxShadow: '0 15px 50px rgba(0,0,0,0.5)',
        borderColor: 'rgba(254,205,211,0.2)',
        duration: 0.6,
      });
    };

    // Solo en devices con puntero fino (desktop)
    if (window.matchMedia('(pointer:fine)').matches) {
      card.addEventListener('mousemove',  onMove);
      card.addEventListener('mouseenter', onEnter);
      card.addEventListener('mouseleave', onLeave);
    }

    gsap.set(card, { transformPerspective: 800 });

    return () => {
      card.removeEventListener('mousemove',  onMove);
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, { scope: containerRef });

  // ── Animaciones de entrada ──────────────────────────────────────
  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
    });

    tl.fromTo(cardRef.current,
      { opacity: 0, y: 40, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'power2.out' }
    )
    .fromTo('.event-info-item',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo('.event-separator',
      { opacity: 0, scaleY: 0 },
      { opacity: 1, scaleY: 1, duration: 0.4, ease: 'power2.out' },
      '-=0.5'
    )
    .fromTo('.event-countdown-wrapper',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.2'
    );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-20 overflow-hidden"
    >
      <ScrollFloat
        containerClassName="mb-12 font-display text-5xl sm:text-6xl md:text-[6rem] text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] leading-none text-center"
        textClassName=""
        animationDuration={1}
        ease="back.inOut(2)"
        scrollStart="center bottom+=50%"
        scrollEnd="bottom bottom-=40%"
        stagger={0.03}
      >
        Detalles del Evento
      </ScrollFloat>

      {/* ── Tarjeta VIP con 3D Tilt ──────────────────────────────── */}
      <div
        ref={cardRef}
        className="relative w-full max-w-2xl rounded-[2rem] p-8 md:p-12 overflow-hidden"
        style={{
          background:  'rgba(120,20,40,0.1)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border:      '1px solid rgba(254,205,211,0.2)',
          boxShadow:   '0 15px 50px rgba(0,0,0,0.5)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Shimmer continuo */}
        <div className="absolute inset-0 pointer-events-none animate-shimmer opacity-20" />

        {/* Resplandor perimetral superior */}
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-rose-300/50 to-transparent" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-4 mb-10">

            {/* ── Fecha ──────────────────────────────────────────── */}
            <div className="event-info-item flex-1 flex flex-col items-center text-center group">
              <div className="p-3 bg-rose-900/20 rounded-full mb-4 border border-rose-200/20 shadow-[0_0_15px_rgba(254,205,211,0.05)] group-hover:border-rose-200/40 group-hover:shadow-[0_0_20px_rgba(254,205,211,0.15)] transition-all duration-500">
                <CalendarDays className="w-6 h-6 text-rose-100" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] tracking-[0.35em] text-rose-200/60 uppercase mb-2">Fecha</span>
              <p className="leading-none text-white drop-shadow-md font-display text-[clamp(2.5rem,8vw,4.5rem)]">
                30 <span style={{ fontSize: '0.55em' }}>Mayo</span>
              </p>
              <p className="text-xs md:text-sm text-zinc-300 font-light mt-1">Sábado · 2026</p>
            </div>

            {/* Separadores */}
            <div className="event-separator hidden md:block w-px h-32 bg-gradient-to-b from-transparent via-rose-200/30 to-transparent" aria-hidden="true" />
            <div className="event-separator md:hidden w-32 h-px bg-gradient-to-r from-transparent via-rose-200/30 to-transparent my-2" aria-hidden="true" />

            {/* ── Horario ─────────────────────────────────────────── */}
            <div className="event-info-item flex-1 flex flex-col items-center text-center group">
              <div className="p-3 bg-rose-900/20 rounded-full mb-4 border border-rose-200/20 shadow-[0_0_15px_rgba(254,205,211,0.05)] group-hover:border-rose-200/40 group-hover:shadow-[0_0_20px_rgba(254,205,211,0.15)] transition-all duration-500">
                <Clock className="w-6 h-6 text-rose-100" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] tracking-[0.35em] text-rose-200/60 uppercase mb-2">Horario</span>
              <div className="flex flex-col items-center">
                <p className="text-white drop-shadow-md font-display text-[clamp(2rem,6vw,3.5rem)]">
                  3:00 PM
                </p>
                <span className="text-white/20 my-1 text-sm">—</span>
                <p className="text-zinc-400 drop-shadow-md font-display text-[clamp(1.25rem,4vw,2rem)]">
                  9:00 PM
                </p>
              </div>
            </div>

          </div>

          {/* ── Countdown ─────────────────────────────────────────── */}
          <div className="event-countdown-wrapper mt-12 pt-10 border-t border-rose-200/10 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-rose-300/40 to-transparent shadow-[0_0_10px_rgba(254,205,211,0.3)]" />
            <p className="text-center text-[10px] tracking-[0.4em] text-rose-200/60 uppercase mb-6">Faltan</p>
            <div className="bg-black/20 rounded-2xl p-4 md:p-6 border border-rose-200/10">
              <Countdown />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
