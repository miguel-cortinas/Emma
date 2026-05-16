import React, { useRef, useState } from 'react';
import { Navigation } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollFloat from './ScrollFloat';
import MagneticButton from './MagneticButton';

// ScrollTrigger ya está registrado en main.tsx

export default function LocationMap() {

  const containerRef = useRef<HTMLDivElement>(null);
  const [mapEnabled, setMapEnabled] = useState(false);


  const mapsLink = "https://www.google.com/maps/search/?api=1&query=Quinta+el+Pich%C3%B3n,+Chihuahua";

  useGSAP(() => {
    // Promover el polaroid a capa GPU (tiene animación flotante continua)
    gsap.set('.map-artifact', { willChange: 'transform' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        once: true,
      },
    });

    tl.fromTo('.map-artifact',
      { opacity: 0, y: 80, rotationZ: -8, scale: 0.92 },
      { opacity: 1, y: 0, rotationZ: -3, scale: 1, duration: 1.0, ease: 'back.out(1.2)' }
    );

    tl.fromTo('.map-button',
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
      '-=1.2'
    );
  }, { scope: containerRef });

  return (
    <section
      ref={containerRef}
      className="min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 py-20 mt-20 overflow-hidden relative"
      style={{ perspective: '1000px' }}
    >
      <ScrollFloat
        containerClassName="mb-24 sm:mb-32 font-display text-5xl sm:text-6xl md:text-[6.5rem] text-dusty-50 drop-shadow-lg leading-none text-center"
        textClassName=""
      >
        Ubicación
      </ScrollFloat>

      <div className="relative w-full max-w-4xl flex flex-col items-center pb-20 mt-8">

        {/* ── Tarjeta Polaroid ─────────────────────────────────────── */}
        <div
          className="map-artifact relative w-full max-w-md sm:max-w-lg lg:max-w-xl mx-auto p-3 sm:p-5 pb-16 sm:pb-20 rounded-sm origin-center"
          style={{
            background: '#f4f0eb',
            boxShadow: [
              '0 4px 6px rgba(139,106,114,0.12)',
              '0 20px 40px rgba(139,106,114,0.45)',
              '0 60px 120px rgba(139,106,114,0.65)',
              'inset 0 1px 0 rgba(255,255,255,0.8)',
            ].join(', '),
          }}
        >
          {/* Textura de papel */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none rounded-sm"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            }}
          />

          {/* Detalle decorativo: cinta adhesiva en la esquina superior */}
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-60 rounded-sm rotate-1"
            style={{
              background: 'rgba(232,180,184,0.7)',
              boxShadow: '0 1px 3px rgba(139,106,114,0.2)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Contenedor del mapa */}
          <div className="relative w-full aspect-[4/3] bg-zinc-300 overflow-hidden shadow-[inset_0_2px_10px_rgba(139,106,114,0.1)]">
            <iframe
              src="https://www.google.com/maps?q=Quinta+el+Pich%C3%B3n,Chihuahua&output=embed"
              className="absolute inset-0 w-[110%] h-[110%] -top-[5%] -left-[5%]"
              style={{
                border: 0,
                filter: 'grayscale(15%) sepia(30%) contrast(90%) opacity(95%)',
                // En móvil: deshabilitado hasta primer tap
                pointerEvents: mapEnabled ? 'auto' : 'none',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación del Baby Shower"
            />

            {/* Overlay móvil: hint visual para habilitar el mapa */}
            {!mapEnabled && (
              <div
                className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer gap-2"
                style={{ background: 'rgba(139,106,114,0.18)' }}
                onClick={() => setMapEnabled(true)}
                onTouchEnd={(e) => { e.preventDefault(); setMapEnabled(true); }}
                aria-label="Activar mapa interactivo"
              >
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="rgba(255,255,255,0.8)">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <span className="text-[10px] tracking-[0.3em] text-dusty-50/60 uppercase">Toca para activar</span>
              </div>
            )}
          </div>

          {/* Etiqueta manuscrita */}
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <h3 className="text-zinc-800 drop-shadow-sm opacity-85 font-display text-[clamp(1.6rem,6vw,2.2rem)]">
              Quinta el Pichón
            </h3>
          </div>
        </div>

        {/* ── Botón Google Maps ─────────────────────────────────────── */}
        <div className="map-button mt-20 w-full flex justify-center z-10 relative">
          <MagneticButton>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-sm font-medium text-dusty-50 transition-all duration-500 rounded-full overflow-hidden backdrop-blur-md"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border:     '1px solid rgba(255,255,255,0.1)',
                boxShadow:  '0 10px 30px rgba(139,106,114,0.5)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
              }}
            >
              <span className="relative flex items-center gap-2">
                <Navigation className="w-4 h-4 text-zinc-300 group-hover:text-dusty-50 transition-colors" />
                <span className="tracking-wide">Abrir en Google Maps</span>
              </span>
            </a>
          </MagneticButton>
        </div>

      </div>
    </section>
  );
}
