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
        positionOptions: { 
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
         },
        showUserLocation: false,
        trackUserLocation: false,
        showAccuracyCircle: false    
    });

    // Agregamos controles
    map.addControl(geolocate, 'top-left');
    map.addControl(new NavigationControl(), 'top-left');

    const userLocationGeoJSON: any = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { heading: 0 }
        }]
    };

    const onFirstGeolocate = (e: any) => {
        
        const { longitude, latitude } = e.coords;

        map.flyTo({
            center: [longitude, latitude],
            zoom: 17,
            speed: 1.2,
            essential: true
        });


        // Opcional: remover el listener de todas formas (buena práctica)
        geolocate.off('geolocate', onFirstGeolocate);
    };

    geolocate.on('geolocate', onFirstGeolocate);

    let alphaHeading = 0;
    const suavizado = 0.2;
    let ultimaCoordenada = [0, 0]
    let mapaListo = false;

    const actualizarCapaUsuario = (lngLat?: [number, number]) => {
        if (!mapaListo || !map || !map.getSource('user-pos-source')) return;

        if (lngLat) ultimaCoordenada = lngLat;
        
        // Prioridad: 1. Heading del GPS (si te mueves), 2. Brújula Alpha (si estás quieto)

        userLocationGeoJSON.features[0].geometry.coordinates = ultimaCoordenada;
        userLocationGeoJSON.features[0].properties.heading = alphaHeading;

        const source = map.getSource('user-pos-source') as any;
        if (source) {
            source.setData(userLocationGeoJSON);
        }
    };

    if (typeof window !== 'undefined') {
        // Escuchamos ambos eventos para asegurar compatibilidad con PC y Móvil
        const handleOrientation = (e: any) => {
            // Prioridad: 1. Brújula iOS, 2. Valor absoluto (Android/PC), 3. Valor relativo
            let directo = e.webkitCompassHeading || e.alpha;
            
            // En algunas emulaciones de PC, el alpha es relativo al inicio.
            // Si usas el simulador de Chrome, este valor debería cambiar al mover 'Alpha'
            if (directo !== undefined && directo !== null) {
                let diff = directo - alphaHeading;
                if (diff > 180) diff -= 360;
                if (diff < -180) diff += 360;
                alphaHeading += suavizado * diff;

                // IMPORTANTE: Para que se mueva en PC sin GPS, 
                // asegúrate de que ultimaCoordenada tenga el valor del centro del mapa inicialmente
                if (mapaListo) {
                    actualizarCapaUsuario(); 
                }
            }
        };

        window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        // Si el 'absolute' no existe en esa PC, intentamos el normal
        window.addEventListener('deviceorientation', handleOrientation, true);
    }

    const onGeolocateUpdate = (e: any) => {
        const { longitude, latitude } = e.coords;

        actualizarCapaUsuario([longitude, latitude])
    }

    geolocate.on('geolocate', onGeolocateUpdate);

    map.on('load', () => {

        map.addSource('finca-danubio-source', {
            type: 'vector',
            tiles: [`${window.location.origin}/pwa/tiles/{z}/{x}/{y}.pbf`],
            minzoom: 0,
            maxzoom: 14,
            bounds: [-72.706, 9.851, -72.697, 9.874]
        });

        map.addSource('user-pos-source', {
            type: 'geojson',
            data: userLocationGeoJSON
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

        

        // 3. INDICADOR DE DIRECCIÓN (Usando texto en lugar de imagen)
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
                'text-color': '#007cff',
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
                'circle-color': '#007cff',
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
                'circle-color': '#007cff',
                'circle-stroke-width': 2,
                'circle-stroke-color': '#fff'
            }
        });

        mapaListo = true;

        // 3. Disparar automáticamente cuando el mapa esté listo
        setTimeout(() => {
            geolocate.trigger();
        }, 500);

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