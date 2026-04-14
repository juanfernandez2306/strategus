import { type Map as MapLibreMap } from 'maplibre-gl';
import { INFO_FINCA } from '../../../data/finca/info';


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

    // 2. Capa de Lotes (Polígonos)
    map.addLayer({
        'id': 'lotes-danubio-fill',
        'type': 'fill',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas.lotes, // <--- Nombre dinámico
        'paint': {
            'fill-color': ['concat', 'rgb(', ['get', 'color'], ')'],
            'fill-opacity': 1,
            'fill-outline-color': '#ffffff'
        }
    });

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

    

};

