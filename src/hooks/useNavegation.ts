import { useEffect, useRef } from 'react';
import { navService } from '../services/servicioNavegacionBrujula'; 
import type { CompassHandle } from '../components/Compass';
import { obtenerUltimaPosicion, obtenerUltimoHeadingRaw } from '../services/servicioMapLibreGL';

export const useNavigation = (
  destLat: number | null,
  destLon: number | null,
  compassRef: React.RefObject<CompassHandle>,
  btnRef: React.RefObject<HTMLButtonElement | null>
) => {
  const hasVibratedRef = useRef<boolean>(false);

  useEffect(() => {
    // --- IMPORTANTE: Reseteo al inicio del efecto ---
    // Cada vez que destLat o destLon cambien (nuevo punto seleccionado),
    // permitimos que el teléfono pueda volver a vibrar.
    hasVibratedRef.current = false; 

    // Si no hay destino, no activamos el GPS ni los sensores
    if (destLat === null || destLon === null) return;

    

    // 2. Función lógica de actualización
    const updateCompass = () => {

      const datosGps = obtenerUltimaPosicion()

      if (!datosGps) return

      const { lat, lng } = datosGps;

      const headingRaw = obtenerUltimoHeadingRaw();

      if (lat !== null && lng !== null && destLat !== null && destLon !== null) {
        const result = navService.calcularNav(
          lat, //latitud proveniente del mapa
          lng, // longitud proveniente del mapa
          destLat,
          destLon,
          headingRaw
        );

        // Actualizamos la distancia visualmente (vía Ref para evitar re-render)
        compassRef.current?.updateDistance(result.distancia);

        if (btnRef.current) {
          if (result.distancia <= 12) {
            // Habilitar
            btnRef.current.disabled = false;
            btnRef.current.classList.remove('Mui-disabled'); // Forzamos a MUI a quitar el estilo gris
            btnRef.current.style.opacity = "1";
            btnRef.current.style.pointerEvents = "auto";
          } else {
            // Deshabilitar
            btnRef.current.disabled = true;
            btnRef.current.classList.add('Mui-disabled'); // Forzamos el estilo de deshabilitado
            btnRef.current.style.opacity = "0.6";
            btnRef.current.style.pointerEvents = "none";
          }
        }

        // 2. Lógica del Umbral de 12 metros
        if (result.distancia <= 12) {
          // Modo Proximidad: Ocultar aguja, mostrar círculo parpadeante
          compassRef.current?.setProximityMode(true);

        } else {
          // Modo Navegación: Mostrar aguja y actualizar ángulo
          compassRef.current?.setProximityMode(false);
          // Actualizamos la brújula visualmente (vía Ref para evitar re-render)
          compassRef.current?.updateAngle(result.anguloAguja);

        }

        // --- LÓGICA DE VIBRACIÓN CON TUS NUEVOS MÁRGENES ---
        // Si entra en el radio de 12m y no ha vibrado para ESTE punto
        if (result.distancia <= 12 && !hasVibratedRef.current) {
          if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
            hasVibratedRef.current = true; // Bloqueamos futuras vibraciones
          }
        } 
        
        // Si se aleja más de 20m, desbloqueamos la vibración por si vuelve a acercarse
        if (result.distancia > 20) {
          hasVibratedRef.current = false;
        }
      }
    };


    const intervalId = setInterval(updateCompass, 50)

    // Limpieza al desmontar o cambiar de destino
    return () => {
      clearInterval(intervalId);
    };
  }, [destLat, destLon, compassRef]); // Se dispara cuando cambian las coordenadas o la ref
};