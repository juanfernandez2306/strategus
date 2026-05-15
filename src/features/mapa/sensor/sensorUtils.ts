import { validarPuntoEnArea } from "../../../services/sensors/gps/utils";
import { CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO } from "../../../data/finca/limites";

type GpsData = { lng: number, lat: number, accuracy: number };
type HeadingData = { heading: number };

// Mapa de eventos para vincular el nombre con su estructura de datos
interface SensorEventMap {
    'sensorUpdateGPS': GpsData;
    'sensorUpdateHeading': HeadingData;
}

export const dispatchSensorEvent = <K extends keyof SensorEventMap>(
    eventName: K,
    data: SensorEventMap[K]
) => {
    window.dispatchEvent(new CustomEvent(eventName, { 
        detail: data 
    }));
};


export const haSuperadoUmbral = (

    pos1: {lng: number, lat: number}, 
    pos2: {lng: number, lat: number}, 
    umbral: number) => {

    const diffLng = pos1.lng - pos2.lng;

    const diffLat = pos1.lat - pos2.lat;

    return (
        (diffLat * diffLat) + (diffLng * diffLng) > 
        (umbral * umbral)
    );

};

export const gpsErrorMessage = (
    gpsData: any, 
    indiceValidacionArea: number
): string | null => {
    if (gpsData.error){

        return gpsData.error;

    }

    if (typeof gpsData.accuracy === 'number' && gpsData.accuracy > 20) {

        return "Precisión insuficiente (>20m). Busque cielo despejado";

    }

    if (gpsData.lng === null || gpsData.lat === null) {

        return "Datos de ubicación inválidos";

    }

    if (indiceValidacionArea == 0 || indiceValidacionArea == 15){

        const estaDentro = validarPuntoEnArea(
            gpsData.lng, 
            gpsData.lat, 
            CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO);

        if (!estaDentro) return "Fuera del área de trabajo";

    }

    return null;
}

export const headingErrorMessage = (headingData: any): string | null => {
     
    if (typeof headingData.heading !== 'number'){

        return "Esperando respuesta de brujula";

    }

    return null
}

export const haSuperadoUmbralHeading = (
    oldHeading: number, 
    newHeading: number): boolean => {
    
        let diferencia = Math.abs(oldHeading - newHeading);

        if (diferencia > 180) {
            diferencia = 360 - diferencia;
        }

        return (diferencia > 3);

}