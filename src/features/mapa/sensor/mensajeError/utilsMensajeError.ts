import { validarPuntoEnArea } from "../../../../services/sensors/gps/utils";
import { CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO } from "../../../../data/finca/limites";

import type { 
    GpsSensorData, 
    HeadingSensorData, 
    CoordenadasGeograficas 
} from '../sensorTypes';


export const gpsErrorMessagePrecisionCoordenadas = (
    gpsData: GpsSensorData
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

    return null;
}

export const headingErrorMessage = (headingData: HeadingSensorData): string | null => {
     
    if (typeof headingData.heading !== 'number'){

        return "Esperando respuesta de brujula";

    }

    return null
}

export const haSuperadoUmbralDistancia = (
    gpsData: GpsSensorData,
    ultimaPosicionGuardada: CoordenadasGeograficas
): boolean => {
    
    const GRADOS_TOLERANCIA = (30/111111.11);
    const UMBRAL_CUADRADO_DISTANCIA = GRADOS_TOLERANCIA * GRADOS_TOLERANCIA;

    const diffLng = gpsData.lng! - ultimaPosicionGuardada.lng;
    const diffLat = gpsData.lat! - ultimaPosicionGuardada.lat;
    const distanciaCuadrada = (diffLng * diffLng) + (diffLat * diffLat);

    return distanciaCuadrada > UMBRAL_CUADRADO_DISTANCIA;
};

export const validarGeocerca = (data: CoordenadasGeograficas): string | null => {
    const estaDentro = validarPuntoEnArea(
        data.lng, 
        data.lat, 
        CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO
    );

    if (!estaDentro) return "Fuera del área de trabajo";

    return null
};


export const concatenarMensajes = (valores: (string | null | undefined)[]): string | null => {
    // 1. Filtramos para dejar únicamente los strings válidos y con contenido
    const mensajesValidos = valores.filter((valor): valor is string => 
        typeof valor === 'string' && valor.trim() !== ''
    );

    // 2. Si no hay mensajes válidos, retornamos null
    if (mensajesValidos.length === 0) return null;

    // 3. Unimos los elementos con el separador deseado
    return mensajesValidos.join(' | ');
};