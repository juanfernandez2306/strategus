import { 
    Map, GeolocateControl, NavigationControl 
} from 'maplibre-gl';
import { type Map as MapLibreMap } from 'maplibre-gl';
import { point, featureCollection } from '@turf/turf';
import { obtenerRegistroSidebarData } from '../services/almacenamientoDB';
import { 
    type SidebarData, 
    type RespuestaGeoJsonSidebarData 
} from '../services/tipos';

/**
 * Obtiene los datos de IndexedDB y los transforma a GeoJSON usando Turf.
 */
export const datosGeoJsonSidebarData = async (): Promise<RespuestaGeoJsonSidebarData> => {
    try {
        const datos: SidebarData[] = await obtenerRegistroSidebarData();

        if (!datos || datos.length === 0) {
            return {
                data: featureCollection([]),
                message: "No hay datos almacenados para mostrar",
                success: true
            };
        }

        const puntos = datos.map(punto => 
            point(
                [punto.lng, punto.lat], 
                { 
                    uuid: punto.uuid, 
                    revision_planta: punto.revision_planta 
                }
            )
        );

        return {
            data: featureCollection(puntos),
            message: "Datos cargados correctamente",
            success: true
        };

    } catch (error) {
        return {
            data: featureCollection([]),
            message: "Error crítico al leer la base de datos local",
            success: false
        };
    }
};

/**
 * Crea e inicializa la instancia del mapa con controles de geolocalización.
 */

export const crearInstanciaMapa = (contenedor: HTMLDivElement): MapLibreMap => {
    const map = new Map({
        container: contenedor,
        style: {
            version: 8,
            sources: {},
            layers: [
                {
                    id: 'fondo-blanco',
                    type: 'background',
                    paint: {
                        'background-color': '#FFFCFB' // Color blanco
                    }
                }
            ]
        },
        center: [-72.70189279, 9.86245725],
        zoom: 14
    });

    // Definimos el control de geolocalización
    const geolocate = new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        showUserLocation: true,
        trackUserLocation: true,
        showAccuracyCircle: false    
    });

    // Agregamos controles
    map.addControl(geolocate, 'top-left');
    map.addControl(new NavigationControl(), 'top-left');

    const onFirstGeolocate = (e: any) => {
        const { longitude, latitude } = e.coords;

        map.flyTo({
            center: [longitude, latitude],
            zoom: 17,
            speed: 1.2,
            essential: true
        });

        // 3. IMPORTANTE: Apagamos el evento después de la primera vez
        geolocate.off('geolocate', onFirstGeolocate);
    };

    geolocate.on('geolocate', onFirstGeolocate);

    map.on('load', () => {

        map.addSource('finca-danubio-source', {
            type: 'vector',
            tiles: [`${window.location.origin}/pwa/tiles/{z}/{x}/{y}.pbf`],
            minzoom: 0,
            maxzoom: 14,
            bounds: [-72.706, 9.851, -72.697, 9.874]
        });


        // Capa de Polígonos (Lotes)
        map.addLayer({
            'id': 'lotes-danubio',
            'type': 'fill',
            'source': 'finca-danubio-source',
            'source-layer': 'plg_lotes_danubio_feb_2026_web_mercator',
            'paint': {
                'fill-color': [
                    'concat', 
                    'rgb(', 
                    ['get', 'color'], 
                    ')'
                ],
                'fill-opacity': 1,
                'fill-outline-color': '#ffffff'
            }
        });

        // 2. CAPA DE PUNTOS (15,000 PALMAS)
        map.addLayer({
            'id': 'palmas-puntos',
            'type': 'circle',
            'source': 'finca-danubio-source',
            'source-layer': 'pts_palmas_danubio_feb_2026_web_mercator',
            'paint': {
                'circle-radius': [
                    'interpolate', ['linear'], ['zoom'],
                    8, 0.5, // Muy pequeños lejos
                    14, 5    // Más visibles de cerca
                ],
                'circle-color': '#313647',
                'circle-stroke-width': 1,
                'circle-stroke-color': '#ffffff'
            }
        });

        // 3. Disparar automáticamente cuando el mapa esté listo
        setTimeout(() => {
            geolocate.trigger();
        }, 500);

    });

    map.on('dragstart', () => {

        if (geolocate.options.trackUserLocation) {
            geolocate.trigger(); 
        }
    });

    return map;
};

/**
 * Configura los clústeres y maneja los eventos de click.
 * Se corrigió la duplicación de LAYER_ID.
 */
export const configurarClusteresEnMapa = (
    mapa: MapLibreMap, 
    respuesta: RespuestaGeoJsonSidebarData,
    onPointClick: (datos: SidebarData) => void
) => {
    if (!respuesta.success || !respuesta.data) return;

    const SOURCE_ID = 'puntos-source';
    const LAYER_ID = 'unclustered-point';

    if (!mapa.getSource(SOURCE_ID)) {
        // 1. Agregar Fuente de Datos
        mapa.addSource(SOURCE_ID, {
            type: 'geojson',
            data: respuesta.data,
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
        });

        // 2. Capa de Clústeres
        mapa.addLayer({
            id: 'clusters',
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
                'circle-radius': [
                    'step', ['get', 'point_count'],
                    20, 100,
                    30, 750,
                    40
                ]
            }
        });

        // 3. Capa de Conteo de Clústeres
        mapa.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: SOURCE_ID,
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
                'text-size': 12
            }
        });

        // 4. Capa de Puntos Individuales (Definida una sola vez)
        mapa.addLayer({
            id: LAYER_ID,
            type: 'circle',
            source: SOURCE_ID,
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': ['case', ['get', 'revision_planta'], '#386641', '#DD0303'],
                'circle-radius': 8,
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

        // --- EVENTOS DE INTERACCIÓN ---

        // Click en clúster para expandir
        mapa.on('click', 'clusters', (e) => {
            const features = mapa.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            const clusterId = features[0].properties.cluster_id;
            const source = mapa.getSource(SOURCE_ID) as any;
            
            source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
                if (err) return;
                mapa.easeTo({
                    center: (features[0].geometry as any).coordinates,
                    zoom: zoom
                });
            });
        });

        // Click en punto individual (Opción B: extracción de coordenadas)
        mapa.on('click', LAYER_ID, (e) => {
            if (e.features && e.features.length > 0) {
                const feature = e.features[0];
                const coordenadas = (feature.geometry as any).coordinates;

                const datosCompletos: SidebarData = {
                    uuid: feature.properties?.uuid,
                    revision_planta: feature.properties?.revision_planta,
                    lng: coordenadas[0],
                    lat: coordenadas[1]
                };

                onPointClick(datosCompletos);
            }
        });

        // Gestión de cursores
        const capasInteractivas = ['clusters', LAYER_ID];
        capasInteractivas.forEach(layer => {
            mapa.on('mouseenter', layer, () => mapa.getCanvas().style.cursor = 'pointer');
            mapa.on('mouseleave', layer, () => mapa.getCanvas().style.cursor = '');
        });

    } else {
        // Actualización de datos si la fuente ya existe
        (mapa.getSource(SOURCE_ID) as any).setData(respuesta.data);
    }
};