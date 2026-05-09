import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// ─── Constantes ───────────────────────────────────────────────────────────────
const FRAME_COUNT = 192;
const ZOOM_FACTOR = 1.35;

const getFramePath = (index: number) => {
  const padded = (index + 1).toString().padStart(3, '0');
  return `/frames/frame-${padded}.webp`;
};

const NAME_CHARS = "Emma Lucía".split('');

// ─── Helper: parámetros de dibujo (cover + zoom), calculados una vez por resize
interface DrawParams {
  dx: number; dy: number; dw: number; dh: number;
}

function computeDrawParams(cw: number, ch: number, iw: number, ih: number): DrawParams {
  const cr = cw / ch;
  const ir = iw / ih;
  let dw: number, dh: number;
  if (cr > ir) {
    dw = cw * ZOOM_FACTOR;
    dh = (cw / ir) * ZOOM_FACTOR;
  } else {
    dw = (ch * ir) * ZOOM_FACTOR;
    dh = ch * ZOOM_FACTOR;
  }
  return { dx: (cw - dw) / 2, dy: (ch - dh) / 2, dw, dh };
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function ScrollytellingCanvas() {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const loadingRef    = useRef<HTMLDivElement>(null);
  const imagesRef     = useRef<HTMLImageElement[]>(new Array(FRAME_COUNT));
  const drawParamsRef = useRef<DrawParams | null>(null);

  const [loadedFrames, setLoadedFrames] = useState(0);
  const isLoaded       = loadedFrames > 0;
  const loadPercentage = Math.floor((loadedFrames / FRAME_COUNT) * 100);

  const isMobile = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;

  // ─── Animación de la pantalla de carga ─────────────────────────────────
  useGSAP(() => {
    if (!loadingRef.current) return;
    const chars = loadingRef.current.querySelectorAll('.loading-char');
    gsap.fromTo(chars,
      { opacity: 0, y: 20, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.2 }
    );
  }, { scope: loadingRef, dependencies: [] });

  // ─── Fade-out de la pantalla de carga ──────────────────────────────────
  useGSAP(() => {
    if (!isLoaded || !loadingRef.current) return;
    gsap.to(loadingRef.current, {
      opacity: 0, duration: 1.2, ease: 'power2.inOut',
      onComplete: () => { if (loadingRef.current) loadingRef.current.style.display = 'none'; },
    });
  }, { dependencies: [isLoaded] });

  // ─── Precarga de frames ────────────────────────────────────────────────
  useEffect(() => {
    let count = 0;

    // Cargar el primer frame primero para mostrar el canvas de inmediato
    const img0 = new Image();
    img0.src = getFramePath(0);
    img0.onload = () => {
      imagesRef.current[0] = img0;
      count++;
      setLoadedFrames(count);

      // Resto de frames en paralelo
      for (let i = 1; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          imagesRef.current[i] = img;
          count++;
          if (count % 10 === 0 || count === FRAME_COUNT) setLoadedFrames(count);
        };
      }
    };
  }, []);

  // ─── Engine de scroll con lerp ─────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.willChange = 'transform';

    // alpha:false → canvas opaco (mejor rendimiento de composite en GPU)
    // desynchronized → el browser puede pintarlo fuera del main-thread
    const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
    if (!ctx) return;

    let rafId: number;
    let isRunning = true;

    // Posición objetivo (0..FRAME_COUNT-1) — actualizada en scroll
    let targetIndex  = 0;
    // Posición suavizada — se acerca al target con lerp
    let currentIndex = 0;
    // Último frame renderizado — evita re-dibujados innecesarios
    let lastFrame    = -1;
    // Cache del maxScroll — solo se recalcula en resize
    let maxScroll    = document.body.scrollHeight - window.innerHeight;

    // ── Resize: recalcular canvas + params de dibujo en un solo lugar ──────
    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      maxScroll     = document.body.scrollHeight - window.innerHeight;

      // Pre-computar rect de dibujo usando el primer frame disponible
      const ref = imagesRef.current.find(img => img?.complete);
      if (ref) {
        drawParamsRef.current = computeDrawParams(
          canvas.width, canvas.height, ref.naturalWidth, ref.naturalHeight
        );
      }
      // Forzar re-render
      lastFrame = -1;
    };

    resizeCanvas();

    // ── Scroll handler: SOLO escribe targetIndex, sin DOM reads ────────────
    const handleScroll = () => {
      if (maxScroll <= 0) return;
      const fraction = Math.max(0, Math.min(1, window.scrollY / maxScroll));
      targetIndex    = fraction * (FRAME_COUNT - 1);
    };

    window.addEventListener('scroll',  handleScroll,  { passive: true });
    window.addEventListener('resize',  resizeCanvas,  { passive: true });

    // ── rAF loop con lerp ──────────────────────────────────────────────────
    /*
     * LERP_SPEED define la "inercia" del fondo:
     *   • 0.20 = muy reactivo, casi sin suavizado
     *   • 0.12 = suave con un toque de inercia natural (óptimo móvil)
     *   • 0.16 = punto dulce desktop
     *
     * El lerp opera sobre el ÍNDICE de frame (flotante), por lo que la
     * suavidad es independiente del número de frames — aunque haya 192,
     * la transición visual entre ellos es continua.
     */
    // Móvil más rápido (0.18) → el canvas sigue la inercia del scroll sin quedarse atrás
    const LERP_SPEED = isMobile ? 0.18 : 0.16;

    const renderLoop = () => {
      if (!isRunning) return;
      rafId = requestAnimationFrame(renderLoop);

      // Lerp hacia el target
      const diff = targetIndex - currentIndex;

      // Umbral: si estamos a <0.05 del target consideramos que llegamos
      if (Math.abs(diff) < 0.05) {
        if (Math.floor(currentIndex) === lastFrame && diff < 0.001) return;
        currentIndex = targetIndex;
      } else {
        currentIndex += diff * LERP_SPEED;
      }

      const fi = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(currentIndex)));

      // Evitar re-dibujado si el frame no cambió
      if (fi === lastFrame) return;
      lastFrame = fi;

      // ── Predecodificar frames vecinos hacia el GPU ──────────────────────
      // img.decode() es idempotente y no bloquea el hilo principal.
      // Le indica al browser que tenga la textura lista antes de necesitarla,
      // eliminando el flash/blank cuando el scroll con inercia salta varios frames.
      const PRELOAD_AHEAD = 4; // frames hacia adelante
      const PRELOAD_BACK  = 2; // frames hacia atrás
      for (let d = -PRELOAD_BACK; d <= PRELOAD_AHEAD; d++) {
        if (d === 0) continue;
        const ni = Math.max(0, Math.min(FRAME_COUNT - 1, fi + d));
        const neighbor = imagesRef.current[ni];
        if (neighbor?.complete) neighbor.decode?.().catch(() => {});
      }

      const img = imagesRef.current[fi];
      if (!img?.complete) {
        // Frame aún no cargado → buscar el más cercano disponible
        for (let offset = 1; offset < 10; offset++) {
          const fallback = imagesRef.current[Math.max(0, fi - offset)];
          if (fallback?.complete) { ctx.drawImage(fallback, 0, 0, canvas.width, canvas.height); break; }
        }
        return;
      }

      // Dibujar con params pre-computados (cero reads de layout)
      const p = drawParamsRef.current;
      if (p) {
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, p.dx, p.dy, p.dw, p.dh);
      } else {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(rafId);
    };
  }, [isLoaded, isMobile]);

  // ─── Mouse Parallax (solo desktop) ─────────────────────────────────────
  useGSAP(() => {
    if (!isLoaded || !canvasRef.current || isMobile) return;

    gsap.set(canvasRef.current, { scale: 1.05 });
    const xTo = gsap.quickTo(canvasRef.current, 'x', { duration: 0.9, ease: 'power2.out' });
    const yTo = gsap.quickTo(canvasRef.current, 'y', { duration: 0.9, ease: 'power2.out' });

    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      xTo(-(e.clientX / innerWidth  - 0.5) * 28);
      yTo(-(e.clientY / innerHeight - 0.5) * 28);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, [isLoaded, isMobile]);

  // ─── JSX ───────────────────────────────────────────────────────────────
  return (
    <div className="canvas-layer fixed inset-0 w-full h-full bg-black z-0 overflow-hidden pointer-events-none">

      {/* ── Pantalla de Carga ────────────────────────────────────────── */}
      <div
        ref={loadingRef}
        className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10 pointer-events-auto"
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(254,205,211,0.4) 0%, transparent 70%)' }}
        />

        <div className="relative flex flex-col items-center gap-3">
          <span className="text-[10px] tracking-[0.5em] text-rose-200/50 uppercase">
            {'te esperamos en el'.split('').map((ch, i) => (
              <span key={i} className="loading-char inline-block" style={{ animationDelay: `${0.05 * i}s` }}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </span>

          <div className="text-5xl sm:text-7xl leading-none" style={{ fontFamily: "'Instrument Serif', serif" }}>
            {NAME_CHARS.map((ch, i) => (
              <span
                key={i}
                className="loading-char inline-block text-white/90"
                style={{ animationDelay: `${0.08 * i + 0.3}s`, textShadow: '0 0 30px rgba(254,205,211,0.5)' }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>

          <span className="text-2xl text-rose-200/70" style={{ fontFamily: "'Great Vibes', cursive" }}>
            {['B','a','b','y',' ','S','h','o','w','e','r'].map((ch, i) => (
              <span key={i} className="loading-char inline-block" style={{ animationDelay: `${0.06 * i + 1.1}s` }}>
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="mt-12 relative">
          <div className="w-48 h-px bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out loading-bar-glow"
              style={{
                width: `${loadPercentage}%`,
                background: 'linear-gradient(90deg, rgba(254,205,211,0.6), rgba(251,207,232,0.9))',
              }}
            />
          </div>
          <p className="mt-3 text-[9px] tracking-[0.4em] text-rose-200/30 uppercase text-center">
            {loadPercentage}%
          </p>
        </div>
      </div>

      {/* ── Canvas principal ──────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-80"
        style={{
          display: isLoaded ? 'block' : 'none',
          // touch-action: pan-y → elimina el delay de 300ms del scroll táctil
          // e impide que el browser intente manejar gestos horizontales en el canvas
          touchAction: 'pan-y',
        }}
      />
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
    </div>
  );
}
