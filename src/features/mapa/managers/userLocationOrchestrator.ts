import { iniciarSeguimiento, detenerSeguimiento } from '../../../services/sensors/gps/engine.ts';
import { watchOrientacionRaw } from '../../../services/sensors/brujula/engine.ts';
import { validarPuntoEnArea } from '../../../services/sensors/gps/utils.ts';
import { navService } from '../../../services/sensors/brujula/navigation.ts';
import { CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO } from '../../../data/finca/limites.ts';


/**
 * Gestiona la lógica de los sensores y actualiza la capa visual del usuario.
 */
export const setupUserTracking = (map: any, userGeoJSON: any) => {
    let watchGpsId: number | null = null;
    let desactivaOrientacion: (() => void) | null = null;
    
    let ultimaPos = { lng: 0, lat: 0, accuracy: 0 };
    let ultimoHeading: number | null = null;
    let errorGps: string | null = null;

    let haRealizadoPrimerVuelo = false;

    
    const actualizarUserLocation = () => {
        const source = map.getSource('user-pos-source');

        if (!map || typeof map.getStyle !== 'function' || !map.getStyle()) {
            return; 
        }

        if (!source || (ultimaPos.lng === 0 && ultimaPos.lat === 0)) return;

        // 1. Si el heading es válido, lo filtramos para que la flecha no vibre.
        // 2. Si es null, enviamos directamente el 9999 para activar la opacidad 0.
        const headingParaMapa = (ultimoHeading !== null) 
            ? navService.procesarHeading(ultimoHeading) 
            : 9999;

        // Actualizamos el objeto GeoJSON que gestiona la capa del usuario
        userGeoJSON.features[0].geometry.coordinates = [ultimaPos.lng, ultimaPos.lat];
        userGeoJSON.features[0].properties.heading = headingParaMapa;
        userGeoJSON.features[0].properties.precision = ultimaPos.accuracy;

        // Inyectamos los datos actualizados en la fuente del mapa
        source.setData(userGeoJSON);
    };

    

    const notificarSincronizacionUI = () => {

        window.dispatchEvent(new CustomEvent('heading-update', {
            detail: {
                headingRaw: ultimoHeading,
                datosGps: { lat: ultimaPos.lat, lng: ultimaPos.lng },
                errorGps: errorGps || null 
            }
        }));
    };

    // 1. Seguimiento GPS
    watchGpsId = iniciarSeguimiento(
        (pos) => {
            const { latitude, longitude, accuracy } = pos.coords;

            const errores: string[] = [];

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

            // --- LÓGICA DE PRIMER VUELO ---
            if (!haRealizadoPrimerVuelo ) { 
                map.flyTo({
                    center: [longitude, latitude],
                    zoom: 18,
                    speed: 1.2,
                    essential: true
                });
                
                haRealizadoPrimerVuelo = true;
                console.log("Primer centrado de cámara completado.");
            }

            ultimaPos = { lng: longitude, lat: latitude, accuracy: accuracy };
            actualizarUserLocation();
            notificarSincronizacionUI();
        },
        (err) => {
            console.error("Error en sensor GPS:", err)

            errorGps = "Error de sensor: GPS no disponible";
    
        }
    );

    

    // 2. Seguimiento de Brújula
    desactivaOrientacion = watchOrientacionRaw((raw) => {
         
        ultimoHeading = raw;

        actualizarUserLocation();
        
        notificarSincronizacionUI();

    });

    // Función de limpieza para map.on('remove')
    return () => {
        if (watchGpsId !== null) detenerSeguimiento(watchGpsId);
        if (desactivaOrientacion) desactivaOrientacion();
        console.log("Sensores y seguimiento de usuario finalizados.");
    };
};