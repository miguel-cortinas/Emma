import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_ITEMS = [
  { src: '/carrusel/1.png', caption: "Soñada cada noche, esperada cada amanecer" },
  { src: '/carrusel/2.png', caption: "Qué privilegio es ser los elegidos para recibirte" },
  { src: '/carrusel/3.png', caption: "Tu nombre ya vive en cada rincón de nuestro corazón" },
  { src: '/carrusel/4.png', caption: "Bienvenida a nuestro mundo" },
  { src: '/carrusel/5.png', caption: "Te soñamos antes de conocerte" },
  { src: '/carrusel/6.png', caption: "Aún no llegas y ya cambiaste todo" },
];

export default function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % GALLERY_ITEMS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length);
  };

  const onStart = (e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      setTouchStart(e.targetTouches[0].clientX);
    } else {
      setTouchStart((e as React.MouseEvent).clientX);
    }
  };

  const onEnd = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    
    let touchEnd;
    if ('changedTouches' in e) {
      touchEnd = e.changedTouches[0].clientX;
    } else {
      touchEnd = (e as React.MouseEvent).clientX;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // swipe hacia la izquierda
    const isRightSwipe = distance < -50; // swipe hacia la derecha

    if (isRightSwipe) {
      // Desplazar a la derecha -> La foto pasa atrás
      handleNext();
    } else if (isLeftSwipe) {
      // Desplazar a la izquierda -> La foto de atrás pasa adelante
      handlePrev();
    }
    
    setTouchStart(null);
  };

  return (
    <div className="w-full relative py-12 overflow-hidden min-h-[700px] flex flex-col items-center">
      <div className="text-center mb-8 px-6 relative z-50">
        <h2 className="font-display text-4xl sm:text-5xl text-dusty-50 drop-shadow-md mb-2">
          La Pequeña Emma
        </h2>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-dusty-400/60 to-transparent mx-auto" />
      </div>

      <div className="relative w-full flex flex-col items-center justify-center mt-6 select-none">
        
        {/* Flechas indicadoras sutiles */}
        <div className="absolute left-4 sm:left-[15%] top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-pulse opacity-60">
          <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10 text-dusty-50 drop-shadow-md" />
        </div>
        <div className="absolute right-4 sm:right-[15%] top-1/2 -translate-y-1/2 z-50 pointer-events-none animate-pulse opacity-60">
          <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10 text-dusty-50 drop-shadow-md" />
        </div>

        {/* Mazo de Fotos (Deck) */}
        <div 
          className="relative w-[75vw] sm:w-[45vw] md:w-[340px] aspect-[4/5] sm:aspect-auto sm:h-[450px]"
          onTouchStart={onStart}
          onTouchEnd={onEnd}
          onMouseDown={onStart}
          onMouseUp={onEnd}
          onMouseLeave={onEnd}
        >
          {GALLERY_ITEMS.map((item, idx) => {
            // Rotación estática para que parezcan tiradas en la mesa
            const rotations = ['-rotate-3', 'rotate-2', '-rotate-2', 'rotate-3', '-rotate-1', 'rotate-1'];
            const rotation = rotations[idx % rotations.length];

            // Cálculo de posición en la pila
            const offset = (idx - currentIndex + GALLERY_ITEMS.length) % GALLERY_ITEMS.length;
            
            const isTop = offset === 0;
            const isSecond = offset === 1;
            const isThird = offset === 2;

            let offsetClasses = "";
            let zIndexClass = "";
            
            if (isTop) {
              zIndexClass = "z-40";
              offsetClasses = "scale-100 translate-y-0 opacity-100 shadow-[0_15px_30px_rgba(0,0,0,0.4),0_0_30px_rgba(232,180,184,0.2)] hover:scale-[1.02] cursor-grab active:cursor-grabbing";
            } else if (isSecond) {
              zIndexClass = "z-30";
              offsetClasses = "scale-95 translate-y-6 sm:translate-y-8 opacity-100 shadow-md brightness-[0.85] pointer-events-none";
            } else if (isThird) {
              zIndexClass = "z-20";
              offsetClasses = "scale-90 translate-y-12 sm:translate-y-16 opacity-80 shadow-sm brightness-[0.7] pointer-events-none";
            } else {
              zIndexClass = "z-10";
              offsetClasses = "scale-75 translate-y-20 opacity-0 pointer-events-none";
            }

            // Texturas
            const noiseBg = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")";
            const tapeTexture = "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.05 0.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23t)' opacity='0.3'/%3E%3C/svg%3E\")";

            return (
              <div 
                key={idx} 
                className={`absolute top-0 left-0 w-full transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] transform-gpu origin-center group ${rotation} ${zIndexClass} ${offsetClasses}`}
              >
                {/* Tarjeta Polaroid Minimalista */}
                <div className="relative bg-dusty-400 p-3 pb-4 sm:p-4 sm:pb-5 rounded-sm border-t border-l border-white/20 border-b border-r border-black/10 pointer-events-none">
                  
                  {/* Capa de textura sutil */}
                  <div className="absolute inset-0 pointer-events-none mix-blend-overlay rounded-sm" style={{ backgroundImage: noiseBg }} />

                  {/* Cinta Masking Tape Realista */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 z-40 transform -rotate-2 origin-center shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
                    <div className="w-full h-full bg-[#f4ebd0]/60 backdrop-blur-[2px] border border-white/30 flex items-center justify-center relative overflow-hidden mix-blend-hard-light" style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 95%, 3% 100%)' }}>
                      <div className="absolute inset-0 mix-blend-overlay opacity-50" style={{ backgroundImage: tapeTexture }} />
                    </div>
                  </div>

                  {/* Contenedor de la Imagen */}
                  <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm bg-zinc-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5),inset_0_0_4px_rgba(0,0,0,0.5)]">
                    <img 
                      src={item.src} 
                      alt={`Galería de Emma - Foto ${idx + 1}`}
                      loading={idx < 2 ? "eager" : "lazy"}
                      className="w-full h-full object-cover"
                    />

                    {/* Sombra interna para dar profundidad */}
                    <div className="absolute inset-0 shadow-[inset_0_3px_10px_rgba(0,0,0,0.6),inset_0_-2px_10px_rgba(0,0,0,0.3)] pointer-events-none z-10" />
                    
                    {/* Reflejo Glaseado / Glossy Glare */}
                    <div className="absolute inset-0 pointer-events-none z-20 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1500 ease-in-out skew-x-[-20deg]" />
                    
                    <div className="absolute inset-0 border border-white/10 pointer-events-none z-20 mix-blend-overlay" />
                  </div>
                  
                  {/* Texto escrito a mano con marcador (Caption) */}
                  <div className="mt-4 sm:mt-5 mb-1 px-3 flex items-center justify-center min-h-[3rem] relative">
                    <p className="font-marker font-semibold text-2xl sm:text-[1.75rem] text-[#1a1a1a] text-center leading-tight tracking-wide -rotate-1 opacity-90 mix-blend-multiply drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">
                      {item.caption}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
