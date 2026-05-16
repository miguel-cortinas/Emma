import React, { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/* ────────────────────────────────────────────────────────────────────
   MusicPlayer
   • Carga /moonlight.mp3
   • Se inicia en el primer click/tap real del usuario
   • Expone { onFirstInteraction } para que el splash lo conecte
   • Botón flotante para pausar / reanudar
   • El botón aparece cuando el splash llama a startMusic (no delay fijo)
──────────────────────────────────────────────────────────────────── */

interface MusicPlayerProps {
  /** Llamar a esta función desde el exterior para iniciar la música */
  triggerRef?: React.MutableRefObject<(() => void) | null>;
}

export default function MusicPlayer({ triggerRef }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const startedRef = useRef(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const fadeInRef = useRef<gsap.core.Tween | null>(null);
  const fadeOutRef = useRef<gsap.core.Tween | null>(null);
  const [playing, setPlaying] = useState(false);

  // ── Crear el <audio> una sola vez ─────────────────────────────
  useEffect(() => {
    const audio = new Audio('/moonlight.mp3');
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // ── Revelar el botón (llamado en cuanto arranca la música) ─────
  const revealButton = useCallback(() => {
    if (!btnRef.current) return;
    gsap.to(btnRef.current, {
      opacity: 1, scale: 1, duration: 0.8,
      ease: 'back.out(2)', delay: 0.3,
    });
  }, []);

  // ── startMusic: fade in con GSAP ──────────────────────────────
  const startMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || startedRef.current) return;
    startedRef.current = true;

    audio.play().then(() => {
      setPlaying(true);
      revealButton();
      // Cancelar cualquier fade previo y arrancar fade-in suave
      fadeOutRef.current?.kill();
      fadeInRef.current = gsap.to(audio, {
        volume: 0.25,
        duration: 2,
        ease: 'power1.inOut',
      });
    }).catch(() => {
      startedRef.current = false;
    });
  }, [revealButton]);

  // ── Exponer startMusic al padre (para el splash) ───────────────
  useEffect(() => {
    if (triggerRef) triggerRef.current = startMusic;
  }, [triggerRef, startMusic]);

  // ── Toggle manual (botón) ──────────────────────────────────────
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!startedRef.current) {
      startMusic();
      return;
    }

    if (playing) {
      // Fade out con GSAP y luego pausar
      fadeInRef.current?.kill();
      fadeOutRef.current = gsap.to(audio, {
        volume: 0,
        duration: 0.8,
        ease: 'power1.inOut',
        onComplete: () => { audio.pause(); setPlaying(false); },
      });
    } else {
      audio.play().then(() => {
        setPlaying(true);
        fadeOutRef.current?.kill();
        fadeInRef.current = gsap.to(audio, {
          volume: 0.25,
          duration: 1.2,
          ease: 'power1.inOut',
        });
      });
    }
  }, [playing, startMusic]);

  // ── Botón: inicialmente oculto, se revela al iniciarse la música ─
  useGSAP(() => {
    if (!btnRef.current) return;
    gsap.set(btnRef.current, { opacity: 0, scale: 0.7 });
  }, []);

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      type="button"
      aria-label={playing ? 'Pausar música' : 'Reproducir música'}
      className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center select-none"
      style={{
        zIndex: 50,
        background: 'rgba(255,255,255,0.06)',
        border: `1px solid ${playing ? 'rgba(251,207,232,0.4)' : 'rgba(255,255,255,0.15)'}`,
        boxShadow: playing
          ? '0 0 20px rgba(251,207,232,0.3), 0 4px 15px rgba(25,5,15,0.4)'
          : '0 4px 15px rgba(25,5,15,0.35)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        cursor: 'pointer',
        touchAction: 'manipulation',
        willChange: 'transform, opacity',
        transition: 'border-color 0.4s, box-shadow 0.4s',
      }}
    >
      {playing ? (
        <span className="flex items-end gap-[2px] h-5">
          {[12, 17, 8, 20].map((h, i) => (
            <span key={i} className="music-bar rounded-sm"
              style={{
                width: '2px', height: `${h}px`,
                background: 'rgba(251,207,232,0.9)',
                display: 'inline-block', transformOrigin: 'bottom'
              }} />
          ))}
        </span>
      ) : (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="rgba(251,207,232,0.65)">
          <path d="M9 18V5l12-2v13M9 18c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-2c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
        </svg>
      )}
    </button>
  );
}
