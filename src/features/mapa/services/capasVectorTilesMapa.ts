import { type Map as MapLibreMap } from 'maplibre-gl';
import { INFO_FINCA } from '../../../data/finca/info';

import type { ConfigVector as ConfigVectorType }  from '../../../types';


import type { 
    SymbolLayerSpecification,
    CircleLayerSpecification,
    FilterSpecification } from 'maplibre-gl';

export function crearCapaPuntos(
    id: string,
    nombreCapa: keyof ConfigVectorType['capas'], 
    filter: FilterSpecification | null,
    minzoom: number,
    maxzoom: number | undefined,
    colorHex: string,
    configVector: ConfigVectorType
): CircleLayerSpecification {
    
    const paintCompartido: CircleLayerSpecification['paint'] = {
        // Desvanecimiento suave al aparecer la capa
        'circle-opacity': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.5, 1
        ],
        // Radio dinámico adaptado al rango de visibilidad real (> 15)
        'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            15, 1.5,
            17, 4.5,
            19, 7.5
        ],
        // ASIGNACIÓN DIRECTA: Usamos el parámetro sin condicionales 'match' o 'get'
        'circle-color': colorHex, 
        
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
    };

    const capa: CircleLayerSpecification = {
        'id': id,
        'type': 'circle',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa], 
        'minzoom': minzoom,
        'paint': paintCompartido
    };

    if (maxzoom !== undefined) {
        capa['maxzoom'] = maxzoom;
    }

    if (filter !== null) {
        capa['filter'] = filter;
    }

    return capa;
}

function crearCapaEtiquetas(
    id: string,
    nombreCapa: keyof ConfigVectorType['capas'],
    filter: FilterSpecification, 
    minzoom: number, 
    maxzoom: number,
    configVector: ConfigVectorType,
    caracteresWrap: number | null = null,
    esLinea: boolean = false
): SymbolLayerSpecification {
    
    const layoutCompartido: SymbolLayerSpecification['layout'] = {
        'text-field': ['get', 'desc'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 14, 18, 18],
        'text-justify': 'center',
        'text-transform': 'uppercase',
        'text-padding': 10,
        'text-allow-overlap': false
    };

    if (esLinea) {
        layoutCompartido['symbol-placement'] = 'line';
        layoutCompartido['text-rotation-alignment'] = 'map';
        layoutCompartido['symbol-spacing'] = 250;
        layoutCompartido['text-offset'] = [0, -1.2]
    }

    if (caracteresWrap !== null) {
        // Dividimos entre 1.2 porque text-max-width se mide en 'ems' (ancho de la letra M)
        layoutCompartido['text-max-width'] = caracteresWrap; 
    }

    const paintCompartido: SymbolLayerSpecification['paint'] = {
        'text-color': '#212121',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
    };

    return {
        'id': id,
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa],
        'minzoom': minzoom,
        'maxzoom': maxzoom,
        'filter': filter,
        'layout': layoutCompartido,
        'paint': paintCompartido
    };
}


