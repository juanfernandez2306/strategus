import { type Map as MapLibreMap } from 'maplibre-gl';
import { CONFIG_MAPA } from './servicioTipos';
import { type SidebarData, type RespuestaGeoJsonSidebarData } from './servicioTipos';

export const configurarCapasBase = (map: MapLibreMap, userGeoJSON: any) => {
    
    // 1. Fuente de Vector Tiles (Configurada según QGIS)
    map.addSource('finca-danubio-source', {
        type: 'vector',
        tiles: [CONFIG_MAPA.TILES_URL],
        minzoom: CONFIG_MAPA.ZOOM_MIN,
        maxzoom: CONFIG_MAPA.ZOOM_MAX,
        bounds: CONFIG_MAPA.BOUNDS
    });

    map.addSource('user-pos-source', {
        type: 'geojson',
        data: userGeoJSON
    });

    // 2. Capa de Lotes (Polígonos)
    map.addLayer({
        'id': 'lotes-danubio-fill',
        'type': 'fill',
        'source': 'finca-danubio-source',
        'source-layer': CONFIG_MAPA.LAYER_NAME_LOTES, // <--- Nombre dinámico
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
        'source-layer': CONFIG_MAPA.LAYER_NAME_PALMAS,
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

    map.addLayer({
        id: 'user-heading-arrow',
        type: 'symbol',
        source: 'user-pos-source',
        layout: {
            'text-field': '▼', // Usamos el triángulo hacia abajo para invertir la posición
            'text-size': 15,
            // Sumamos 180 para invertir la dirección si fuera necesario
            'text-rotate': ['+', ['get', 'heading'], 180], 
            'text-rotation-alignment': 'map',
            'text-allow-overlap': true,
            'text-ignore-placement': true,
            'text-offset': [0, 1] // Lo alejamos un poco del centro para que parezca un faro
        },
        paint: {
            //'text-color': '#007cff',
            'text-color': [
                'step',
                ['get', 'precision'],
                '#007cff', // Azul si la precisión es buena (< 20m)
                20,        // Umbral de precisión
                '#9e9e9e'  // Gris si la precisión es mala (> 20m)
            ],
            'text-halo-color': '#FBF6F6',
            'text-halo-width': 3,
            'text-opacity': 1.0,
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
                'step',
                ['get', 'precision'],
                '#007cff', // Color base (buena precisión)
                20,        // Umbral
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
                'step',
                ['get', 'precision'],
                '#007cff', // Color base (buena precisión)
                20,        // Umbral
                '#9e9e9e'  // Color si supera el umbral
            ],
            //'circle-color': '#007cff',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });

};

export const configurarClusteresEnMapa = (
    map: MapLibreMap, 
    respuesta: RespuestaGeoJsonSidebarData,
    onPointClick: (datos: SidebarData) => void
) => {
    if (!respuesta.success || !respuesta.data) return;

    const SOURCE_ID = 'puntos-source';
    const LAYER_ID = 'unclustered-point';
    const CLUSTER_LAYER = 'clusters';
    const COUNT_LAYER = 'cluster-count';

    // 1. GESTIÓN DE LA FUENTE (Source)
    const sourceExistente = map.getSource(SOURCE_ID) as any;
    if (sourceExistente) {
        sourceExistente.setData(respuesta.data);
        return;
    }

    map.addSource(SOURCE_ID, {
        type: 'geojson',
        data: respuesta.data,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
    });

    // 2. CAPA DE CLÚSTERES (Círculos de agrupación)
    map.addLayer({
        id: CLUSTER_LAYER,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        paint: {
            'circle-color': [
                'step', ['get', 'point_count'],
                '#51bbd6', 100,
                '#f1f075', 750,
                '#f28cb1'
            ],
            'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
        }
    });

    // 3. CAPA DE CONTEO (Números sobre el clúster)
    map.addLayer({
        id: COUNT_LAYER,
        type: 'symbol',
        source: SOURCE_ID,
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-size': 12
        }
    });

    // 4. CAPA DE PUNTOS INDIVIDUALES (Estado de revisión)
    map.addLayer({
        id: LAYER_ID,
        type: 'circle',
        source: SOURCE_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
            // Verde si está revisada, Rojo si no
            'circle-color': ['case', ['get', 'revision_planta'], '#06D001', '#DD0303'],
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
        }
    });

    // --- EVENTOS DE INTERACCIÓN ---

    // Zoom al hacer click en clúster
    map.on('click', CLUSTER_LAYER, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER] });
        const clusterId = features[0].properties.cluster_id;
        const source = map.getSource(SOURCE_ID) as any;
        
        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
            if (err) return;
            map.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom
            });
        });
    });

    // Click en una palma específica (Inyecta datos al callback)
    map.on('click', LAYER_ID, (e) => {
        if (e.features && e.features.length > 0) {
            const f = e.features[0];
            const coords = (f.geometry as any).coordinates;

            onPointClick({
                uuid: f.properties?.uuid,
                revision_planta: f.properties?.revision_planta,
                lng: coords[0],
                lat: coords[1]
            });
        }
    });

    // Gestión de cursores pointer
    [CLUSTER_LAYER, LAYER_ID].forEach(layer => {
        map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
    });
};