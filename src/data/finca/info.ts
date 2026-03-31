
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
        tilesURL: `${window.location.origin}/pwa/tiles/{z}/{x}/{y}.pbf`,
        // Nombres de las capas generadas en QGIS para este cliente
        capas: {
            lotes: 'plg_lotes_danubio_feb_2026_web_mercator',
            palmas: 'pts_palmas_danubio_feb_2026_web_mercator'
        },
        // [ [xMin Oeste, yMin Sur], [xMax Este, yMax Norte] ]
        limitesPantalla:  [-72.706, 9.851, -72.697, 9.874] as [number, number, number, number]
    },

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configMap : {
        centroInicial: [-72.70189, 9.86245] as [number, number],
        zoomInicial: 14,
        minZoom: 12,
        maxZoom: 20
    }

}
