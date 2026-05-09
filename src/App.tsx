/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef, useState } from 'react';
import ScrollytellingCanvas from './components/ScrollytellingCanvas';
import BabyShower from './components/BabyShower';
import Particles from './components/Particles';
import MusicPlayer from './components/MusicPlayer';
import IntroSplash from './components/IntroSplash';

export default function App() {
  // Ref que MusicPlayer expone para iniciar la música desde fuera
  const musicTriggerRef = useRef<(() => void) | null>(null);

  // Estado de carga de frames — levantado aquí para coordinarlo con IntroSplash
  const [framesLoaded, setFramesLoaded] = useState(0);
  const [totalFrames, setTotalFrames]   = useState(0);

  const handleEnter = () => {
    // Dispara la música en el mismo gesto de tap → navegador lo permite
    if (musicTriggerRef.current) musicTriggerRef.current();
  };

  return (
    <main className="min-h-screen bg-transparent overflow-x-hidden relative">

      {/* Canvas de video scroll-driven (fijo, fondo) */}
      <ScrollytellingCanvas
        onLoadProgress={(loaded, total) => {
          setFramesLoaded(loaded);
          setTotalFrames(total);
        }}
      />

      {/* Sistema de partículas coordinado con scroll */}
      <Particles />

      {/* Contenido principal */}
      <div className="relative z-10 pointer-events-auto">
        <BabyShower />
      </div>

      {/* Reproductor de música — se conecta al splash vía triggerRef */}
      <MusicPlayer triggerRef={musicTriggerRef} />

      {/* Splash de bienvenida — aparece encima de todo, tap inicia música */}
      <IntroSplash
        onEnter={handleEnter}
        framesLoaded={framesLoaded}
        totalFrames={totalFrames}
      />

    </main>
  );
}
