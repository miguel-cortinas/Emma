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
    <div ref={ref} className="section-divider my-0 px-8" aria-hidden="true">
      <div className="section-divider-line" />
      <div className="section-divider-glow" />
    </div>
  );
}

/* ── Indicador de scroll premium ─────────────────────────────────── */
function ScrollIndicator() {
  return (
    <div className="scroll-indicator flex flex-col items-center gap-3 select-none mt-[clamp(2rem,6vh,4rem)]" aria-hidden="true">
      <span className="text-[10px] tracking-[0.6em] text-rose-100 uppercase font-medium bg-rose-900/20 px-4 py-1.5 rounded-full backdrop-blur-md border border-rose-200/20 shadow-[0_0_15px_rgba(254,205,211,0.05)]">
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
        className="flex flex-col items-center justify-center text-center relative min-h-[100svh] px-[clamp(1rem,5vw,2rem)] py-[clamp(1.5rem,5vw,3rem)]"
      >

        <div className="hero-subtitle flex flex-col items-center gap-4">
          <span className="font-script text-[clamp(3.5rem,15vw,6rem)] text-rose-200/90 drop-shadow-[0_0_15px_rgba(254,205,211,0.5)] leading-none -rotate-2 z-10">
            Baby Shower
          </span>
          <span className="tracking-[0.4em] text-[clamp(0.55rem,2.5vw,0.7rem)] text-rose-100/90 uppercase relative z-20 bg-rose-900/20 backdrop-blur-md px-5 py-2 rounded-full border border-rose-200/20 shadow-[0_0_15px_rgba(254,205,211,0.05)] mt-[clamp(1rem,2vh,1.5rem)]">
            de nuestra princesa
          </span>
        </div>

        <div className="overflow-visible z-0 py-[clamp(1.5rem,4vh,3rem)]">
          <h1 className="hero-name font-display text-[clamp(4.5rem,20vw,11rem)] leading-none font-normal drop-shadow-2xl bg-gradient-to-br from-rose-100 via-pink-100 to-rose-300 bg-clip-text text-transparent animate-gradient">
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
            className="font-display text-3xl sm:text-4xl md:text-[4.5rem] text-white leading-relaxed font-normal drop-shadow-2xl"
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
