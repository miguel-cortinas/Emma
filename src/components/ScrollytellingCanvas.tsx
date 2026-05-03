import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const FRAME_COUNT = 192;
const ZOOM_FACTOR = 1.35;

const getFramePath = (index: number) => {
  const paddedIndex = (index + 1).toString().padStart(3, '0');
  return `/frames/frame-${paddedIndex}.jpg`;
};

const NAME_CHARS = "Emma Lucía".split('');

// ─── Pre-calcula los parámetros de dibujo una sola vez por resize ─────────
// Esto evita leer img.width / img.height en cada evento de scroll
interface DrawParams {
  sx: number; sy: number; sw: number; sh: number; // source rect
  dx: number; dy: number; dw: number; dh: number; // dest rect
}

function computeDrawParams(
  canvasW: number, canvasH: number,
  imgW: number,    imgH: number,
): DrawParams {
  const canvasRatio = canvasW / canvasH;
  const imgRatio    = imgW   / imgH;

  let dw: number, dh: number;
  if (canvasRatio > imgRatio) {
    dw = canvasW * ZOOM_FACTOR;
    dh = (canvasW / imgRatio) * ZOOM_FACTOR;
  } else {
    dw = (canvasH * imgRatio) * ZOOM_FACTOR;
    dh = canvasH * ZOOM_FACTOR;
  }

  return {
    sx: 0, sy: 0, sw: imgW, sh: imgH,
    dx: (canvasW - dw) / 2,
    dy: (canvasH - dh) / 2,
    dw, dh,
  };
}

