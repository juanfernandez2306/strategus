
import type { InfoFincaEstructura } from "../../types";

const getTilesURL = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/tiles/{z}/{x}/{y}.pbf`;
};

export const INFO_FINCA: InfoFincaEstructura = {
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
        maxZoom: 15,
        maxZoomSource: 14,
        // Configuración de tiles basada en XYZ_TEMPLATE
        tilesURL: getTilesURL(),
        // Nombres de las capas generadas en QGIS para este cliente
        capas: {
            relieve: 'plg_relieve_plantacion_danubio_web_mercator_20260612',
            lotes: 'plg_lotes_danubio_web_mercator_20260612',
            palmas: 'pts_palmas_danubio_web_mercator_20260612',
            postes: 'pts_postas_electrico_danubio_web_mercator_20260612',
            aspersores: 'pts_aspersores_vivero_danubio_web_mercator_20260612',
            cercas_divisorias : 'ln_cerca_danubio_web_mercator_20260608',
            vialidad_principal: 'ln_vialidad_mision_machiques_web_mercator_20260612',
            tendido_electrico: 'ln_tendido_electrico_danubio_web_mercator_20260612'
        },
        // [ [xMin Oeste, yMin Sur], [xMax Este, yMax Norte] ]
        limitesPantalla:  [-72.71120302, 9.84588522, -72.68403027, 9.88845762] as [number, number, number, number]
    },

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configMap : {
        centroInicial: [-72.70189, 9.86245] as [number, number],
        zoomInicial: 14,
        minZoom: 14,
        maxZoom: 20,
        maxBounds: [-72.71500, 9.84200, -72.68000, 9.88950] as [number, number, number, number]
    }

}

/** */

export const URL_API_BACKEND = "https://api.juanfgeo.com";
