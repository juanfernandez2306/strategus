// Estructura de datos limpia que emite el hardware GPS
export interface GpsSensorData {
    lng: number | null;
    lat: number | null;
    accuracy: number | null;
    error: string | null;
}

// Estructura de datos limpia que emite la brújula
export interface HeadingSensorData {
    heading: number | null;
}

export interface CoordenadasGeograficas {
    lng: number;
    lat: number;
}

// Firma de la función de limpieza (cleanup) que devuelve el orquestador
export type DetenerSensoresFn = () => void;

// Definición de las firmas de los callbacks (callbacks de actualización)
export type OnUpdateGpsCallback = (gpsData: GpsSensorData) => void;
export type OnUpdateHeadingCallback = (headingData: HeadingSensorData) => void;