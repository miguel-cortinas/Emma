/**
 * MeshGradient — Fondo fluido animado
 * Orbes de color que flotan lentamente creando un efecto de acuarela viva.
 *
 * v2: orbes más grandes, menos blur, mayor opacidad y sin mix-blend-mode
 * para que el movimiento sea claramente perceptible.
 */
export default function MeshGradient() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        overflow: 'hidden',
        pointerEvents: 'none',
        // Base sólida rosada media — los orbes de colores van encima
        background: '#C4848A',
      }}
    >
      {/* Orb 1 — Crema/pétalo claro · esquina superior-izquierda */}
      <div
        className="orb-1"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-15%',
          width: '80%',
          height: '80%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #F5EDE8 0%, #EDD5C8 40%, transparent 70%)',
          filter: 'blur(45px)',
          opacity: 0.90,
        }}
      />

      {/* Orb 2 — Rosa petal · esquina superior-derecha */}
      <div
        className="orb-2"
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-20%',
          width: '75%',
          height: '75%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #E8B4B8 0%, #D4A4AC 45%, transparent 72%)',
          filter: 'blur(50px)',
          opacity: 0.88,
        }}
      />

      {/* Orb 3 — Rosa coral medio · centro */}
      <div
        className="orb-3"
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '70%',
          height: '65%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #D4A4AC 0%, #C4848A 40%, transparent 68%)',
          filter: 'blur(55px)',
          opacity: 0.80,
        }}
      />

      {/* Orb 4 — Rosa oscuro intenso · esquina inferior-izquierda */}
      <div
        className="orb-4"
        style={{
          position: 'absolute',
          bottom: '-15%',
          left: '-10%',
          width: '70%',
          height: '72%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #B5767C 0%, #8B6A72 45%, transparent 70%)',
          filter: 'blur(48px)',
          opacity: 0.85,
        }}
      />

      {/* Orb 5 — Rosa calidez · esquina inferior-derecha */}
      <div
        className="orb-5"
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-15%',
          width: '78%',
          height: '78%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, #C4848A 0%, #B5767C 38%, transparent 68%)',
          filter: 'blur(52px)',
          opacity: 0.82,
        }}
      />

      {/* Halo de luz central — crea sensación de profundidad y aire */}
      <div
        style={{
          position: 'absolute',
          top: '25%',
          left: '25%',
          width: '50%',
          height: '50%',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at center, rgba(252,234,235,0.60) 0%, transparent 65%)',
          filter: 'blur(40px)',
        }}
      />
    </div>
  );
}
