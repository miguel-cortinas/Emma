import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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

    // Estado inicial: desplazados hacia abajo (fuera de su contenedor overflow-hidden) y ligeramente rotados
    gsap.set(wordEls, {
      y: '120%',
      rotationZ: 8,
      opacity: 0,
      willChange: 'transform, opacity',
    });

    const triggerEl = el.closest('section') || el;

    // Animación premium: Sliding Window con un "ease" muy dramático (expo.out)
    gsap.to(wordEls, {
      y: '0%',
      rotationZ: 0,
      opacity: 1,
      color: 'rgba(255, 228, 230, 1)',
      textShadow: '0 0 25px rgba(254,205,211,0.6)',
      duration: 1.6,
      stagger: 0.04, // Un poco más de tiempo entre palabras para disfrutarlo más
      ease: 'expo.out', // Empieza veloz, aterriza de forma extremadamente suave
      scrollTrigger: {
        trigger: el, // IMPORTANTE: El trigger es el texto en sí, no la sección completa
        start: 'top 75%', // Inicia cuando el propio texto llega al 75% de la pantalla
        once: true,
      },
      onComplete: () => {
        gsap.set(wordEls, { willChange: 'auto' });
      }
    });

  }, { scope: containerRef });

  return (
    <div className="relative w-full flex flex-col items-center">
      <p ref={containerRef} className={`${className} leading-[1.3]`} style={style}>
        {words.map((word, i) => (
          <React.Fragment key={i}>
            {/* Contenedor que actúa como "ventana" que oculta lo que está fuera de ella */}
            <span className="inline-block overflow-hidden align-bottom py-2 -my-2 px-1 -mx-1">
              <span className="reveal-word inline-block origin-top-left">{word}</span>
            </span>
            {i < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
}
