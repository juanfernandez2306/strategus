import { useEffect, useRef } from 'react';
import type { CompassHandle } from '../../../components/Compass';
import { setupNavOrchestrator } from '../managers/navOrchestrator';

export const useNavigation = (
  destLat: number | null,
  destLon: number | null,
  compassRef: React.RefObject<CompassHandle | null>
) => {
  // Referencia para la vibración (se pasa al orquestador)
  const hasVibratedRef = useRef<boolean>(false);

  useEffect(() => {
    // Resetear vibración cada vez que se selecciona una palma nueva
    hasVibratedRef.current = false; 

    // Si no hay destino seleccionado, no hacemos nada
    if (destLat === null || destLon === null) return;

    // ENCENDER EL ORQUESTADOR
    // Él se encarga de escuchar los sensores, calcular distancias y mover la aguja
    const stopNav = setupNavOrchestrator(
        destLat, 
        destLon, 
        compassRef, 
        hasVibratedRef
    );

    // LIMPIEZA: Apagar el orquestador cuando el componente se desmonte 
    // o el destino cambie
    return () => stopNav();

  }, [destLat, destLon, compassRef]);
};