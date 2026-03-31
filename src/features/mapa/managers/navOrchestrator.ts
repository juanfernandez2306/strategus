import { navService } from '../../../services/servicioNavegacionBrujula';
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
    
    // Esta es la función que reacciona al evento que dispara el UserLocationManager
    const handleSensorUpdate = (e: any) => {
        const { headingRaw, datosGps } = e.detail;
        if (!datosGps) return;

        const { lng, lat } = datosGps;

        // 1. Cálculo de navegación (Distancia y Ángulo)
        const result = navService.calcularNav(
            lat, 
            lng, 
            destLat, 
            destLon, 
            headingRaw
        );

        if (!result) return;

        // 2. Lógica de Interfaz (Modo Proximidad vs Navegación)
        if (result.distancia <= 12) {
            compassRef.current?.setProximityMode(true);
            
            // Lógica de Vibración (Solo una vez al entrar al rango)
            if (!hasVibratedRef.current && "vibrate" in navigator) {
                navigator.vibrate([200, 100, 200]);
                hasVibratedRef.current = true;
            }
        } else {
            compassRef.current?.setProximityMode(false);
            compassRef.current?.updateAngle(result.anguloAguja);
            
            // Si se aleja, permitimos que vuelva a vibrar al entrar
            if (result.distancia > 20) {
                hasVibratedRef.current = false;
            }
        }
    };

    // Escuchar el evento global que emite el UserLocationManager
    window.addEventListener('heading-update', handleSensorUpdate);

    // Retornar limpieza
    return () => {
        window.removeEventListener('heading-update', handleSensorUpdate);
    };
};