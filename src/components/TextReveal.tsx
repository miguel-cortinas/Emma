import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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

    // Estado inicial: todas tenues + blur
    gsap.set(wordEls, {
      opacity: 0.1,
      filter:  'blur(3px)',
      scale:   1,
      color:   'rgba(255,255,255,0.4)',
    });

    const triggerEl = el.closest('section') || el;

    // Scrub suave: cada palabra se ilumina a su turno
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger:    triggerEl,
        start:      'top top',
        end:        '+=200%',
        scrub:      1.2,
        pin:        true,
        anticipatePin: 1,
      },
    });

    // Cada palabra pasa por 3 estados: pendiente → activa → leída
    // Usamos una serie de tweens encadenados con stagger manual
    wordEls.forEach((word, i) => {
      const progress = i / (total - 1);

      tl.to(word, {
        opacity: 1,
        filter:  'blur(0px)',
        scale:   1.03,
        color:   'rgba(255, 228, 230, 1)', // petal rose
        textShadow: '0 0 20px rgba(254,205,211,0.6)',
        duration: 0.4,
        ease:    'power2.out',
      }, progress * 1.4); // distribuido en 140% del timeline

      // Inmediatamente después: la palabra se "lee" y pasa a estado tenue
      tl.to(word, {
        opacity: 0.5,
        filter:  'blur(0px)',
        scale:   1,
        color:   'rgba(255,255,255,0.55)',
        textShadow: 'none',
        duration: 0.6,
        ease:    'power2.inOut',
      }, progress * 1.4 + 0.15);
    });

    // Pausa para leer todo el texto iluminado
    tl.to({}, { duration: 0.5 });

    // Fade out de todas las palabras al abandonar la sección
    tl.to(wordEls, {
      opacity: 0,
      filter:  'blur(6px)',
      y:       -10,
      stagger: 0.03,
      ease:    'power2.inOut',
      duration: 0.4,
    });

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
