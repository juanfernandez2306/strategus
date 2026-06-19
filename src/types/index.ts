/**
 * @file index.ts (Types)
 * @description Definiciones de tipos globales y contratos de datos para la aplicación SIGAL.
 * Estos tipos aseguran la consistencia de datos entre la base de datos local y la interfaz.
 */


/**
 * Representa un registro individual de tratamiento o revisión de una planta.
 * Es la estructura principal almacenada en IndexedDB.
 */
export type RegistroPosicion = {
    id?: number;              // ID autoincremental de IndexedDB
    uuid: string;             // Identificador único universal
    latitud: number;
    longitud: number;
    fecha_registro: string;   // Formato YYYY-MM-DD
    hora_registro: string;    // Formato HH:mm:ss
    /** * @field galeria
     * Conteo de perforaciones o túneles de insectos en el estípite de la palma.
     * Esta variable es el indicador principal de nivel de daño por plaga.
     */
    galeria: number;
    precision: number;        // Precisión del sensor movil GPS en metros
    revision_planta: boolean; // Indica si la planta ya fue tratada/curada
    sincronizacion: boolean;  // Indica si ya se envió al servidor remoto
    fecha_revision: string | null;
    hora_revision: string | null;
};

/**
 * Contrato para el flujo de datos visuales (Mapa/Sidebar).
 * Optimizado para renderizar los puntos sin sobrecargar la memoria.
 */
export type SidebarData = {
  uuid: string;
  lat: number;
  lng: number;
  revision_planta: boolean;
}


/**
 * Contrato de respuesta para operaciones que devuelven datos en formato GeoJSON.
 */
export type RespuestaGeoJsonSidebarData  = {
    data: GeoJSON.FeatureCollection<GeoJSON.Point>;
    message: string;
    success: boolean;
}

/**
 * Configuración de los umbrales de captura del sensor GPS.
 */
export interface GpsConfig {
    TOLERANCIA_METROS: number;
    TIMEOUT_MS: number;
    EDAD_MAXIMA_CACHE: number;
    ALTA_PRECISION: boolean;
}

export interface IconProps {
  width?: number;
  height?: number;
}

export interface ConfigVector {
    centroInicial: [number, number];
    zoomInicial: number;
    minZoom: number;
    maxZoom: number;
    tilesURL: string;
    capas: {
        relieve: string;
        lotes: string;
        palmas: string;
        postes: string;
        aspersores: string;
        cercas_divisorias: string;
        vialidad_principal: string;
        tendido_electrico: string;
    };
    limitesPantalla: [number, number, number, number];
}

export interface InfoFincaEstructura {
    nombre: string;
    razonSocial: string;
    rif: string;
    estado: string;
    municipio: string;
    parroquia: string;
    configVector: ConfigVector;
    configMap: {
        centroInicial: [number, number];
        zoomInicial: number;
        minZoom: number;
        maxZoom: number;
        maxBounds: [number, number, number, number];
    };
}

/**
 * Opciones de configuración para la creación de capas de líneas vectoriales.
 */
export interface OpcionesCapaLinea {
    id: string;
    nombreCapa: keyof ConfigVector['capas'];
    colorHex: string;
    /** Grosor de la línea en la vista global/general (Mínimo detalle de los elementos, ej: zoom 12) */
    grosorMinimoDetalle: number;
    /** Grosor opcional en la vista enfocada/profunda (Máximo detalle de los elementos, ej: zoom 16) */
    grosorMaximoDetalle?: number | null;
    configVector: ConfigVector;
    dashArray?: number[] | null;
    minzoom?: number | null;
    /** Nivel de zoom para la escala global/general (Por defecto 12) */
    zoomMinimoDetalle?: number;     
    /** Nivel de zoom para la escala enfocada/profunda (Por defecto 16) */
    zoomMaximoDetalle?: number;
}





