import { type Map as MapLibreMap } from 'maplibre-gl';
import { INFO_FINCA } from '../../../data/finca/info';

import { 
    crearCapaEtiquetas, 
    crearCapaPuntos,
    crearCapaLineas 
} from './utilsVectorTilesMapa';


export const configurarCapasBase = (map: MapLibreMap) => {

    const { configVector } = INFO_FINCA;
    
    // 1. Registro Único de la Fuente de Datos
    map.addSource('finca-danubio-source', {
        type: 'vector',
        tiles: [configVector.tilesURL],
        minzoom: configVector.minZoom,
        maxzoom: configVector.maxZoom,
        bounds: configVector.limitesPantalla
    });

    // 2. Capa Base de Relieve Poligonal
    map.addLayer({
        'id': 'relieve-danubio-fill',
        'type': 'fill',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.relieve,
        'paint': {
            // Convierte el atributo 'color' directamente a un formato de color válido
            'fill-color': ['concat', 'rgb(', ['get', 'color'], ')'], 
            'fill-opacity': 0.5
        }
    });


    
    // 3. Capa de Lotes (Polígonos Estilizados)
    map.addLayer({
        'id': 'lotes-danubio-fill',
        'type': 'fill',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lotes,
        'paint': {
            'fill-color': ['concat', 'rgb(', ['get', 'color'], ')'],
            'fill-opacity': 1,
            'fill-outline-color': '#ffffff'
        }

    });


    // 4. Capa de lineas para el poligono de lotes
    // basado en el campo clasificacion por lotes
    map.addLayer({
        'id': 'relieve-danubio-line',
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lotes,
        'paint': {
            'line-color': [
                    'step',
                    ['zoom'],
                    // 1. CONDICIÓN PARA ZOOM MENOR A 15:
                    [
                        'match',
                        ['get', 'clasificacion'],
                        'LOTE', '#1A312C', // Si es LOTE, se pinta negro
                        'rgba(0, 0, 0, 0)' // Para cualquier otra clasificación, transparente
                    ],
                    // 2. CORTE EN ZOOM 15:
                    15.0, 'rgba(0, 0, 0, 0)' // De zoom 15 en adelante, todo transparente
            ],
            'line-width': 1.5
        }
    });

    

    //6. capa de linea para las cercas divisorias

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
            zoomMinimoDetalle: 12,    // Vista global
            grosorMinimoDetalle: 3.5, // Cuando hay poco detalle la vía es delgada
            zoomMaximoDetalle: 16,    // Vista enfocada
            grosorMaximoDetalle: 7.0, // Al máximo detalle la vía se ensancha
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

    

    //7. Simboligia de la "x" para la cerca
    map.addLayer({
        'id': 'cerca-danubio-simbologia-x',
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.cercas_divisorias,
        'minzoom': 15, 
        'layout': {
            // Configuramos la variable de texto estática 'X'
            'text-field': 'X',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 13,
            
            // UBICACIÓN DE LA SIMBOLOGÍA SOBRE LA GEOMETRÍA
            'symbol-placement': 'line',        // Fuerza a que las 'X' se distribuyan a lo largo de la línea
            'text-rotation-alignment': 'map', // Sincroniza la rotación de la 'X' con el rumbo de la línea
            
            // INTERVALO DE DISTANCIA
            'symbol-spacing': 35,             // Cada 35 píxeles de pantalla se intercalará una 'X' automáticamente
            
            'text-keep-upright': true,        // Evita que los símbolos queden de cabeza si la línea cambia de dirección
            'text-allow-overlap': true        // Permite el renderizado forzado para que no se oculten entre sí
        },
        'paint': {
            'text-color': '#000000',      // Color negro para las equis
            'text-halo-color': '#ffffff', // Halo blanco de respaldo para mantener visibilidad sobre el relieve
            'text-halo-width': 1.5
        }
    });

    const textoCapaLineaCerca = crearCapaEtiquetas(
        'labels-cerca divisoria',
        'cercas_divisorias',
        ["has", "desc"],
        0,
        21,
        configVector,
        null,
        true
    );

    map.addLayer(textoCapaLineaCerca);

    const textoCapaLineaVialidad = crearCapaEtiquetas(
        'labels-vialidad-principal',
        'vialidad_principal',
        ["has", "desc"],
        0,
        21,
        configVector,
        null,
        true
    );

    map.addLayer(textoCapaLineaVialidad);

    

    const capaPalmas = crearCapaPuntos(
        'palmas-base',
        'palmas',
        null, // Filtro para aislar las palmas
        15,
        undefined,
        '#212121', // Negro directo para las palmas
        configVector
    );

    map.addLayer(capaPalmas);

    const capaPostes = crearCapaPuntos(
        'poste-base',
        'postes',
        null, // Filtro para aislar las palmas
        15,
        undefined,
        '#FF4400',
        configVector
    );

    map.addLayer(capaPostes);

    map.addLayer({
        'id': 'etiquetas-postes-danubio',
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.postes,
        'minzoom': 17,
        'layout': {
            'text-field': 'POSTE', // Texto estático según tu requerimiento
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate', ['linear'], ['zoom'],
                17, 9,
                18, 14
            ],
            'text-offset': [2.5, 0], // Desplaza el texto hacia abajo del punto/triángulo
            'text-anchor': 'top'
        },
        'paint': {
            'text-color': '#212121', // Gris carbón coincidente con el punto
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5
        }
    });

    const capaAspersores = crearCapaPuntos(
        'aspersores-base',
        'aspersores',
        null, // Filtro para aislar las palmas
        15,
        undefined,
        '#0288D1',
        configVector
    );

    map.addLayer(capaAspersores);


    // 4. Texto de los poligonos de los lotes
    const textoCapaLotes = crearCapaEtiquetas(
        'labels-lotes-zoom-bajo',
        'lotes',
        ['==', ['get', 'clasificacion'], 'LOTE'],
        0,
        15,
        configVector,
        8
    );

    map.addLayer(textoCapaLotes);

    const textoCapaOtrosEnLotes = crearCapaEtiquetas(
        'labels-lotes-zoom-alto',
        'lotes',
        ["!", ["has", "clasificacion"]] ,
        16,
        21,
        configVector,
        8
    );

    map.addLayer(textoCapaOtrosEnLotes);

};

