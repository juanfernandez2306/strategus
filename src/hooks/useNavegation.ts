import { useEffect, useRef } from 'react';
import { navService } from '../services/navegacionDestinoBrujula'; 
// CORRECCIÓN 1: Import de tipo explícito
import type { CompassHandle } from '../components/Compass';

export const useNavigation = (
  destLat: number | null,
  destLon: number | null,
  compassRef: React.RefObject<CompassHandle>
) => {
  const userCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    if (destLat === null || destLon === null) return;

    // 1. ESCUCHAR EL GPS
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        userCoordsRef.current = { lat: latitude, lon: longitude };
        
        // El heading inicial se puede asumir como el último conocido 
        // o esperar al evento de orientación.
        updateCompass(0); 
      },
      (error) => console.error("Error GPS:", error),
      { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
        // CORRECCIÓN 2: Eliminamos distanceFilter (no existe en Web API)
      }
    );

    const updateCompass = (heading: number) => {
      if (userCoordsRef.current && destLat !== null && destLon !== null) {
        const result = navService.calcularNav(
          userCoordsRef.current.lat,
          userCoordsRef.current.lon,
          destLat,
          destLon,
          heading
        );

        compassRef.current?.updateAngle(result.anguloAguja);
        compassRef.current?.updateDistance(result.distancia);
      }
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      // Logic para obtener el heading (iOS/Android)
      const heading = (event as any).webkitCompassHeading 
        ? (event as any).webkitCompassHeading 
        : (360 - (event.alpha || 0));

      updateCompass(heading);
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('deviceorientation', handleOrientation, true);
      navService.resetFilters();
    };
  }, [destLat, destLon, compassRef]);
};