// Configuración de la Base de Datos
export const DB_NAME = "GeoDB";
export const DB_VERSION = 4;
export const STORE_NAME = "posiciones";

export type RegistroPosicion = {
    id ?: number;
    uuid: string;
    latitud: number;
    longitud: number;
    fecha_registro: string;
    hora_registro: string;
    galeria: number;
    precision: number;
    revision_planta: boolean;
    sincronizacion: boolean;
    fecha_revision: string | null;
    hora_revision: string | null;
};

export type SidebarData = {
  uuid: string;
  lat: number;
  lng: number;
  revision_planta: boolean;
}

export type RespuestaGeoJsonSidebarData  = {
    data: GeoJSON.FeatureCollection<GeoJSON.Point>;
    message: string;
    success: boolean;
}

export interface GpsConfig {
    TOLERANCIA_METROS: number;
    TIMEOUT_MS: number;
    EDAD_MAXIMA_CACHE: number;
    ALTA_PRECISION: boolean;
}

export const CONFIG_GPS: GpsConfig = {
    TOLERANCIA_METROS: 20,       
    TIMEOUT_MS: 15000,           
    EDAD_MAXIMA_CACHE: 0,        
    ALTA_PRECISION: true
}

// En servicioTipos.ts

export const CONFIG_MAPA = {
    // Extraído de: layername=plg_lotes_danubio_feb_2026_web_mercator
    LAYER_NAME_LOTES: 'plg_lotes_danubio_feb_2026_web_mercator',
    
    // Extraído de: layername=pts_palmas_danubio_feb_2026_web_mercator
    LAYER_NAME_PALMAS: 'pts_palmas_danubio_feb_2026_web_mercator',
    
    // Configuración de tiles basada en XYZ_TEMPLATE
    TILES_URL: `${window.location.origin}/pwa/tiles/{z}/{x}/{y}.pbf`,
    
    // Límites y Zooms según el proceso de QGIS
    ZOOM_MIN: 0,
    ZOOM_MAX: 14,
    BOUNDS: [-72.706, 9.851, -72.697, 9.874] as [number, number, number, number]
};



