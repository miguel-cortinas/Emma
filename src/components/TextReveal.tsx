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
      opacity: 0.1,
      filter:  'blur(3px)',
      willChange: 'opacity, filter',
    });

    const triggerEl = el.closest('section') || el;

    /*
     * CAMBIO CLAVE: se eliminó `pin: true` que era el responsable del
     * jitter/tirones. El pin obliga a GSAP a recalcular el layout del
     * documento en cada frame de scroll, bloqueando el hilo principal.
     *
     * En su lugar, la sección ya ocupa min-h-screen (suficiente espacio
     * para leer) y el scrub sigue siendo suave sin fijar el viewport.
     */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:    triggerEl,
        start:      'top 60%',
        end:        'bottom 20%',
        scrub:      1.5,  // scrub más suave → menos frames forzados
      },
    });

    // Cada palabra pasa por 3 estados: pendiente → activa → leída
    wordEls.forEach((word, i) => {
      const progress = i / (total - 1);

      tl.to(word, {
        opacity: 1,
        filter:  'blur(0px)',
        color:   'rgba(255, 228, 230, 1)',
        textShadow: '0 0 20px rgba(254,205,211,0.6)',
        duration: 0.4,
        ease:    'power2.out',
      }, progress * 1.4);

      tl.to(word, {
        opacity: 0.5,
        filter:  'blur(0px)',
        color:   'rgba(255,255,255,0.55)',
        textShadow: 'none',
        duration: 0.6,
        ease:    'power2.inOut',
      }, progress * 1.4 + 0.15);
    });

    // Fade out al abandonar la sección
    tl.to(wordEls, {
      opacity: 0,
      y:       -10,
      stagger: 0.02,
      ease:    'power2.inOut',
      duration: 0.3,
    });

    return () => {
      // Limpiar willChange al desmontar
      gsap.set(wordEls, { willChange: 'auto' });
    };

  }, { scope: containerRef });

  return (
    <p ref={containerRef} className={className} style={style}>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          <span className="reveal-word inline-block">{word}</span>
          {i < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </p>
  );
}
