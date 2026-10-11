
import type { InfoFincaEstructura } from "../../types";

const getTilesURL = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/tiles/{z}/{x}/{y}.pbf`;
};

export const INFO_FINCA: InfoFincaEstructura = {
    nombre: "FINCA SANTA CRUZ",
    razonSocial: "AGROPECUARIA PALMERA EJEMPLO, S.A.",
    rif: "A-11223344-0",
    estado: "ZULIA",
    municipio: "MARA",
    parroquia: "RICAURTE",

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configVector: {
        centroInicial: [-71.676345, 10.775987] as [number, number],
        zoomInicial: 14,
        minZoom: 0,
        maxZoom: 15,
        maxZoomSource: 14,
        // Configuración de tiles basada en XYZ_TEMPLATE
        tilesURL: getTilesURL(),
        // Nombres de las capas generadas en QGIS para este cliente
        capas: {
            relieve: 'plg_terrain_finca_pseudo_mercator',
            lotes: 'plg_growing_area_interventions_finca_pseudo_mercator',
            palmas: 'pts_palm_trees_finca_pseudo_mercator',
            postes: 'pts_power_poles_finca_pseudo_mercator',
            aspersores: 'pts_irrigation_sprinklers_pseudo_mercator',
            cercas_divisorias : 'ln_protection_fence_pseudo_mercator',
            vialidad_principal: 'ln_roads_finca_pseudo_mercator',
            tendido_electrico: 'ln_power_lines_finca_pseudo_mercator'
        },
        // [ [xMin Oeste, yMin Sur], [xMax Este, yMax Norte] ]
        // [ Izquierda (minLon), Inferior (minLat), Derecha (maxLon), Superior (maxLat) ]
        limitesPantalla:  [-71.687247, 10.768340, -71.668239, 10.786124] as [number, number, number, number]
    },

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configMap : {
        centroInicial: [-71.676345, 10.775987] as [number, number],
        zoomInicial: 14,
        minZoom: 14,
        maxZoom: 20,
        maxBounds: [-71.687247, 10.768340, -71.668239, 10.786124] as [number, number, number, number]
    }

}



export const URL_API_BACKEND = "http://localhost/api-gepad";
