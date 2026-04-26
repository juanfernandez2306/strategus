import { NOMBRE_CARPETA_DOMINIO } from "./appConfig";

const getTilesURL = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/${NOMBRE_CARPETA_DOMINIO}/tiles/{z}/{x}/{y}.pbf`;
};

export const INFO_FINCA = {
    nombre: "FINCA DANUBIO",
    razonSocial: "AGROPECUARIA GUAIKINIMA, C.A.",
    rif: "J-29556953-0",
    estado: "ZULIA",
    municipio: "MACHIQUES DE PERIJA",
    parroquia: "LIBERTAD",

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configVector: {
        centroInicial: [-72.701892, 9.862457] as [number, number],
        zoomInicial: 14,
        minZoom: 0,
        maxZoom: 14,
        // Configuración de tiles basada en XYZ_TEMPLATE
        tilesURL: getTilesURL(),
        // Nombres de las capas generadas en QGIS para este cliente
        capas: {
            lotes: 'plg_lotes_danubio_feb_2026_web_mercator',
            palmas: 'pts_features_plantacion_palmas_danubio_20260403',
            lineas: 'ln_features_recorte_densificadas_limites_danubio_20260403_web_mercator'
        },
        // [ [xMin Oeste, yMin Sur], [xMax Este, yMax Norte] ]
        limitesPantalla:  [-72.706288183, 9.850626825, -72.696354309, 9.877790092] as [number, number, number, number]
    },

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configMap : {
        centroInicial: [-72.70189, 9.86245] as [number, number],
        zoomInicial: 14,
        minZoom: 14,
        maxZoom: 20,
        maxBounds: [-72.71755, 9.84545, -72.68346, 9.88455] as [number, number, number, number]
    }

}
