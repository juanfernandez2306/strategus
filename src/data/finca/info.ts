let coordenada_centro = [-72.31968, 8.29176];

export const INFO_FINCA = {
    nombre: "HACIENDA PALMERA DON BOSCO",
    razonSocial: "AGRÍCOLA EL DIAMANTE LA FRÍA C.A.,",
    rif: "J-00214035-6",
    estado: "TÁCHIRA",
    municipio: "GARCÍA DE HEVÍA",
    parroquia: "JOSÉ ANTONIO PÁEZ",

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configVector: {
        centroInicial: coordenada_centro as [number, number],
        zoomInicial: 14,
        minZoom: 0,
        maxZoom: 14,
        // Configuración de tiles basada en XYZ_TEMPLATE
        tilesURL: `${window.location.origin}/pwa/tiles/{z}/{x}/{y}.pbf`,
        // Nombres de las capas generadas en QGIS para este cliente
        capas: {
            lotes: 'plg_finca_don_bosco_corrales_casa',
            palmas: 'pts_finca_don_bosco',
            lineas: 'ln_infraestructuras_don_bosco'
        },
        // [ [xMin Oeste, yMin Sur], [xMax Este, yMax Norte] ]
        limitesPantalla:  [-72.3327, 8.2845, -72.3080, 8.3021] as [number, number, number, number]
    },

    // --- PARÁMETROS TÉCNICOS DEL VECTOR TILES MAP ---
    configMap : {
        centroInicial: coordenada_centro as [number, number],
        zoomInicial: 14,
        minZoom: 13,
        maxZoom: 20,
        maxBounds: [-72.3392, 8.2729, -72.3035, 8.3075] as [number, number, number, number]
    }

}
