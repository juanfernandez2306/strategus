import { navService } from '../../../services/sensors/brujula/navigation';
import { type CompassHandle } from '../../../components/Compass';


/**
 * Orquesta la actualización de la brújula visual y la lógica de proximidad.
 */
export const setupNavOrchestrator = (
    destLat: number,
    destLon: number,
    compassRef: React.RefObject<CompassHandle | null>,
    hasVibratedRef: { current: boolean }
) => {

    const { lat, lng, headingRaw, setCanUpdate } = { 
    lat: 0, 
    lng: 0, 
    headingRaw: null as number | null, // Especificamos el tipo para evitar 'never'
    setCanUpdate: (value: boolean): void => {
        // Aquí es donde realizarías la acción, por ejemplo, actualizar una Ref o un Estado
        console.log("Actualización permitida:", value);
    } 
};

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