export const configurarCapasBase = (map: MapLibreMap) => {

    const { configVector } = INFO_FINCA;
    
    // 1. Fuente de Vector Tiles (Configurada según QGIS)
    map.addSource('finca-danubio-source', {
        type: 'vector',
        tiles: [configVector.tilesURL],
        minzoom: configVector.minZoom,
        maxzoom: configVector.maxZoom,
        bounds: configVector.limitesPantalla
    });

    //capa de relieve
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


    
    // 2. Capa de Lotes (Polígonos)
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


    //3. Capa de lineas para el poligono de lotes
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
                        'LOTE', '#000000', // Si es LOTE, se pinta negro
                        'rgba(0, 0, 0, 0)' // Para cualquier otra clasificación, transparente
                    ],
                    // 2. CORTE EN ZOOM 15:
                    15.0, 'rgba(0, 0, 0, 0)' // De zoom 15 en adelante, todo transparente
            ],
            'line-width': 1.5
        }
    });


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

    // 5. Texto de los poligonos de los lotes pero otros
    // para zoom mayores a 15

    const textoCapaOtrosEnLotes = crearCapaEtiquetas(
        'labels-lotes-zoom-alto',
        'lotes',
        ["!", ["has", "clasificacion"]] ,
        15.5,
        21,
        configVector,
        8
    );

    map.addLayer(textoCapaOtrosEnLotes);

    //6. capa de linea para las cercas divisorias
    map.addLayer({
        'id': 'cerca-danubio-zoom-bajo',
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.cercas_divisorias,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#424242', // Gris oscuro estándar
            'line-width': 1.5
        }
    });

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


    map.addLayer({
        'id': 'vialidad-principal-borde',
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.vialidad_principal,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#000000',
            'line-width': [
                'interpolate', ['linear'], ['zoom'],
                12, 3.5,  // En zoom lejano tiene 3.5px de grosor total
                16, 7.0   // En zoom cercano se ensancha a 7px total
            ]
        }
    });

    map.addLayer({
        'id': 'vialidad-principal-centro-dash',
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.vialidad_principal, 
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#FFFFFF', // Blanco para el eje central
            // Debe ser más delgada que la capa negra para que se note el borde de fondo
            'line-width': [
                'interpolate', ['linear'], ['zoom'],
                12, 1.5,  // Deja 1px de borde negro a cada lado (1.5 blanco + 2 negro = 3.5 total)
                16, 3.0   // Deja 2px de borde negro a cada lado (3 blanco + 4 negro = 7 total)
            ],
            // ARRAY DASH: Definición de los segmentos intercalados
            // [Longitud del guión, Longitud del espacio vacío] medido en múltiplos del ancho de la línea
            'line-dasharray': [4, 4] 
        }
    });

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

    map.addLayer({
        'id': 'tendido-electrico-danubio',
        'type': 'line',
        'source': 'finca-danubio-source',
        'minzoom': 15,
        'source-layer': configVector.capas.tendido_electrico,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#FF4400',
            'line-width': 1.5
        }
    });

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

    /*
    // 8. Capa de Líneas (Cercas, Linderos y Tendido)
    map.addLayer({
        'id': 'lineas-danubio-features',
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lineas,
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            // Color según el campo 'desc'
            'line-color': [
                'match',
                ['get', 'desc'],
                'lindero', '#000000', // Negro continuo
                'tendido', '#FF4400', // Naranja continuo
                'cerca', '#424242',
                'hidrografia', '#03AED2',    // Gris oscuro para la cerca
                '#000000'             // Valor por defecto
            ],
            'line-width': [
                'match',
                ['get', 'desc'],
                'tendido', 2.5, // Resaltar el tendido eléctrico
                1.5            // Grosor estándar para el resto
            ],
            // Aplicación de línea discontinua solo a 'cerca'
            'line-dasharray': [
                'match',
                ['get', 'desc'],
                'cerca', ['literal', [2, 2]], // 2 unidades de línea, 2 de espacio
                ['literal', [1, 0]]           // Línea continua para el resto
            ],
            'line-blur': [
                'interpolate', ['linear'], ['zoom'],
                14, 0,
                18, 0.75
            ]
        }
    });

    // 3. Capa de Palmas (Puntos)
    map.addLayer({
        'id': 'palmas-puntos-base',
        'type': 'circle',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.palmas,
        'minzoom': 15,
        'paint': {
            'circle-opacity': [
                'interpolate', ['linear'], ['zoom'],
                15, 0, // Totalmente transparentes en zoom 15
                15.5, 1  // Totalmente sólidos en zoom 15.5
            ],
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                8, 0.5,
                14, 5
            ],
            'circle-color': [
                'match',
                ['get', 'desc'],
                'poste', '#F13E93',      
                'PALMA', '#212121',
                'aspersores', '#0288D1', 
                '#9E9E9E'      
            ],
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });

    map.addLayer({
        'id': 'lineas-suavizado-efecto',
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lineas,
        'paint': {
            'line-color': '#ffffff',
            'line-width': 0.5,
            'line-opacity': 0.4
        }
    });

    // 9. Etiquetas para las Líneas (Usando campo 'nombre')
    map.addLayer({
        'id': 'etiquetas-lineas-nombres',
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lineas,
        // Filtro: Solo mostrar si 'nombre' existe y no es null
        'filter': ['all', 
            ['has', 'nombre'], 
            ['!=', ['get', 'nombre'], null]
        ],
        'minzoom': 15, 
        'layout': {
            'symbol-placement': 'line',
            'text-field': ['get', 'nombre'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate', ['linear'], ['zoom'],
                15, 9,
                18, 13
            ],
            'text-letter-spacing': 0.1,
            'symbol-spacing': 350,
            'text-max-angle': 38,
            'text-transform': 'uppercase',
            // GESTIÓN DEL DESPLAZAMIENTO:
            // [x, y] -> El segundo valor (y) mueve el texto perpendicular a la línea.
            // -1.2 lo coloca justo encima de la línea para que sea legible.
            'text-offset': [0, -1.2],
            'text-keep-upright': true
        },
        'paint': {
            'text-color': '#212121',
            'text-halo-color': 'rgba(255, 255, 255, 0.9)',
            'text-halo-width': 2
        }
    });


    // 5. Etiquetas específicas para los Postes
    map.addLayer({
        'id': 'etiquetas-postes-danubio',
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.palmas, // Capa de puntos 
        'filter': ['==', ['get', 'desc'], 'poste'], // Filtro estricto para solo mostrar "poste"
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

    // 6. Etiquetas de Lotes (Filtro por FID y Zoom inverso)
    map.addLayer({
        'id': 'lotes-etiquetas-condicional',
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lotes,
        // Filtro: Solo elementos con FID <= 11
        'filter': ['<=', ['to-number', ['get', 'fid']], 11],
        'minzoom': 0,    // Visible desde el nivel más lejano
        'maxzoom': 15.5, // Desaparece al acercarse más de 15.5
        'layout': {
            'text-field': ['get', 'nombre'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate', ['linear'], ['zoom'],
                10, 10,
                15, 14
            ],
            'text-justify': 'center',
            'text-transform': 'uppercase',
            'text-padding': 10,
            // Evita que las etiquetas se solapen entre sí
            'text-allow-overlap': false 
        },
        'paint': {
            'text-color': '#212121',
            'text-halo-color': '#ffffff',
            'text-halo-width': 2,
            'text-opacity': [
                'interpolate', ['linear'], ['zoom'],
                15, 1,
                15.5, 0 // Desvanecimiento suave al llegar al zoom 15.5
            ]
        }
    });

    // 7. Etiquetas de Lotes Secundarios (FID >= 12, Zoom 16-18)
    map.addLayer({
        'id': 'lotes-etiquetas-detalle',
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lotes,
        // Filtro: Solo elementos con FID >= 12
        //'filter': ['>=', ['to-number', ['get', 'fid']], 12],
        'filter': ['!=', ['get', 'desc'], ''],
        'minzoom': 16, // Aparecen cuando el usuario se acerca
        'maxzoom': 19, // Se mantienen visibles en zooms profundos
        'layout': {
            'text-field': ['get', 'nombre'],
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': [
                'interpolate', ['linear'], ['zoom'],
                13, 10,
                20, 14
            ],
            'text-justify': 'center',
            'text-transform': 'uppercase',
            'text-padding': 5,
            'text-allow-overlap': false
        },
        'paint': {
            'text-color': '#424242', // Un gris un poco más claro para diferenciar de los principales
            'text-halo-color': '#ffffff',
            'text-halo-width': 1.5,
            'text-opacity': [
                'interpolate', ['linear'], ['zoom'],
                16, 0,
                16.5, 1
            ]
        }
    });

    */

};

