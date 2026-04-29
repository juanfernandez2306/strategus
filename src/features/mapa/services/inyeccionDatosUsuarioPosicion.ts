import { iniciarSeguimiento, detenerSeguimiento } from '../../../services/sensors/gps/engine.ts';
import { watchOrientacionRaw } from '../../../services/sensors/brujula/engine.ts';
import { validarPuntoEnArea } from '../../../services/sensors/gps/utils.ts';
import { CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO } from '../../../data/finca/limites.ts';

import { useSensorStore } from '../hooks/useSensorStore.ts';

export const startLocationSource = (
    activarOrientacion: boolean = true
) => {
    let watchGpsId: number | null = null;
    let desactivaOrientacion: (() => void) | null = null;
    
    let ultimaPos = { lng: 0, lat: 0, accuracy: 0 };
    let ultimoHeading: number | null = null;
    let errorGps: string | null = null;

    const { updateLocation, updateHeading, setGpsError } = useSensorStore.getState();

    const notificarSincronizacionDatosPosicionOrientacion = () => {

        updateLocation(ultimaPos.lng, ultimaPos.lat, ultimaPos.accuracy);

        updateHeading(ultimoHeading);

        setGpsError(errorGps);

    };

    watchGpsId = iniciarSeguimiento(
        (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;

            const errores: string[] = [];

            setGpsError(null);

            // Validar si el trabajador está dentro del lote/finca
            const estaDentro = validarPuntoEnArea(longitude, latitude, CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO);
            
            if (!estaDentro) {
                errores.push("Fuera del área de trabajo");
            }

            if (accuracy > 20) {
                errores.push("Señal GPS débil (>20m)");
            }

            if (errores.length > 0) {
                // Unimos los errores con tu separador anterior "|"
                const mensajeFinal = errores.join(" | ");

                errorGps = mensajeFinal;
                
                if (!estaDentro) return; 
            }

            

            ultimaPos = { lng: longitude, lat: latitude, accuracy: accuracy };

            notificarSincronizacionDatosPosicionOrientacion();

        },
        (err) => {
            
            console.error("Error en sensor GPS:", err)

            errorGps = "Error de sensor: GPS no disponible";

            setGpsError(errorGps);
    
        }
    );

    if (activarOrientacion) {

        desactivaOrientacion = watchOrientacionRaw((raw) => {

            ultimoHeading = raw;

            notificarSincronizacionDatosPosicionOrientacion();

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