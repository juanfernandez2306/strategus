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
  sincronizacion: boolean;
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
  className?: string;
}

export interface ConfigVector {
    centroInicial: [number, number];
    zoomInicial: number;
    minZoom: number;
    maxZoom: number;
    maxZoomSource: number;
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
    /** Soporta un color string plano (ej: '#1A312C') o una expresión dinámica de MapLibre (ej: ['step', ...]) */
    colorHex: any; 
    grosorMinimoDetalle: number;
    grosorMaximoDetalle?: number | null;
    configVector: ConfigVector;
    dashArray?: number[] | null;
    minzoom?: number | null;
    maxzoom?: number | null;
    filter?: FilterSpecification | null;
    zoomMinimoDetalle?: number;     
    zoomMaximoDetalle?: number;
}

import type { FilterSpecification } from "maplibre-gl";

/**
 * Opciones de configuración para la creación de capas de puntos (círculos).
 */
export interface OpcionesCapaPunto {
    id: string;
    nombreCapa: keyof ConfigVector['capas'];
    colorHex: string;
    configVector: ConfigVector;
    filter?: FilterSpecification | null;
    minzoom: number;
    maxzoom?: number | null;
    /** Radio del punto en la vista lejana (Mínimo detalle del elemento, por defecto zoom 15) */
    radioMinimoDetalle?: number;
    /** Radio del punto en la vista a ras de suelo (Máximo detalle del elemento, por defecto zoom 19) */
    radioMaximoDetalle?: number;
    /** Nivel de zoom de inicio para calcular el tamaño (Por defecto 15) */
    zoomMinimoDetalle?: number;
    /** Nivel de zoom de fin para calcular el tamaño (Por defecto 19) */
    zoomMaximoDetalle?: number;
}


/** Configuración compartida por todas las fábricas de etiquetas */
interface BaseOpcionesEtiqueta {
    id: string;
    nombreCapa: keyof ConfigVector['capas'];
    configVector: ConfigVector;
    filter?: FilterSpecification | null;
    minzoom?: number | null;
    maxzoom?: number | null;
    tamanoMinimoDetalle?: number;
    tamanoMaximoDetalle?: number;
    zoomMinimoDetalle?: number;
    zoomMaximoDetalle?: number;
    textoEstatico?: string | null;
    campoContenedorTexto?: string | null;
}

/** 1. Responsabilidad: Textos flotantes sobre geometrías puntuales */
export interface OpcionesEtiquetaPunto extends BaseOpcionesEtiqueta {
    desplazamientoTexto?: [number, number];
    anclajeTexto?: 'center' | 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

/** 2. Responsabilidad: Textos y simbologías continuas a lo largo de un eje */
export interface OpcionesEtiquetaLinea extends BaseOpcionesEtiqueta {
    espaciadoSimbologia?: number;
    textOffset?: [number, number];
}

/** 3. Responsabilidad: Textos contenidos dentro de áreas cerradas con wrap automático */
export interface OpcionesEtiquetaPoligono extends BaseOpcionesEtiqueta {
    caracteresWrap?: number;
}

export interface OpcionesCapaPoligono {
    id: string;
    nombreCapa: keyof ConfigVector['capas'];
    /** Soporta color estático plano (ej: '#E8F5E9') o expresiones dinámicas nativas de MapLibre */
    colorFill: any; 
    configVector: ConfigVector;
    filter?: FilterSpecification | null;
    minzoom?: number | null;
    maxzoom?: number | null;
    /** Opacidad del relleno entre 0.0 y 1.0 (Por defecto 0.5) */
    opacidadFill?: number;
}

export interface OpcionesEtiquetaPuntoPersonalizada {
    id: string;
    coordenadas: [number, number]; // [longitud, latitud]
    texto: string;
    minzoom: number;
    maxzoom?: number;
    rotacion: number; // El ángulo exacto en grados para orientar la 'V'
    desplazamiento?: [number, number];
}





