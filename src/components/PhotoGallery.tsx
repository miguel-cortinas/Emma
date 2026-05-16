import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const GALLERY_ITEMS = [
  { src: '/carrusel/1.png', caption: "Soñada cada noche, esperada cada amanecer" },
  { src: '/carrusel/2.png', caption: "Qué privilegio es ser los elegidos para recibirte" },
  { src: '/carrusel/3.png', caption: "Tu nombre ya vive en cada rincón de nuestro corazón" },
  { src: '/carrusel/4.png', caption: "Bienvenida a nuestro mundo" },
  { src: '/carrusel/5.png', caption: "Te soñamos antes de conocerte" },
  { src: '/carrusel/6.png', caption: "Aún no llegas y ya cambiaste todo" },
];

// Rotaciones ligeramente distintas para simular fotos "tiradas en la mesa"
const ROTATIONS = ['-2deg', '1.5deg', '-1.5deg', '2.5deg', '-0.8deg', '1.2deg'];

// Offscreen tape color sutil
const TAPE_COLORS = [
  'rgba(245, 237, 232, 0.92)',
  'rgba(237, 213, 200, 0.92)',
  'rgba(232, 180, 184, 0.88)',
  'rgba(245, 237, 232, 0.92)',
  'rgba(212, 164, 172, 0.88)',
  'rgba(237, 213, 200, 0.92)',
];

