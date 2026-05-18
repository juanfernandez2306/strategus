import { iniciarSeguimiento, detenerSeguimiento, handleGpsError } from '../../../services/sensors/gps/engine.ts';
import { watchOrientacionRaw } from '../../../services/sensors/brujula/engine.ts';

import type { 
    OnUpdateGpsCallback, 
    OnUpdateHeadingCallback, 
    DetenerSensoresFn 
} from './sensorTypes.ts';

export const iniciarSensores = (
    onUpdateGPS: OnUpdateGpsCallback,
    onUpdateHeading: OnUpdateHeadingCallback,
    activarOrientacion: boolean = true
): DetenerSensoresFn => {

    let watchGpsId: number | null = null;
    let desactivaOrientacion: (() => void) | null = null;
    
    
    watchGpsId = iniciarSeguimiento(
        (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;
            
            onUpdateGPS({
                lng: longitude,
                lat: latitude,
                accuracy: accuracy,
                error: null
            });


        },
        (err) => {
            
            console.error("Error en sensor GPS:", err)

            onUpdateGPS({
                lng: null,
                lat: null,
                accuracy: null,
                error: handleGpsError(err as any)
            });

            
    
        }
    );

    if (watchGpsId === 0) {

        onUpdateGPS({ 
            lng: null, 
            lat: null, 
            accuracy: null, 
            error: "Geolocalización no soportada en este dispositivo." 
        });

        
        return () => {};
    }

    if (activarOrientacion) {

        desactivaOrientacion = watchOrientacionRaw((data) => {

            if (!data || data.heading === null) {
                onUpdateHeading({ heading: null });
                return;
            }

            onUpdateHeading({
                heading: data.heading
            });

        });

    }

    return () => {
        if (watchGpsId !== null) detenerSeguimiento(watchGpsId);

        if (typeof desactivaOrientacion === 'function') {
            desactivaOrientacion();
        }

        console.log("Sensores y seguimiento de usuario finalizados.");
    };

}