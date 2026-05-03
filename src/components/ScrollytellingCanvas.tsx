import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const FRAME_COUNT = 192;
const ZOOM_FACTOR = 1.35;

const getFramePath = (index: number) => {
  const paddedIndex = (index + 1).toString().padStart(3, '0');
  return `/frames/frame-${paddedIndex}.jpg`;
};

// Letras del nombre para la pantalla de carga
const NAME_CHARS = "Emma Lucía".split('');

export default function ScrollytellingCanvas() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const loadingRef  = useRef<HTMLDivElement>(null);
  const imagesRef   = useRef<HTMLImageElement[]>(new Array(FRAME_COUNT));

  const [loadedFrames, setLoadedFrames] = useState(0);
  const isLoaded      = loadedFrames > 0;
  const loadPercentage = Math.floor((loadedFrames / FRAME_COUNT) * 100);

  // Detectar mobile una sola vez
  const isMobile = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;

  // ─── Animación de la pantalla de carga ───────────────────────────
  useGSAP(() => {
    if (!loadingRef.current) return;
    const chars = loadingRef.current.querySelectorAll('.loading-char');
    gsap.fromTo(chars,
      { opacity: 0, y: 20, filter: 'blur(8px)' },
      {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.7,
        stagger: 0.06,
        ease: 'power3.out',
        delay: 0.2,
      }
    );
  }, { scope: loadingRef, dependencies: [] });

  // ─── Fade-out de la pantalla de carga ────────────────────────────
  useGSAP(() => {
    if (!isLoaded || !loadingRef.current) return;
    gsap.to(loadingRef.current, {
      opacity: 0,
      duration: 1.2,
      ease: 'power2.inOut',
      onComplete: () => {
        if (loadingRef.current) loadingRef.current.style.display = 'none';
      }
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

  // ─── Canvas Drawing + Scroll ──────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // willChange: transform promueve el canvas a su propia capa GPU
    canvas.style.willChange = 'transform';

    const ctx = canvas.getContext('2d', {
      // alpha: false mejora el composite en el GPU (fondo negro sólido)
      alpha: false,
      // desactiva suavizado para mejorar rendimiento en móvil
      desynchronized: true,
    });
    if (!ctx) return;

    let animationFrameId: number;
    let currentFrameIndex = 0;
    // Throttle en móvil: solo re-dibuja si el índice de frame cambió
    let pendingFrame: number | null = null;

    const drawImage = (index: number) => {
      const img = imagesRef.current[index];
      if (!img || !img.complete) return;

      const canvasRatio = canvas.width / canvas.height;
      const imgRatio    = img.width / img.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth  = canvas.width * ZOOM_FACTOR;
        drawHeight = (canvas.width / imgRatio) * ZOOM_FACTOR;
      } else {
        drawWidth  = (canvas.height * imgRatio) * ZOOM_FACTOR;
        drawHeight = canvas.height * ZOOM_FACTOR;
      }

      offsetX = (canvas.width - drawWidth) / 2;
      offsetY = (canvas.height - drawHeight) / 2;

      // No necesitamos clearRect porque alpha: false → el canvas es opaco
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const resizeCanvas = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      drawImage(currentFrameIndex);
    };

    resizeCanvas();

    const handleScroll = () => {
      const scrollY    = window.scrollY;
      const maxScroll  = document.body.scrollHeight - window.innerHeight;
      const fraction   = Math.max(0, Math.min(1, scrollY / maxScroll));
      const frameIndex = Math.floor(fraction * (FRAME_COUNT - 1));

      if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;

        // Cancelar el frame pendiente y agendar uno nuevo
        if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
        pendingFrame = requestAnimationFrame(() => {
          drawImage(currentFrameIndex);
          pendingFrame = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', resizeCanvas, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (pendingFrame !== null) cancelAnimationFrame(pendingFrame);
    };
  }, [isLoaded]);

  // ─── Mouse Parallax (solo desktop) ───────────────────────────────
  useGSAP(() => {
    if (!isLoaded || !canvasRef.current) return;
    // En móvil no hay mousemove → omitir para no añadir listeners innecesarios
    if (isMobile) return;

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
        {/* Halo de fondo suave */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(254,205,211,0.4) 0%, transparent 70%)'
          }}
        />

        {/* Nombre animado letra por letra */}
        <div className="relative flex flex-col items-center gap-3">
          <span className="text-[10px] tracking-[0.5em] text-rose-200/50 uppercase">
            {'te esperamos en el'.split('').map((ch, i) => (
              <span
                key={i}
                className="loading-char inline-block"
                style={{ animationDelay: `${0.05 * i}s` }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </span>

          <div
            className="text-5xl sm:text-7xl leading-none"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {NAME_CHARS.map((ch, i) => (
              <span
                key={i}
                className="loading-char inline-block text-white/90"
                style={{
                  animationDelay: `${0.08 * i + 0.3}s`,
                  textShadow: '0 0 30px rgba(254,205,211,0.5)',
                }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </div>

          <span
            className="text-2xl text-rose-200/70"
            style={{ fontFamily: "'Great Vibes', cursive" }}
          >
            {['B','a','b','y',' ','S','h','o','w','e','r'].map((ch, i) => (
              <span
                key={i}
                className="loading-char inline-block"
                style={{ animationDelay: `${0.06 * i + 1.1}s` }}
              >
                {ch === ' ' ? '\u00A0' : ch}
              </span>
            ))}
          </span>
        </div>

        {/* Barra de progreso rose */}
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
