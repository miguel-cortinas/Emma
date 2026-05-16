import React, { useState, useEffect, useRef } from 'react';

const TARGET_DATE = new Date('2026-05-30T15:00:00-06:00').getTime();

function getTimeLeft() {
  const now  = new Date().getTime();
  const diff = TARGET_DATE - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft);
  const [colonVisible, setColonVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
      // Sincronizamos el parpadeo del separador con el tick del reloj
      setColonVisible(v => !v);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex justify-between items-center w-full max-w-sm mx-auto px-2">
      <FlipUnit value={timeLeft.days}    label="DÍAS" />
      <Colon visible={colonVisible} />
      <FlipUnit value={timeLeft.hours}   label="HORAS" />
      <Colon visible={colonVisible} />
      <FlipUnit value={timeLeft.minutes} label="MINS" />
      <Colon visible={colonVisible} />
      <FlipUnit value={timeLeft.seconds} label="SEGS" isSeconds />
    </div>
  );
}

/* ── Separador pulsante (Ahora controlado por el padre) ─────────── */
function Colon({ visible }: { visible: boolean }) {
  return (
    <div
      className="text-dusty-400/30 text-2xl font-light mb-5 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0.15 }}
    >
      :
    </div>
  );
}

/* ── Dígito con flip ─────────────────────────────────────────────── */
function FlipDigit({ digit }: { digit: string }) {
  const [displayed, setDisplayed]   = useState(digit);
  const [animClass, setAnimClass]   = useState('');
  const prevRef                     = useRef(digit);

  useEffect(() => {
    if (digit === prevRef.current) return;
    setAnimClass('digit-flip-out');
    const t1 = setTimeout(() => {
      setDisplayed(digit);
      setAnimClass('digit-flip-in');
      prevRef.current = digit;
    }, 250);
    const t2 = setTimeout(() => setAnimClass(''), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [digit]);

  return (
    <span
      className={`inline-block ${animClass}`}
      style={{ perspective: '200px', display: 'inline-block' }}
    >
      {displayed}
    </span>
  );
}

/* ── Unidad completa ─────────────────────────────────────────────── */
function FlipUnit({
  value,
  label,
  isSeconds = false,
}: {
  value: number;
  label: string;
  isSeconds?: boolean;
}) {
  const padded = value.toString().padStart(2, '0');
  const d0 = padded[0];
  const d1 = padded[1];

  return (
    <div className="flex flex-col items-center justify-center min-w-[3.5rem]">
      <div
        className="font-display text-3xl md:text-4xl font-normal text-dusty-400 tabular-nums"
        style={{
          textShadow: isSeconds
            ? '0 0 20px rgba(232,180,184,0.6), 0 0 40px rgba(232,180,184,0.2)'
            : '0 0 12px rgba(255,255,255,0.3)',
        }}
      >
        <FlipDigit digit={d0} />
        <FlipDigit digit={d1} />
      </div>
      <div className="text-[9px] tracking-[0.25em] text-zinc-400 mt-2 font-sans uppercase">
        {label}
      </div>
    </div>
  );
}
