import { type Map as MapLibreMap } from 'maplibre-gl';

export const configurarUserLocation = (map: MapLibreMap, initialGeoJSON: any) => {

    map.addSource('user-pos-source', {
        type: 'geojson',
        data: initialGeoJSON
    });
    
    map.addLayer({
            id: 'user-heading-arrow',
            type: 'symbol',
            source: 'user-pos-source',
            layout: {
                'text-field': '▲',
                'text-size': 15,
                // Sumamos 180 para invertir la dirección si fuera necesario
                'text-rotate': ['coalesce', ['get', 'heading'], 0], 
                'text-rotation-alignment': 'map',
                'text-allow-overlap': true,
                'text-ignore-placement': true,
                'text-offset': [0, -1] // Lo alejamos un poco del centro para que parezca un faro
            },
            paint: {
                //'text-color': '#007cff',
                'text-color': [
                    'case',
                    ['get', 'esPreciso'],
                    '#007cff', // Azul si la precisión es buena (< 20m)
                    '#9e9e9e'  // Gris si la precisión es mala (> 20m)
                ],
                'text-halo-color': '#FBF6F6',
                'text-halo-width': 3,
                'text-opacity': [
                        'case',
                        ['==', ['typeof', ['get', 'heading']], 'number'], 
                        1.0,
                        0.0  
                    ],
                'text-halo-blur': 1.5
            }
        });
    
        map.addLayer({
            id: 'user-halo',
            type: 'circle',
            source: 'user-pos-source',
            paint: {
                'circle-radius': 24,
                'circle-color': [
                    'case',
                    ['get', 'esPreciso'],
                    '#007cff', // Color base (buena precisión)
                    '#9e9e9e'  // Color si supera el umbral
                ],
                'circle-opacity': 0.3,
                'circle-blur': 0.8 // Suaviza los bordes (low-pass filter visual)
            }
        });
    
        map.addLayer({
            id: 'user-dot',
            type: 'circle',
            source: 'user-pos-source',
            paint: {
                'circle-radius': 8,
                'circle-color': [
                    'case',
                    ['get', 'esPreciso'],
                    '#007cff', // Color base (buena precisión)
                    '#9e9e9e'  // Color si supera el umbral
                ],
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

}