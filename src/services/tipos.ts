// Configuración de la Base de Datos
export const DB_NAME = "GeoDB";
export const DB_VERSION = 4;
export const STORE_NAME = "posiciones";

export type RegistroPosicion = {
    id ?: number;
    uuid: string;
    latitud: number;
    longitud: number;
    fecha: string;
    hora: string;
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



