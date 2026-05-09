import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ScrollytellingCanvasProps {
  onLoadProgress?: (loaded: number, total: number) => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const FRAME_COUNT = 476; // Interpolados a 60fps (minterpolate) — ~33px/frame vs 80px/frame originales
const ZOOM_FACTOR = 1.35;

const getFramePath = (index: number) => {
  const padded = (index + 1).toString().padStart(3, '0');
  return `/frames/frame-${padded}.webp`;
};


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
export default function ScrollytellingCanvas({ onLoadProgress }: ScrollytellingCanvasProps) {
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const imagesRef     = useRef<HTMLImageElement[]>(new Array(FRAME_COUNT));
  const drawParamsRef = useRef<DrawParams | null>(null);

  const [loadedFrames, setLoadedFrames] = useState(0);
  const isLoaded       = loadedFrames >= FRAME_COUNT;
  const loadPercentage = Math.floor((loadedFrames / FRAME_COUNT) * 100);

  const isMobile = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;



  // ─── Precarga de frames ────────────────────────────────────────────────
  useEffect(() => {
    let count = 0;

    const updateCount = (newCount: number) => {
      setLoadedFrames(newCount);
      onLoadProgress?.(newCount, FRAME_COUNT);
    };

    // Cargar el primer frame primero para mostrar el canvas de inmediato
    const img0 = new Image();
    img0.src = getFramePath(0);
    img0.onload = () => {
      imagesRef.current[0] = img0;
      count++;
      updateCount(count);

      // Resto de frames en paralelo
      for (let i = 1; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          imagesRef.current[i] = img;
          count++;
          if (count % 5 === 0 || count === FRAME_COUNT) updateCount(count);
        };
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Engine de scroll con lerp ─────────────────────────────────────────
  // El canvas arranca con el primer frame listo (loadedFrames > 0)
  const canvasReady = loadedFrames > 0;
  useEffect(() => {
    if (!canvasReady) return;

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
  }, [canvasReady, isMobile]);

  // ─── Mouse Parallax (solo desktop) ─────────────────────────────────────
  useGSAP(() => {
    if (!canvasReady || !canvasRef.current || isMobile) return;

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
  }, [canvasReady, isMobile]);

  // ─── JSX ───────────────────────────────────────────────────────────────
  return (
    <div className="canvas-layer fixed inset-0 w-full h-full bg-black z-0 overflow-hidden pointer-events-none">

      {/* ── Canvas principal ──────────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-80"
        style={{
          display: canvasReady ? 'block' : 'none',
          // touch-action: pan-y → elimina el delay de 300ms del scroll táctil
          // e impide que el browser intente manejar gestos horizontales en el canvas
          touchAction: 'pan-y',
        }}
      />
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
    </div>
  );
}
