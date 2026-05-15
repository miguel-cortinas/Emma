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

    // Estado inicial optimizado: sin blur, solo opacidad y translación
    // Promocionamos a capa GPU para máxima fluidez
    gsap.set(wordEls, {
      opacity: 0,
      y: 20,
      willChange: 'opacity, transform',
    });

    const triggerEl = el.closest('section') || el;

    // Animación de entrada fluida (stagger) de una sola vez
    gsap.to(wordEls, {
      opacity: 1,
      y: 0,
      color: 'rgba(255, 228, 230, 1)',
      textShadow: '0 0 20px rgba(254,205,211,0.6)',
      duration: 0.8,
      stagger: 0.03, // Pequeño retraso entre cada palabra
      ease: 'power2.out',
      scrollTrigger: {
        trigger: triggerEl,
        start: 'top 75%', // Inicia cuando la sección asoma al 75% del viewport
        once: true, // Crucial: solo ocurre una vez, no re-anima al retroceder
      },
      onComplete: () => {
        // Limpiamos willChange para no ocupar memoria GPU de forma permanente
        gsap.set(wordEls, { willChange: 'auto' });
      }
    });

  }, { scope: containerRef });

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* 
        Colocamos la ref en el párrafo directamente 
        Ya no requerimos wrapper con scroll-hint porque el flujo no se detiene
      */}
      <p ref={containerRef} className={className} style={style}>
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span className="reveal-word inline-block">{word}</span>
            {i < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
