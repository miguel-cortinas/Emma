import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface TextRevealProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

function AngelSymbol() {
  return (
    <div className="relative flex flex-col items-center justify-center mb-8 animate-float-angel">
      {/* Resplandor de fondo (Halo Glow) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-dusty-400/20 rounded-full blur-2xl animate-pulse-glow"></div>
      
      {/* SVG del Ángel Minimalista */}
      <svg width="64" height="40" viewBox="0 0 64 40" className="text-dusty-200/90 drop-shadow-[0_0_10px_rgba(232,180,184,0.6)] relative z-10">
        <defs>
          <linearGradient id="light-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
          </linearGradient>
        </defs>
        
        {/* Halo */}
        <ellipse cx="32" cy="8" rx="8" ry="2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        
        {/* Rayo de luz divino bajando hacia el texto */}
        <line x1="32" y1="12" x2="32" y2="36" stroke="url(#light-beam)" strokeWidth="1"/>
        
        {/* Ala Izquierda */}
        <path 
          d="M28,16 C18,10 8,16 5,24 Q13,21 16,26 Q19,21 23,26 C24,21 26,18 28,16 Z" 
          fill="rgba(232,180,184,0.05)" 
          stroke="currentColor" 
          strokeWidth="1" 
        />
        
        {/* Ala Derecha */}
        <path 
          d="M36,16 C46,10 56,16 59,24 Q51,21 48,26 Q45,21 41,26 C40,21 38,18 36,16 Z" 
          fill="rgba(232,180,184,0.05)" 
          stroke="currentColor" 
          strokeWidth="1" 
        />
      </svg>
    </div>
  );
}

export default function TextReveal({ text, className = '', style }: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = containerRef.current;
    if (!el) return;

    // Entrada fluida única y ligera de todo el bloque (Ángel + Texto)
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
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes float-angel {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(0.9); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .animate-float-angel {
          animation: float-angel 4s ease-in-out infinite;
          will-change: transform, opacity;
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s ease-in-out infinite;
          will-change: transform, opacity;
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
          animation: shimmer-sweep 5s linear infinite;
          filter: drop-shadow(0 0 12px rgba(254, 205, 211, 0.3));
        }
      `}</style>
      
      <div ref={containerRef} className="flex flex-col items-center">
        {/* Símbolo Angelical que levita */}
        <AngelSymbol />

        {/* Texto con efecto brillante */}
        <p className={`${className} text-shimmer-effect leading-relaxed`} style={style}>
          {text}
        </p>
      </div>
    </div>
  );
}
