import { Map, NavigationControl } from 'maplibre-gl';
import { type Map as MapLibreMap } from 'maplibre-gl';
import { point, featureCollection } from '@turf/turf';
import { obtenerRegistroSidebarData } from './servicioAlmacenamientoDB';
import { 
    type SidebarData, 
    type RespuestaGeoJsonSidebarData 
} from './servicioTipos';
import { configurarCapasBase } from './servicioCapasMapa';
import { iniciarSeguimientoGPS } from './servicioGeolocalizacion';
import { navService } from './servicioNavegacionBrujula';
import { watchOrientacionRaw } from './servicioGeolocalizacion';

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

export const crearInstanciaMapa = (
    contenedor: HTMLDivElement
): MapLibreMap => {

    let mapaListo = false;
    let alphaHeading = 0;

    // 1. Guardamos las referencias de limpieza en el scope del mapa
    let watchGpsId: number | null = null;
    let desactivaOrientacion: (() => void) | null = null;

    // 1. Definir el objeto inicial para la posición del usuario
    const userLocationGeoJSON = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { heading: 0 }
        }]
    };

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
        zoom: 14,
        minZoom: 12,
        maxZoom: 20
    });

    map.addControl(new NavigationControl({
        showCompass: true, // Muestra la brújula para resetear el Norte
        showZoom: true     // Botones + y -
    }), 'top-left');

    let esPrimerVuelo = true;

    const actualizarFuenteUsuario = (coords?: [number, number]) => {
        if (!mapaListo) return;
        const source = map.getSource('user-pos-source') as any;
        if (!source) return;

        if (coords) userLocationGeoJSON.features[0].geometry.coordinates = coords;
        userLocationGeoJSON.features[0].properties.heading = alphaHeading;

        source.setData(userLocationGeoJSON);


        if (esPrimerVuelo) {
            map.flyTo({
                center: coords,
                zoom: 18,
                speed: 1.2,
                essential: true
            });
            
            // IMPORTANTE: Bloqueamos futuros saltos de cámara
            esPrimerVuelo = false; 
            console.log("Primer centrado de cámara completado.");

        }

    };

    


    map.on('load', () => {

        mapaListo = true;

        // 2. Ejecutar la carga de capas cuando el estilo base esté listo
        configurarCapasBase(map, userLocationGeoJSON);

        watchGpsId = iniciarSeguimientoGPS(
            (pos) => actualizarFuenteUsuario([pos.longitud, pos.latitud]),
            (err) => console.error(err)
        );

        desactivaOrientacion = watchOrientacionRaw((raw) => {
            alphaHeading = navService.procesarHeading(raw);
            actualizarFuenteUsuario();
        });

    })

    map.on('remove', () => {
        // Detener GPS
        if (watchGpsId !== null) {
            navigator.geolocation.clearWatch(watchGpsId);
            console.log("GPS desactivado");
        }

        // Detener Orientación
        if (desactivaOrientacion) {
            desactivaOrientacion();
            console.log("Sensor de orientación desactivado");
        }
        
        mapaListo = false;

    })

    return map;
}