import { type RegistroPosicion } from "./servicioTipos";
import { CONFIG_GPS } from "./servicioTipos";
import dayjs from "dayjs";


export const obtenerRegistroPosicionGeografica = (galeria: number): Promise<Partial<RegistroPosicion>> => {
    return new Promise((resolve, reject) => {

        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const { latitude, longitude, accuracy } = posicion.coords;
                const ahora = dayjs();

                if (accuracy > CONFIG_GPS.TOLERANCIA_METROS) {
                    return reject(new Error(`Señal GPS débil: (${accuracy.toFixed(1)}m). Intente, nuevamente.`));
                }
                
                // Formateamos fecha y hora actual
                const fecha_registro = ahora.format("YYYY-MM-DD");
                const hora_registro = ahora.format("HH:mm:ss");

                resolve({
                    latitud: latitude,
                    longitud: longitude,
                    precision: accuracy,
                    fecha_registro,
                    hora_registro,
                    galeria,
                    sincronizacion: false,
                    revision_planta: false,
                    fecha_revision: null,
                    hora_revision: null
                });
            },
            (error: GeolocationPositionError) => {
                if (error.code === error.TIMEOUT) {
                    reject(new Error("Tiempo de espera agotado al obtener la posición"));
                } else if (error.code === error.PERMISSION_DENIED) {
                    reject(new Error("El usuario no dio permiso de geolocalización"));
                } else if (error.code === error.POSITION_UNAVAILABLE) {
                    reject(new Error("No se pudo determinar la posición"));
                } else {
                    reject(error);
                }
            },
            {
                enableHighAccuracy: CONFIG_GPS.ALTA_PRECISION, 
                timeout: CONFIG_GPS.TIMEOUT_MS, 
                maximumAge: CONFIG_GPS.EDAD_MAXIMA_CACHE
            }
        );
    });
};

export const iniciarSeguimientoGPS = (
    onLocationUpdate: (
        pos: Pick<RegistroPosicion, 'latitud' | 'longitud' | 'precision'>
    ) => void,
    onError: (err: Error) => void
): number => {
    if (!("geolocation" in navigator)) {
        onError(new Error("Geolocalización no soportada"));
        return 0;
    }

    return navigator.geolocation.watchPosition(
        (posicion) => {
            const { latitude, longitude, accuracy } = posicion.coords;
            
            // Filtro de precisión consistente
            if (accuracy <= CONFIG_GPS.TOLERANCIA_METROS) { 
                onLocationUpdate({
                    latitud: latitude,
                    longitud: longitude,
                    precision: accuracy
                });
            }
        },
        (error) => {
            onError(new Error(`Error GPS: ${error.message}`));
        },
        {
            enableHighAccuracy: CONFIG_GPS.ALTA_PRECISION, 
            timeout: CONFIG_GPS.TIMEOUT_MS, 
            maximumAge: CONFIG_GPS.EDAD_MAXIMA_CACHE
        }
    );
};

/**
 * Configura el sensor de orientación y retorna la función de limpieza.
 * No guarda estado interno, delegando el control al llamador.
 * @param onHeadingUpdate Callback con el valor RAW.
 */
export const watchOrientacionRaw = (
    onHeadingUpdate: (heading: number) => void
): (() => void) => {
    
    const handleOrientation = (e: DeviceOrientationEvent) => {
        // Valor raw: webkit para iOS, alpha para Android
        const rawHeading = (e as any).webkitCompassHeading ?? e.alpha;
        
        if (rawHeading !== null && rawHeading !== undefined) {
            onHeadingUpdate(rawHeading);
        }
    };

    const eventName = 'ondeviceorientationabsolute' in window 
        ? 'deviceorientationabsolute' 
        : 'deviceorientation';

    window.addEventListener(eventName, handleOrientation, true);

    // Retornamos directamente la función de desuscripción
    return () => {
        window.removeEventListener(eventName, handleOrientation, true);
    };
};
