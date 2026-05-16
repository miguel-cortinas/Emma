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
    const container = ref.current;
    if (!container) return;

    // Promover a GPU layer
    gsap.set(container, { willChange: 'opacity, transform, filter' });

    // Animación de aparición/desaparición al entrar/salir del viewport
    gsap.fromTo(container,
      { opacity: 0, scaleX: 0, filter: 'blur(10px)' },
      {
        opacity: 1,
        scaleX: 1,
        filter: 'blur(0px)',
        duration: 1.5,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 95%',
          end: 'bottom 5%',
          toggleActions: 'play reverse play reverse',
        },
      }
    );

    // Rotación de la estrella al hacer scroll
    gsap.to('.divider-star', {
      rotation: 180,
      ease: 'none',
      scrollTrigger: {
        trigger: container,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      }
    });

    // Pulso constante del resplandor central
    gsap.to('.divider-glow-pulse', {
      scale: 1.4,
      opacity: 0.2,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

  }, { scope: ref });

  return (
    <div ref={ref} className="w-full flex items-center justify-center py-[clamp(2rem,6vh,4rem)] px-[clamp(2rem,10vw,8rem)] origin-center" aria-hidden="true">
      {/* Línea izquierda */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/30 to-pink-300/80 rounded-full" />

      {/* Centro: Estrella con resplandor */}
      <div className="relative flex items-center justify-center px-5">
        <div className="divider-glow-pulse absolute w-10 h-10 bg-pink-200/40 rounded-full blur-xl" />
        <svg className="divider-star w-[18px] h-[18px] text-pink-200 drop-shadow-[0_0_8px_rgba(251,207,232,0.8)]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" fill="currentColor" />
        </svg>
      </div>

      {/* Línea derecha */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-pink-300/30 to-pink-300/80 rounded-full" />
    </div>
  );
}

/* ── Indicador de scroll premium ─────────────────────────────────── */
function ScrollIndicator() {
  return (
    <div className="scroll-indicator flex flex-col items-center gap-3 select-none mt-[clamp(2rem,6vh,4rem)]" aria-hidden="true">
      {/* Texto y flecha con parpadeo suave */}
      <div className="flex flex-col items-center animate-pulse">
        <span className="text-[10px] tracking-[0.6em] text-pink-100 uppercase font-semibold bg-pink-900/30 px-5 py-2 rounded-full backdrop-blur-md border border-pink-200/30 shadow-[0_0_15px_rgba(251,207,232,0.15)]">
          Desliza
        </span>
        <svg className="w-5 h-5 text-pink-200/90 mt-2 animate-bounce drop-shadow-[0_0_5px_rgba(251,207,232,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Contenedor de la línea visual */}
      <div className="relative flex flex-col items-center">
        {/* Círculo pulsante externo */}
        <div
          className="absolute w-5 h-5 rounded-full border border-pink-200/50 animate-pulse-ring"
          style={{ top: '-2px' }}
        />
        {/* Línea que se extiende */}
        <div className="w-px h-14 overflow-hidden">
          <div
            className="w-full h-full bg-gradient-to-b from-pink-200/90 to-transparent animate-scroll-line"
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
          <span className="font-script text-[clamp(3.5rem,15vw,6rem)] text-pink-200/90 drop-shadow-[0_0_15px_rgba(251,207,232,0.5)] leading-none -rotate-2 z-10">
            Baby Shower
          </span>
          <span className="tracking-[0.4em] text-[clamp(0.55rem,2.5vw,0.7rem)] text-pink-100/90 uppercase relative z-20 bg-pink-900/20 backdrop-blur-md px-5 py-2 rounded-full border border-pink-200/20 shadow-[0_0_15px_rgba(251,207,232,0.05)] mt-[clamp(1rem,2vh,1.5rem)]">
            de nuestra princesa
          </span>
        </div>

        <div className="overflow-visible z-0 py-[clamp(1.5rem,4vh,3rem)]">
          <h1 className="hero-name font-display text-[clamp(4.5rem,20vw,11rem)] leading-none font-normal drop-shadow-2xl bg-gradient-to-br from-pink-100 via-pink-100 to-pink-300 bg-clip-text text-transparent animate-gradient">
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
      <section className="flex items-center justify-center px-6 py-[clamp(4rem,15vh,8rem)]">
        <div className="max-w-4xl text-center p-4">
          <TextReveal
            text="Una nueva vida llega a nuestro hogar y con ella, el amor se multiplica. Queremos que seas parte de este momento tan especial."
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
