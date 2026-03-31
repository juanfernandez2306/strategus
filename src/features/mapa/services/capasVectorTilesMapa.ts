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
            'circle-color': '#313647',
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
    });

};

