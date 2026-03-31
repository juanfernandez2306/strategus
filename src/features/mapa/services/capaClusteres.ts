import { type Map as MapLibreMap } from 'maplibre-gl';
import { type SidebarData, type RespuestaGeoJsonSidebarData } from '../../../types';

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