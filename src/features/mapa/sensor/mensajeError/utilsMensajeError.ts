import { validarPuntoEnArea } from "../../../../services/sensors/gps/utils";
import { CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO } from "../../../../data/finca/limites";

import type { GpsSensorData, HeadingSensorData } from '../sensorTypes';

export const gpsErrorMessage = (
    gpsData: GpsSensorData, 
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

export const headingErrorMessage = (headingData: HeadingSensorData): string | null => {
     
    if (typeof headingData.heading !== 'number'){

        return "Esperando respuesta de brujula";

    }

    return null
}