import { type RegistroPosicion } from "./servicioTipos";
import { CONFIG_GPS } from "./servicioTipos";
import dayjs from "dayjs";
import { point, polygon, booleanPointInPolygon } from '@turf/turf';


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
            
            onLocationUpdate({
                latitud: latitude,
                longitud: longitude,
                precision: accuracy
            });
            
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

/**
 * Evalúa si un punto [lng, lat] está dentro de una geometría (Coordenadas o GeoJSON).
 * Soporta arrays de coordenadas, Features simples y FeatureCollections con múltiples islas.
 */
export const validarPuntoEnArea = (
    lng: number, 
    lat: number, 
    geometria: any
): boolean => {
    try {
        // 1. Validaciones de seguridad
        if (!geometria || lng === undefined || lat === undefined) return false;

        const p = point([lng, lat]);

        // CASO A: Es un array de coordenadas (CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO)
        if (Array.isArray(geometria)) {
            // Turf requiere que el array de coordenadas esté dentro de otro array: [[coord1, coord2...]]
            const poli = polygon([geometria]);
            return booleanPointInPolygon(p, poli);
        } 

        // CASO B: Es un GeoJSON completo (FeatureCollection) - SOPORTE PARA ISLAS
        if (geometria.type === 'FeatureCollection') {
            // IMPORTANTE: Iteramos todas las "islas" o lotes del GeoJSON
            // .some devuelve true en cuanto encuentra que está dentro de UNA de las geometrías
            return geometria.features.some((f: any) => {
                return booleanPointInPolygon(p, f);
            });
        } 

        // CASO C: Es una Feature individual o una Geometry (MultiPolygon/Polygon)
        if (geometria.type === 'Feature' || geometria.type === 'Polygon' || geometria.type === 'MultiPolygon') {
            return booleanPointInPolygon(p, geometria);
        }

        return false;
    } catch (error) {
        console.error("Error crítico en validarPuntoEnArea:", error);
        // En caso de error de formato, por seguridad devolvemos false (fuera del área)
        return false;
    }
};