import { navService } from '../../../services/sensors/brujula/navigation';
import { type CompassHandle } from '../../../components/Compass';
import { useSensorStore } from '../hooks/useSistemaStore';

/**
 * Orquesta la actualización de la brújula visual y la lógica de proximidad.
 */
export const setupNavOrchestrator = (
    destLat: number,
    destLon: number,
    compassRef: React.RefObject<CompassHandle | null>,
    hasVibratedRef: { current: boolean }
) => {

    const { lat, lng, headingRaw, setCanUpdate } = [0, 0, null, false];

    if (lat === 0 || headingRaw === null) {
        setCanUpdate(false);
        return;
    }

    const result = navService.calcularNav(lat, lng, destLat, destLon, headingRaw);
    
    if (!result) return;

    compassRef.current?.updateDistance(result.distancia);

    const isNear = result.distancia <= 12;

    if (isNear) {
        compassRef.current?.setProximityMode(true);
        if (!hasVibratedRef.current && "vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
            hasVibratedRef.current = true;
        }
    } else {
        compassRef.current?.setProximityMode(false);
        compassRef.current?.updateAngle(result.anguloAguja);
        if (result.distancia > 20) hasVibratedRef.current = false;
    }

    setCanUpdate(isNear);
    
};