export default function ScrollytellingCanvas() {
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const loadingRef     = useRef<HTMLDivElement>(null);
  const imagesRef      = useRef<HTMLImageElement[]>(new Array(FRAME_COUNT));
  const drawParamsRef  = useRef<DrawParams | null>(null); // cache de params

  const [loadedFrames, setLoadedFrames] = useState(0);
  const isLoaded      = loadedFrames > 0;
  const loadPercentage = Math.floor((loadedFrames / FRAME_COUNT) * 100);

  const isMobile = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;

  // ─── Animación de la pantalla de carga ───────────────────────────
  useGSAP(() => {
    if (!loadingRef.current) return;
    const chars = loadingRef.current.querySelectorAll('.loading-char');
    gsap.fromTo(chars,
      { opacity: 0, y: 20, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.06, ease: 'power3.out', delay: 0.2 }
    );
  }, { scope: loadingRef, dependencies: [] });

  // ─── Fade-out de la pantalla de carga ────────────────────────────
  useGSAP(() => {
    if (!isLoaded || !loadingRef.current) return;
    gsap.to(loadingRef.current, {
      opacity: 0, duration: 1.2, ease: 'power2.inOut',
      onComplete: () => { if (loadingRef.current) loadingRef.current.style.display = 'none'; }
    });
  }, { dependencies: [isLoaded] });

  // ─── Precarga de frames ───────────────────────────────────────────
  useEffect(() => {
    let loadedCount = 0;

    const img0 = new Image();
    img0.src = getFramePath(0);
    img0.onload = () => {
      imagesRef.current[0] = img0;
      loadedCount++;
      setLoadedFrames(loadedCount);

      for (let i = 1; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        img.onload = () => {
          imagesRef.current[i] = img;
          loadedCount++;
          if (loadedCount % 10 === 0 || loadedCount === FRAME_COUNT) {
            setLoadedFrames(loadedCount);
          }
        };
      }
    };
  }, []);

  // ─── Engine principal de scroll + animación ───────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.style.willChange = 'transform';

    const ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
    });
    if (!ctx) return;

    // ── Estado del engine ─────────────────────────────────────────
    let rafId: number;
    let isRunning     = true;

    // Posición "real" del scroll (0..FRAME_COUNT-1, puede ser decimal)
    let targetIndex   = 0;
    // Posición suavizada actual (lerp hacia targetIndex)
    let currentIndex  = 0;
    // Último frame renderizado (para evitar dibujos redundantes)
    let lastRendered  = -1;

    // Caché del maxScroll — se recalcula solo en resize, no en cada scroll
    let maxScroll     = document.body.scrollHeight - window.innerHeight;

    // ── Resize: recalcular canvas + params de dibujo ──────────────
    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;

      // Pre-computar los params de dibujo usando el primer frame disponible
      const refImg = imagesRef.current.find(img => img && img.complete);
      if (refImg) {
        drawParamsRef.current = computeDrawParams(
          canvas.width, canvas.height, refImg.naturalWidth, refImg.naturalHeight
        );
      }

      maxScroll = document.body.scrollHeight - window.innerHeight;

      // Forzar re-render del frame actual
      lastRendered = -1;
    };

    resizeCanvas();

    // ── Scroll: solo actualiza targetIndex (sin tocar el DOM de layout) ──
    const handleScroll = () => {
      const fraction   = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
      targetIndex      = fraction * (FRAME_COUNT - 1);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Recalcular maxScroll en resize (operación de layout, no en scroll)
    const handleResize = () => {
      resizeCanvas();
      maxScroll = document.body.scrollHeight - window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // ── Loop de renderizado con lerp ──────────────────────────────
    /*
     * UX principle (skill §7 spring-physics + §3 main-thread-budget):
     * En lugar de saltar frame a frame con cada evento de scroll,
     * usamos un lerp (interpolación lineal) para acercar currentIndex
     * a targetIndex en cada frame de rAF. El resultado es una transición
     * suavísima incluso cuando el scroll va rápido.
     *
     * LERP_SPEED controla la "velocidad de seguimiento":
     *   - 1.0 = instantáneo (sin suavizado, comportamiento previo)
     *   - 0.1 = muy suave pero con lag notable
     *   - 0.18–0.22 = punto óptimo: suave pero sin lag perceptible
     */
    const LERP_SPEED = isMobile ? 0.14 : 0.18;

    const renderLoop = () => {
      if (!isRunning) return;
      rafId = requestAnimationFrame(renderLoop);

      // Interpolar hacia el target
      const diff = targetIndex - currentIndex;
      if (Math.abs(diff) < 0.05) {
        // Ya estamos en el target — no hay nada que hacer
        if (Math.floor(currentIndex) === lastRendered) return;
        currentIndex = targetIndex;
      } else {
        currentIndex += diff * LERP_SPEED;
      }

      const frameIndex = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(currentIndex)));

      // Evitar re-dibujado si el frame no cambió
      if (frameIndex === lastRendered) return;
      lastRendered = frameIndex;

      const img = imagesRef.current[frameIndex];
      if (!img || !img.complete) return;

      const p = drawParamsRef.current;
      if (p) {
        // Usar los params pre-computados → cero reads de layout en este path
        ctx.drawImage(img, p.sx, p.sy, p.sw, p.sh, p.dx, p.dy, p.dw, p.dh);
      } else {
        // Fallback (primera vez antes del primer resize completo)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
    };

    rafId = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, [isLoaded, isMobile]);

  // ─── Mouse Parallax (solo desktop) ───────────────────────────────
  useGSAP(() => {
    if (!isLoaded || !canvasRef.current || isMobile) return;

    gsap.set(canvasRef.current, { scale: 1.05 });
    const xTo = gsap.quickTo(canvasRef.current, "x", { duration: 0.9, ease: "power2.out" });
    const yTo = gsap.quickTo(canvasRef.current, "y", { duration: 0.9, ease: "power2.out" });

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      xTo(-(e.clientX / innerWidth  - 0.5) * 28);
      yTo(-(e.clientY / innerHeight - 0.5) * 28);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLoaded, isMobile]);

  return (
    <div className="fixed inset-0 w-full h-full bg-black z-0 overflow-hidden pointer-events-none">

      {/* ── Pantalla de Carga Temática ──────────────────────────── */}
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

      {/* ── Canvas principal ─────────────────────────────────────── */}
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-80"
        style={{ display: isLoaded ? 'block' : 'none' }}
      />
      <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
    </div>
  );
}
