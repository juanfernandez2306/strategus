import { CONFIG_GPS } from "./config";

export const gpsOptions: PositionOptions = {
    enableHighAccuracy: CONFIG_GPS.ALTA_PRECISION,
    timeout: CONFIG_GPS.TIMEOUT_MS,
    maximumAge: CONFIG_GPS.EDAD_MAXIMA_CACHE
};

export const handleGpsError = (error: GeolocationPositionError): string => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return "El usuario no dio permiso de geolocalización. Actívalo en ajustes.";
        case error.POSITION_UNAVAILABLE:
            return "El GPS no puede determinar tu posición (revisa si tienes cielo despejado).";
        case error.TIMEOUT:
            return "Se agotó el tiempo de espera. Intenta moverte un poco.";
        default:
            return `Error inesperado: ${error.message}`;
    }
};

/**
 * Retorna true si la precisión detectada cumple con el mínimo configurado.
 */
export const tienePrecisionSuficiente = (accuracy: number): boolean => {
    return accuracy <= CONFIG_GPS.TOLERANCIA_METROS;
};

export const obtenerPosicionActual = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {

        // Verificación de soporte
        if (!navigator.geolocation) {
            return reject(new Error("La geolocalización no está disponible en este navegador."));
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            (err) => {
                // Traducimos el error antes de enviarlo al reject
                const mensaje= handleGpsError(err);
                reject(new Error(mensaje));
            },
            gpsOptions
        );
    });
};

/**
 * Inicia el seguimiento del movimiento. 
 * Devuelve el ID del watcher para poder apagarlo después.
 */
export const iniciarSeguimiento = (
    onSuccess: (pos: GeolocationPosition) => void, 
    onError: (mensaje: string) => void
): number => {

    if (!navigator.geolocation) {
        onError("Geolocalización no soportada en este dispositivo.");
        return 0; // Detiene la ejecución y avisa que no hay ID válido
    }

    return navigator.geolocation.watchPosition(
        (pos) => {
            onSuccess(pos);
        }, 
        (err) => {
            const mensaje = handleGpsError(err);
            onError(mensaje);
        }, 
        gpsOptions);
};

export const detenerSeguimiento = (id: number): void => {
    if (id !== 0) {
        navigator.geolocation.clearWatch(id);
        console.log("Seguimiento GPS detenido");
    }
    
};