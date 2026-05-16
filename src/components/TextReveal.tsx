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

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    // Entrada fluida única y ligera de todo el bloque
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%', // Inicia al entrar en pantalla
          once: true,
        }
      }
    );
  }, { scope: containerRef });

  return (
    <div className="relative w-full flex flex-col items-center">
      <style>{`
        @keyframes shimmer-sweep {
          0% {
            background-position: 200% center;
          }
          100% {
            background-position: -200% center;
          }
        }
        
        .text-shimmer-effect {
          /* El gradiente tiene el color base CASI SÓLIDO (85% opacidad) para legibilidad perfecta */
          background-image: linear-gradient(
            -75deg,
            rgba(255, 228, 230, 0.85) 0%,
            rgba(255, 228, 230, 0.85) 40%,
            rgba(255, 255, 255, 1) 50%,
            rgba(255, 228, 230, 0.85) 60%,
            rgba(255, 228, 230, 0.85) 100%
          );
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          background-clip: text;
          /* Animación puramente CSS: 0 coste matemático para JS */
          animation: shimmer-sweep 5s linear infinite;
          
          /* Brillo estático más fuerte para despegar el texto del fondo oscuro */
          filter: drop-shadow(0 0 12px rgba(254, 205, 211, 0.3));
        }
      `}</style>
      
      {/* 
        ¡Un solo nodo de texto! 
        Cero mapeo de palabras, cero staggers, 60fps garantizados.
      */}
      <p ref={containerRef} className={`${className} text-shimmer-effect leading-relaxed`} style={style}>
        {text}
      </p>
    </div>
  );
}
