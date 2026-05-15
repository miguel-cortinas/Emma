import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ScrollTrigger ya está registrado en main.tsx — no duplicar aquí

interface TextRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function TextReveal({ text, className = '', style }: TextRevealProps) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const words = text.split(' ');

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    const wordEls: HTMLElement[] = Array.from(el.querySelectorAll<HTMLElement>('.reveal-word'));
    const total   = wordEls.length;

    // Estado inicial + promoción a capa GPU anticipada
    gsap.set(wordEls, {
      opacity: 0.25,
      filter:  'blur(3px)',
      willChange: 'opacity, filter',
    });

    const triggerEl = el.closest('section') || el;

    /*
     * CAMBIO: Se reintroduce el pin para que el texto sea legible (fijado),
     * permitiendo que el fondo animado siga su curso. El jitter se previene
     * mediante la sincronización dinámica del height en ScrollytellingCanvas.
     */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:    triggerEl,
        start:      'center center',
        end:        '+=120%', // Mantiene la sección fijada durante 120% del viewport
        scrub:      1,
        pin:        true,
      },
    });

    // Cada palabra se revela progresivamente
    wordEls.forEach((word, i) => {
      const progress = i / (total - 1);

      tl.to(word, {
        opacity: 1,
        filter:  'blur(0px)',
        color:   'rgba(255, 228, 230, 1)',
        textShadow: '0 0 20px rgba(254,205,211,0.6)',
        duration: 0.5,
        ease:    'power2.out',
      }, progress * 0.8); // 0.8 deja un 20% de scroll extra para leer cómodamente
    });

    // Animación temprana e independiente para que "Sigue bajando" aparezca ANTES de anclar
    gsap.fromTo('.reveal-scroll-hint-wrapper',
      { opacity: 0, y: -20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: triggerEl,
          start: 'top 75%', // Aparece en cuanto asoma la sección
          toggleActions: 'play reverse play reverse'
        }
      }
    );

    // Fade out de la pista cuando se termina de revelar el texto (usando scrub)
    tl.to('.reveal-scroll-hint', {
      opacity: 0,
      scale: 0.9,
      duration: 0.1,
      ease: 'power1.in'
    }, 0.8);

    // Fade out general al abandonar la sección
    tl.to(wordEls, {
      opacity: 0,
      y:       -10,
      stagger: 0.02,
      ease:    'power2.inOut',
      duration: 0.3,
    }, 0.9);

    return () => {
      // Limpiar willChange al desmontar
      gsap.set(wordEls, { willChange: 'auto' });
    };

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full flex flex-col items-center">
      <p className={className} style={style}>
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span className="reveal-word inline-block">{word}</span>
            {i < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>
      
      {/* Wrapper independiente para el fade-in temprano */}
      <div className="reveal-scroll-hint-wrapper absolute -bottom-28 pointer-events-none opacity-0">
        {/* Contenedor interno para el fade-out atado al scroll */}
        <div className="reveal-scroll-hint flex flex-col items-center gap-3">
          {/* Texto y flecha con parpadeo suave */}
          <div className="flex flex-col items-center animate-pulse">
            <span className="text-[10px] tracking-[0.4em] uppercase text-rose-200/90 font-semibold bg-rose-900/30 px-5 py-2 rounded-full backdrop-blur-md border border-rose-200/30 shadow-[0_0_15px_rgba(254,205,211,0.15)]">
              Sigue bajando
            </span>
            <svg className="w-5 h-5 text-rose-200/90 mt-2 animate-bounce drop-shadow-[0_0_5px_rgba(254,205,211,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <div className="w-px h-10 overflow-hidden mt-1">
            <div className="w-full h-full bg-gradient-to-b from-rose-200/80 to-transparent animate-scroll-line" />
          </div>
        </div>
      </div>
    </div>
  );
}
