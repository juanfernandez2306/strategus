import { ServicioNavegacion } from '../sensor/navegacion/ServicioNavegacion';
import { type CompassHandle } from '../components/Compass';
import type { CoordenadasGeograficas } from '../sensor/sensorTypes';


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

    const servicio = new ServicioNavegacion();

    const coordenadasUsuario: CoordenadasGeograficas = { lat, lng };

    const coordenadasDestino: CoordenadasGeograficas = { lat: destLat, lng: destLon };

    const result = servicio.calcularNavegacion(coordenadasUsuario, coordenadasDestino, headingRaw);
    
    if (!result) return;

    compassRef.current?.updateDistance(result.distanciaFiltrada);

    const isNear = result.distanciaFiltrada <= 12;

    if (isNear) {
        compassRef.current?.setProximityMode(true);
        if (!hasVibratedRef.current && "vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
            hasVibratedRef.current = true;
        }
    } else {
        compassRef.current?.setProximityMode(false);
        compassRef.current?.updateAngle(result.anguloFiltrado);
        if (result.distanciaFiltrada > 20) hasVibratedRef.current = false;
    }

    setCanUpdate(isNear);
    
};