export default function PhotoGallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging]     = useState(false);
  const touchStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragDeltaRef = useRef(0);

  const total = GALLERY_ITEMS.length;

  // ── Navegación ────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % total);
  }, [total]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(idx);
  }, []);

  // ── Teclado ───────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // ── Swipe / Drag ──────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    touchStartX.current = e.clientX;
    dragDeltaRef.current = 0;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (touchStartX.current === null) return;
    dragDeltaRef.current = e.clientX - touchStartX.current;
    if (Math.abs(dragDeltaRef.current) > 5) setIsDragging(true);
  };

  const onPointerUp = () => {
    if (touchStartX.current === null) return;
    const delta = dragDeltaRef.current;
    const THRESHOLD = 50;
    if (delta < -THRESHOLD) goNext();
    else if (delta > THRESHOLD) goPrev();
    touchStartX.current = null;
    dragDeltaRef.current = 0;
    setIsDragging(false);
  };

  return (
    <section
      className="w-full relative py-16 overflow-hidden select-none"
      aria-label="Galería de fotos de Emma"
    >
      {/* Título de sección */}
      <div className="text-center mb-10 px-6 relative z-10">
        <h2
          className="font-display text-[clamp(2.5rem,10vw,4.5rem)] leading-none font-normal"
          style={{ color: '#FADAD8', textShadow: '0 2px 20px rgba(180,100,110,0.35)' }}
        >
          La Pequeña Emma
        </h2>
        <div
          className="mx-auto mt-3"
          style={{
            width: '80px', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(232,180,184,0.7), transparent)',
          }}
        />
      </div>

      {/* Área interactiva del deck */}
      <div
        ref={containerRef}
        className="relative flex flex-col items-center justify-center"
        style={{ minHeight: 'clamp(420px, 72vw, 560px)' }}
      >
        {/* Flechas de navegación — solo visibles en desktop */}
        <button
          onClick={goPrev}
          aria-label="Foto anterior"
          className="absolute left-4 sm:left-[12%] top-1/2 -translate-y-1/2 z-50
                     hidden sm:flex items-center justify-center
                     w-11 h-11 rounded-full
                     transition-all duration-200
                     hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(232,180,184,0.15)',
            border: '1px solid rgba(232,180,184,0.4)',
            backdropFilter: 'blur(8px)',
            color: '#FADAD8',
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goNext}
          aria-label="Siguiente foto"
          className="absolute right-4 sm:right-[12%] top-1/2 -translate-y-1/2 z-50
                     hidden sm:flex items-center justify-center
                     w-11 h-11 rounded-full
                     transition-all duration-200
                     hover:scale-110 active:scale-95"
          style={{
            background: 'rgba(232,180,184,0.15)',
            border: '1px solid rgba(232,180,184,0.4)',
            backdropFilter: 'blur(8px)',
            color: '#FADAD8',
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Indicadores de swipe en mobile */}
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 z-50 sm:hidden pointer-events-none animate-pulse opacity-50"
          aria-hidden="true"
        >
          <ChevronLeft style={{ width: 28, height: 28, color: '#FADAD8' }} />
        </div>
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 z-50 sm:hidden pointer-events-none animate-pulse opacity-50"
          aria-hidden="true"
        >
          <ChevronRight style={{ width: 28, height: 28, color: '#FADAD8' }} />
        </div>

        {/* Deck de Polaroids */}
        <div
          className="relative touch-pan-y"
          style={{
            width: 'clamp(220px, 72vw, 300px)',
            height: 'clamp(340px, 90vw, 430px)',
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          role="region"
          aria-roledescription="carrusel"
          aria-label={`Foto ${currentIndex + 1} de ${total}`}
        >
          {GALLERY_ITEMS.map((item, idx) => {
            const offset = (idx - currentIndex + total) % total;
            const isTop    = offset === 0;
            const isSecond = offset === 1;
            const isThird  = offset === 2;
            const isHidden = offset >= 3 && offset < total - 1;
            const isLast   = offset === total - 1;

            // Valores de transformación y opacidad por capa
            let scale   = 1;
            let translateY = 0;
            let translateX = 0;
            let opacity = 1;
            let zIndex  = 0;
            let rotation = ROTATIONS[idx % ROTATIONS.length];

            if (isTop) {
              scale = 1;      translateY = 0;   opacity = 1;   zIndex = 40;
            } else if (isSecond) {
              scale = 0.95;   translateY = 18;  opacity = 0.9; zIndex = 30;
            } else if (isThird) {
              scale = 0.90;   translateY = 34;  opacity = 0.65; zIndex = 20;
            } else if (isHidden) {
              scale = 0.80;   translateY = 50;  opacity = 0;   zIndex = 5;
            } else if (isLast) {
              // Sale hacia la derecha al avanzar
              scale = 0.88;   translateX = 90;  opacity = 0;   zIndex = 10;
              rotation = `${parseFloat(rotation) + 6}deg`;
            }

            return (
              <div
                key={idx}
                aria-hidden={!isTop}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  transform: `rotate(${rotation}) scale(${scale}) translate(${translateX}%, ${translateY}px)`,
                  opacity,
                  zIndex,
                  transition: 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.45s ease',
                  willChange: 'transform, opacity',
                  transformOrigin: 'center center',
                  pointerEvents: isTop ? 'auto' : 'none',
                }}
              >
                {/* Tarjeta Polaroid */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    background: '#FDFAF8',
                    borderRadius: '3px',
                    padding: '10px 10px 0px',
                    boxShadow: isTop
                      ? '0 20px 50px rgba(100,50,60,0.28), 0 8px 20px rgba(100,50,60,0.18)'
                      : '0 6px 20px rgba(100,50,60,0.15)',
                    transition: 'box-shadow 0.4s ease',
                    overflow: 'visible',
                  }}
                >
                  {/* Oscurecido sutil para las capas inferiores */}
                  {!isTop && (
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.08)',
                        borderRadius: '3px',
                        zIndex: 5, pointerEvents: 'none',
                        transition: 'opacity 0.4s',
                      }}
                    />
                  )}

                  {/* Cinta adhesiva (masking tape) */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '-14px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(-1.5deg)',
                      width: '100px',
                      height: '30px',
                      zIndex: 50,
                      pointerEvents: 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: TAPE_COLORS[idx % TAPE_COLORS.length],
                        borderRadius: '1px',
                        clipPath: 'polygon(1% 5%, 99% 0%, 100% 90%, 2% 100%)',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Textura de cinta */}
                      <div
                        style={{
                          width: '100%', height: '100%',
                          opacity: 0.18,
                          backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Imagen */}
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      aspectRatio: '4/4.5',
                      overflow: 'hidden',
                      borderRadius: '1px',
                      background: '#e4d0d0',
                    }}
                  >
                    <img
                      src={item.src}
                      alt={`Emma – foto ${idx + 1}: ${item.caption}`}
                      loading={idx < 2 ? 'eager' : 'lazy'}
                      decoding="async"
                      draggable={false}
                      style={{
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                      }}
                    />
                    {/* Reflejo interno sutil */}
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.35)',
                        pointerEvents: 'none',
                      }}
                    />
                    {/* Borde interior blanco */}
                    <div
                      style={{
                        position: 'absolute', inset: 0,
                        border: '1px solid rgba(255,255,255,0.25)',
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Caption manuscrita */}
                  <div
                    style={{
                      padding: '10px 8px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      minHeight: '64px',
                    }}
                  >
                    <p
                      className="font-marker"
                      style={{
                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                        color: '#3a2828',
                        textAlign: 'center',
                        lineHeight: 1.3,
                        letterSpacing: '0.01em',
                        transform: 'rotate(-0.5deg)',
                        opacity: 0.88,
                      }}
                    >
                      {item.caption}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicadores de puntos */}
        <div
          className="flex items-center gap-2 mt-8"
          role="tablist"
          aria-label="Navegación de galería"
        >
          {GALLERY_ITEMS.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Ir a foto ${idx + 1}`}
              onClick={() => goTo(idx)}
              style={{
                width: idx === currentIndex ? '24px' : '7px',
                height: '7px',
                borderRadius: '4px',
                background: idx === currentIndex
                  ? 'rgba(232,180,184,0.95)'
                  : 'rgba(232,180,184,0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.3s ease',
              }}
            />
          ))}
        </div>

        {/* Contador discreto */}
        <p
          className="mt-3 text-center"
          aria-live="polite"
          style={{
            fontSize: '11px',
            letterSpacing: '0.3em',
            color: 'rgba(232,180,184,0.55)',
            textTransform: 'uppercase',
          }}
        >
          {currentIndex + 1} / {total}
        </p>
      </div>
    </section>
  );
}
