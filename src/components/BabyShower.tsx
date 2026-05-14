import React, { useRef } from 'react';
import EventDetails from './EventDetails';
import LocationMap from './LocationMap';
import GiftRegistry from './GiftRegistry';
import ConfirmationSection from './ConfirmationSection';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollFloat from './ScrollFloat';
import TextReveal from './TextReveal';

/* ── Divisor de luz entre secciones ─────────────────────────────── */
function SectionDivider() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const glow = ref.current?.querySelector('.section-divider-glow');
    if (!glow) return;

    gsap.to(glow, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 85%',
        once: true,
      },
    });
  }, { scope: ref });

  return (
    <div ref={ref} className="section-divider my-0 px-8">
      <div className="section-divider-line" />
      <div className="section-divider-glow" />
    </div>
  );
}

/* ── Indicador de scroll premium ─────────────────────────────────── */
function ScrollIndicator() {
  return (
    <div className="scroll-indicator flex flex-col items-center gap-3 select-none" style={{ marginTop: 'clamp(2rem, 6vh, 4rem)' }}>
      <span className="text-[10px] tracking-[0.6em] text-rose-100 uppercase font-medium bg-black/30 px-3 py-1 rounded-full backdrop-blur-md border border-rose-200/20">
        Desliza
      </span>

      {/* Contenedor del indicador visual */}
      <div className="relative flex flex-col items-center">
        {/* Círculo pulsante externo */}
        <div
          className="absolute w-5 h-5 rounded-full border border-rose-200/50 animate-pulse-ring"
          style={{ top: '-2px' }}
        />
        {/* Línea que se extiende */}
        <div className="w-px h-14 overflow-hidden">
          <div
            className="w-full h-full bg-gradient-to-b from-rose-200/90 to-transparent animate-scroll-line"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Componente principal ─────────────────────────────────────────── */
export default function BabyShower() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero title — solo opacity/transform (GPU-composited, sin blur)
    gsap.fromTo('.hero-name',
      { opacity: 0, y: 60, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: 1.8, ease: 'power3.out', delay: 0.3 }
    );

    gsap.fromTo('.hero-subtitle',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out', delay: 1.2 }
    );

    // ScrollIndicator desaparece al comenzar a deslizar
    gsap.to('.scroll-indicator', {
      opacity: 0,
      y: -10,
      duration: 0.5,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=80',
        scrub: true,
      },
    });

    // Secciones — solo opacity + translateY (transform: GPU, no layout)
    const sections = gsap.utils.toArray<HTMLElement>('.gsap-section');
    sections.forEach((section) => {
      // Promover a capa GPU antes de que GSAP las toque
      gsap.set(section, { willChange: 'opacity, transform' });

      gsap.fromTo(section,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            // once: true — NO reverse al hacer scroll up
            // Mejora drásticamente la fluidez porque GSAP no
            // re-anima al hacer scroll en ambas direcciones
            once: true,
          },
          onComplete: () => {
            // Liberar willChange cuando la animación termina
            gsap.set(section, { willChange: 'auto' });
          },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="w-full font-geist relative">

      {/* ── §1 HERO ─────────────────────────────────────────────── */}
      <section
        className="flex flex-col items-center justify-center text-center relative"
        style={{
          minHeight: '100dvh',
          padding: 'clamp(1.5rem, 5vw, 3rem) clamp(1rem, 5vw, 2rem)',
        }}
      >

        <div className="hero-subtitle flex flex-col items-center gap-2">
          <span
            className="text-rose-200/90 drop-shadow-[0_0_15px_rgba(254,205,211,0.5)] leading-none -rotate-2 z-10"
            style={{
              fontFamily: "'Great Vibes', cursive",
              fontSize: 'clamp(3.5rem, 15vw, 6rem)',
            }}
          >
            Baby Shower
          </span>
          <span
            className="tracking-[0.4em] text-rose-100/90 uppercase relative z-20 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-rose-200/20 shadow-xl"
            style={{ fontSize: 'clamp(0.55rem, 2.5vw, 0.7rem)', marginTop: 'clamp(0.5rem, 1.5vh, 0.75rem)' }}
          >
            de nuestra princesa
          </span>
        </div>

        <div className="overflow-visible z-0" style={{ padding: 'clamp(0.5rem, 2vh, 1rem) 0' }}>
          <h1
            className="hero-name leading-none font-normal drop-shadow-2xl bg-gradient-to-br from-rose-100 via-pink-100 to-rose-300 bg-clip-text text-transparent animate-gradient"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: 'clamp(4.5rem, 20vw, 11rem)',
            }}
          >
            Emma<br />Lucía
          </h1>
        </div>

        <div className="hero-subtitle opacity-80">
          <ScrollIndicator />
        </div>
      </section>

      {/* ── DIVISOR 1 ─────────────────────────────────────────────── */}
      <SectionDivider />

      {/* ── §2 INVITACIÓN (TextReveal) ─────────────────────────────── */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl text-center p-4">
          <TextReveal
            text="La familia crece y el amor se multiplica. Celebra junto a nosotros el comienzo de la aventura más hermosa de nuestras vidas."
            className="text-3xl sm:text-4xl md:text-[4.5rem] text-white leading-tight font-normal drop-shadow-2xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          />
        </div>
      </section>

      {/* ── DIVISOR 2 ─────────────────────────────────────────────── */}
      <SectionDivider />

      {/* ── §3 DETALLES DEL EVENTO ────────────────────────────────── */}
      <EventDetails />

      {/* ── DIVISOR 3 ─────────────────────────────────────────────── */}
      <SectionDivider />

      {/* ── §4 MESA DE REGALOS ────────────────────────────────────── */}
      <GiftRegistry />

      {/* ── DIVISOR 4 ─────────────────────────────────────────────── */}
      <SectionDivider />

      {/* ── §5 UBICACIÓN ──────────────────────────────────────────── */}
      <LocationMap />

      {/* ── DIVISOR 5 ─────────────────────────────────────────────── */}
      <SectionDivider />

      {/* ── §6 CONFIRMACIÓN ───────────────────────────────────────── */}
      <ConfirmationSection />

    </div>
  );
}
