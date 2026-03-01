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
      style: 'https://demotiles.maplibre.org/style.json',
      center: [-66.90, 10.48],
      zoom: 13
    });

    const geolocate = new GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true 
        },
        trackUserLocation: false, // El punto se mueve, pero el mapa no persigue automáticamente
        showAccuracyCircle: false    
    });

    map.addControl(geolocate, 'top-left');
    map.addControl(new NavigationControl(), 'top-left');

    map.on('load', () => {
        geolocate.trigger(); 
    });

    geolocate.on('geolocate', (e: any) => {
        map.flyTo({
            center: [e.coords.longitude, e.coords.latitude],
            zoom: 15,
            speed: 1.5
        });
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
                'circle-color': ['case', ['get', 'revision_planta'], '#2e7d32', '#1976d2'],
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