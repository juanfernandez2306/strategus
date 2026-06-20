import { type Map as MapLibreMap } from 'maplibre-gl';
import { INFO_FINCA } from '../../../data/finca/info';

import { 
    crearCapaPuntos,
    crearCapaLineas,
    crearCapaPoligonos,
    crearEtiquetasPuntos,
    crearEtiquetasLineas,
    crearEtiquetasPoligonos
} from './utilsVectorTilesMapa';


export const configurarCapasBase = (map: MapLibreMap) => {

    const { configVector } = INFO_FINCA;
    
    // 1. Registro Único de la Fuente de Datos
    map.addSource('finca-danubio-source', {
        type: 'vector',
        tiles: [configVector.tilesURL],
        minzoom: configVector.minZoom,
        maxzoom: 14,
        bounds: configVector.limitesPantalla
    });

    const capaRelieve = crearCapaPoligonos({
        id: 'relieve-danubio-fill',
        nombreCapa: 'relieve',
        colorFill: ['concat', 'rgb(', ['get', 'color'], ')'], // Expresión dinámica nativa
        opacidadFill: 0.5,
        configVector
    });

    map.addLayer(capaRelieve);

    const capaLotesRelleno = crearCapaPoligonos({
        id: 'lotes-danubio-fill',
        nombreCapa: 'lotes',
        colorFill: ['concat', 'rgb(', ['get', 'color'], ')'], 
        opacidadFill: 0.6,
        configVector
    });

    map.addLayer(capaLotesRelleno);

    const capaLotesBorde = crearCapaLineas({
        id: 'relieve-danubio-line',
        nombreCapa: 'lotes',
        grosorMinimoDetalle: 1.5, // Tu valor exacto fijado en 'line-width'
        configVector,
        // Pasamos tu expresión condicional idéntica basada en zooms y clasificaciones
        colorHex: [
            'step',
            ['zoom'],
            // 1. Zoom menor a 15: Evalúa clasificación
            [
                'match',
                ['get', 'clasificacion'],
                'LOTE', '#1A312C',   // Si es lote, verde oscuro
                'rgba(0, 0, 0, 0)'   // Cualquier otra clasificación, invisible
            ],
            // 2. A partir de zoom 15: Todo se oculta (transparente)
            15.0, 'rgba(0, 0, 0, 0)'
        ]
    });
    
    map.addLayer(capaLotesBorde);
    

    const capasLineas = [
        crearCapaLineas({
            id: 'cercas-divisorias',
            nombreCapa: 'cercas_divisorias',
            colorHex: '#1A312C',
            grosorMinimoDetalle: 0.7,
            grosorMaximoDetalle: 2.5,
            configVector
        }),

        crearCapaLineas({
            id: 'tendido-electrico-danubio',
            nombreCapa: 'tendido_electrico',
            colorHex: '#FF4400',
            grosorMinimoDetalle: 2.5,
            minzoom: 15,
            configVector
        }),

        crearCapaLineas({
            id: 'vialidad-principal-borde',
            nombreCapa: 'vialidad_principal',
            colorHex: '#000000',
            zoomMinimoDetalle: 12,   
            grosorMinimoDetalle: 3.5,
            zoomMaximoDetalle: 16,
            grosorMaximoDetalle: 7.0,
            configVector
        }),

        crearCapaLineas({
            id: 'vialidad-principal-centro-dash',
            nombreCapa: 'vialidad_principal',
            colorHex: '#FFFFFF',
            zoomMinimoDetalle: 12,
            grosorMinimoDetalle: 1.5, // Línea delgada en el mínimo detalle
            zoomMaximoDetalle: 16,
            grosorMaximoDetalle: 3.0, // Línea gruesa en el máximo detalle
            dashArray: [4, 4],
            configVector
        })
    ];

    capasLineas.forEach(capa => map.addLayer(capa));

    const capaPuntos = [
        crearCapaPuntos({
            id: 'palmas-base',
            nombreCapa: 'palmas',
            colorHex: '#212121', // Negro directo para las palmas
            configVector,
            minzoom: 15
        }),

        crearCapaPuntos({
            id: 'poste-base',
            nombreCapa: 'postes',
            colorHex: '#FF4400',
            configVector,
            minzoom: 15
        }),

        crearCapaPuntos({
            id: 'aspersores-base',
            nombreCapa: 'aspersores',
            colorHex: '#0288D1', // Azul hidráulico para los aspersores
            configVector,
            // Si quisieras cambiar el tamaño de los aspersores de forma específica, ahora es tan fácil como hacer esto:
            radioMinimoDetalle: 2.0, 
            radioMaximoDetalle: 9.0,
            minzoom: 15
        })
    ];

    capaPuntos.forEach(capa => map.addLayer(capa));

    const capasEtiquetas = [
        
        crearEtiquetasLineas({
            id: 'cerca-danubio-simbologia-x',
            nombreCapa: 'cercas_divisorias',
            textoEstatico: 'X',
            minzoom: 15,
            espaciadoSimbologia: 35, // Patrón denso de cruces
            tamanoMinimoDetalle: 13, 
            tamanoMaximoDetalle: 13, // Tamaño fijo
            configVector
        }),
       
        crearEtiquetasLineas({
            id: 'labels-vialidad-principal',
            nombreCapa: 'vialidad_principal',
            filter: ["has", "desc"],
            minzoom: 12,
            configVector
        }),

        crearEtiquetasPuntos({
            id: 'etiquetas-postes-danubio',
            nombreCapa: 'postes',
            textoEstatico: 'POSTE',
            minzoom: 17,
            tamanoMinimoDetalle: 9, zoomMinimoDetalle: 17,
            tamanoMaximoDetalle: 14, zoomMaximoDetalle: 18,
            desplazamientoTexto: [2.5, 0], // Exclusivo de puntos
            anclajeTexto: 'top',          // Exclusivo de puntos
            configVector
        }),

        crearEtiquetasPoligonos({
            id: 'labels-lotes-zoom-bajo',
            nombreCapa: 'lotes',
            filter: ['==', ['get', 'clasificacion'], 'LOTE'],
            minzoom: 0, maxzoom: 15,
            caracteresWrap: 8, // Exclusivo de polígonos
            configVector
        }),

        crearEtiquetasPoligonos({
            id: 'labels-lotes-zoom-alto',
            nombreCapa: 'lotes',
            filter: ['==', ['get', 'clasificacion'], 'AREA'],
            minzoom: 16, maxzoom: 21,
            caracteresWrap: 8, // Exclusivo de polígonos
            configVector
        }),

        crearEtiquetasPoligonos({
            id: 'labels-lotes-bomba',
            nombreCapa: 'lotes',
            filter: ['==', ['get', 'clasificacion'], 'BOMBA'],
            minzoom: 18.5, maxzoom: 21,
            caracteresWrap: 8, // Exclusivo de polígonos
            configVector
        })


    ];

    capasEtiquetas.forEach(capa => map.addLayer(capa));

};

