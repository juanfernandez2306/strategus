import { useRef, useImperativeHandle, forwardRef, type CSSProperties } from 'react';
import { Box, Typography } from '@mui/material';
import style from './Compass.module.css';

// Interfaz para que el Padre (o el Hook) controle el componente
export interface CompassHandle {
  updateAngle: (deg: number) => void;
  updateDistance: (dist: number) => void;
  setProximityMode: (active: boolean) => void;
}

interface CompassProps {
  size?: number;
}

const Compass = forwardRef<CompassHandle, CompassProps>(({ size = 260 }, ref) => {
  // Referencias específicas para evitar errores de "overload" en TS
  const needleRef = useRef<SVGGElement | null>(null);
  const distanceRef = useRef<HTMLSpanElement | null>(null);
  const beaconRef = useRef<SVGCircleElement | null>(null);
  const beaconRef2 = useRef<SVGCircleElement | null>(null);

  // Exponemos las funciones de manipulación directa del DOM
  useImperativeHandle(ref, () => ({
    // Actualización de la aguja vía CSS
    updateAngle: (deg: number) => {
      if (needleRef.current) {
        needleRef.current.style.transform = `rotate(${deg}deg)`;
      }
    },
    // Actualización del texto vía textContent (más rápido que innerHTML)
    updateDistance: (dist: number) => {
      if (distanceRef.current) {
        distanceRef.current.textContent = `${dist}`;
      }
    },
    setProximityMode: (active: boolean) => {
      if (needleRef.current && beaconRef.current && beaconRef2.current) {
        // Ocultar/Mostrar aguja
        needleRef.current.style.display = active ? 'none' : 'block';
        
        // Ocultar/Mostrar AMBOS círculos
        const displayValue = active ? 'block' : 'none';
        beaconRef.current.style.display = displayValue;
        beaconRef2.current.style.display = displayValue;
      }
    }
  }));

  const needleStyle: CSSProperties = {
    transformOrigin: '50px 100px', // Centro de rotación basado en el diseño
    transition: 'transform 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
    willChange: 'transform',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      
      {/* Contenedor de la Brújula */}
      <Box sx={{ 
        position: 'relative', 
        width: size, 
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-fondo)', // Variables de App.css
        borderRadius: '50%',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        border: '2px solid var(--color-terciario)',
      }}>
        <svg
          viewBox="0 0 100 200"
          style={{ width: '85%', height: '85%', overflow: 'visible' }}
        >
          {/* Marcador Norte fijo (Objetivo) */}
          <path d="M50 5 L50 25" stroke="var(--color-error)" strokeWidth="6" strokeLinecap="round" />
          
          {/* Círculo de escala con strokeDasharray */}
          <circle cx="50" cy="100" r="65" fill="none" stroke="var(--color-terciario)" strokeWidth="1.5" strokeDasharray="3 3" />

          {/* Aguja móvil */}
          <g ref={needleRef} style={needleStyle}>
            {/* Punta Norte (Color Error/Rojo) */}
            <path fill="var(--color-error)" stroke="var(--color-negro)" strokeWidth="3" d="M50 35 L42 100 H58 Z" />
            {/* Punta Sur (Blanco) */}
            <path fill="#FFF" stroke="var(--color-negro)" strokeWidth="3" d="M50 165 L42 100 H58 Z" />
            <circle cx="50" cy="100" r="5" fill="var(--color-negro)" />
          </g>

          <circle 
            ref={beaconRef}
            cx="50" 
            cy="100" 
            r="15" 
            fill="var(--color-primario)" 
            className={style.beaconAnimation} // <--- AQUÍ agregas la clase del módulo
            style={{ display: 'none' }}       // Dejamos el display controlado por JS
          />

          {/* 4. CÍRCULO 2 (Segunda onda con retraso) */}
          <circle 
            ref={beaconRef2}
            cx="50" cy="100" r="15" 
            fill="var(--color-primario)" 
            className={style.beaconAnimation2} // <--- NUEVA CLASE con delay
            style={{ display: 'none' }} 
          />

        </svg>
      </Box>

      {/* Bloque de Texto Independiente */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          sx={{ fontWeight: "bold", color: "var(--color-primario)", mb: 0, lineHeight: 1 }}
        >
          {/* El span permite la actualización directa sin romper tipos de MUI */}
          <span ref={distanceRef}>--</span>m
        </Typography>
        <Typography 
          variant="overline" 
          sx={{ display: 'block', mt: 0, color: "var(--color-negro)", opacity: 0.7 }}
        >
          Distancia al objetivo
        </Typography>
      </Box>

    </Box>
  );
});

export default Compass;