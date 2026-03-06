import { useEffect, useRef } from 'react';
import { navService } from '../services/navegacionDestinoBrujula'; 
import type { CompassHandle } from '../components/Compass';

export const useNavigation = (
  destLat: number | null,
  destLon: number | null,
  compassRef: React.RefObject<CompassHandle>
) => {
  const userCoordsRef = useRef<{ lat: number; lon: number } | null>(null);
  const hasVibratedRef = useRef<boolean>(false);

  useEffect(() => {
    // --- IMPORTANTE: Reseteo al inicio del efecto ---
    // Cada vez que destLat o destLon cambien (nuevo punto seleccionado),
    // permitimos que el teléfono pueda volver a vibrar.
    hasVibratedRef.current = false; 

    // Si no hay destino, no activamos el GPS ni los sensores
    if (destLat === null || destLon === null) return;

    // 1. Iniciar seguimiento GPS
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        userCoordsRef.current = { lat: latitude, lon: longitude };
        updateCompass(0); 
      },
      (error) => console.error("Error GPS:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    // 2. Función lógica de actualización
    const updateCompass = (heading: number) => {
      if (userCoordsRef.current && destLat !== null && destLon !== null) {
        const result = navService.calcularNav(
          userCoordsRef.current.lat,
          userCoordsRef.current.lon,
          destLat,
          destLon,
          heading
        );

        // Actualizamos la brújula visualmente (vía Ref para evitar re-render)
        compassRef.current?.updateAngle(result.anguloAguja);
        compassRef.current?.updateDistance(result.distancia);

        // --- LÓGICA DE BLOQUEO DEL BOTÓN ---
        // Si la distancia es mayor a 20, deshabilitamos (true)
        const fueraDeRango = result.distancia > 20;
        compassRef.current?.updateDisabled(fueraDeRango);

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

    // 3. Sensor de orientación (Brújula)
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const heading = (event as any).webkitCompassHeading 
        ? (event as any).webkitCompassHeading 
        : (360 - (event.alpha || 0));

      updateCompass(heading);
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    // Limpieza al desmontar o cambiar de destino
    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [destLat, destLon, compassRef]); // Se dispara cuando cambian las coordenadas o la ref
};