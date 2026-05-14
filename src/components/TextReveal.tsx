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

    // Animación del indicador de scroll
    tl.fromTo('.reveal-scroll-hint',
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.05, ease: 'power1.out' },
      0
    );

    tl.to('.reveal-scroll-hint', {
      opacity: 0,
      y: 10,
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
      
      {/* Indicador intuitivo de scroll */}
      <div className="reveal-scroll-hint absolute -bottom-20 flex flex-col items-center gap-3 opacity-0 pointer-events-none">
        <span className="text-[10px] tracking-[0.4em] uppercase text-rose-200/60 font-medium bg-rose-900/10 px-3 py-1 rounded-full backdrop-blur-sm border border-rose-200/10">
          Sigue bajando
        </span>
        <div className="w-px h-10 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-b from-rose-200/80 to-transparent animate-scroll-line" />
        </div>
      </div>
    </div>
  );
}
