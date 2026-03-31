import { Map, NavigationControl } from 'maplibre-gl';
import { type Map as MapLibreMap } from 'maplibre-gl';
import { point, featureCollection } from '@turf/turf';
import { obtenerRegistroSidebarData } from './indexedbd/palmaQueries'; 
import { 
    type SidebarData, 
    type RespuestaGeoJsonSidebarData 
} from '../types';
import { configurarCapasBase } from '../features/mapa/services/capasVectorTilesMapa.ts';
import { iniciarSeguimiento, detenerSeguimiento } from './sensors/gps/engine';
import { validarPuntoEnArea } from './sensors/gps/utils';
import { navService } from './servicioNavegacionBrujula';
import { watchOrientacionRaw } from './sensors/brujula/engine.ts';
import { CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO } from '../data/finca/limites';

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

// --- ESTADO GLOBAL DEL MÓDULO (Fuera de las funciones) ---
let ultimaPosicionGps: { 
    latitude: number, 
    longitude: number, 
    accuracy: number } | null = null;

// <--- Almacenamos el valor bruto del angulo del sensor
let ultimoHeadingRaw: number = 0;

// Esta función es el "Mensajero"
const notificarSincronizacion = () => {
    // Si no hay posición, no mandamos nada (evita errores en el sidebar)
    if (!ultimaPosicionGps) return;
    
    window.dispatchEvent(new CustomEvent('heading-update', {
        detail: {
            headingRaw: ultimoHeadingRaw,
            datosGps: { 
                lat: ultimaPosicionGps.latitude, 
                lng: ultimaPosicionGps.longitude 
            }
        }
    }));
};

// Exportación válida en el nivel superior
export const obtenerUltimaPosicion = () => ultimaPosicionGps;

// <--- Exportamos el bruto de la orientacion del sensor
export const obtenerUltimoHeadingRaw = () => ultimoHeadingRaw;

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
            properties: { heading: 0, precision: 21 }
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

    const actualizarFuenteUsuario = (pos?: { 
        latitude: number, 
        longitude: number, 
        accuracy: number 
    }) => {

        if (!pos) return

        // 1. Si hay nueva posición GPS, validamos el área
        const estaDentro = validarPuntoEnArea(
            pos.latitude, 
            pos.latitude, 
            CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO
        );

        // Si está fuera, abortamos: no actualizamos posición ni centramos
        if (!estaDentro) {
            console.warn("Usuario fuera del área permitida. Actualización bloqueada.");
            return
        }

        ultimaPosicionGps = { 
            longitude: pos.longitude, 
            latitude: pos.latitude, 
            accuracy: pos.accuracy 
        };

        
        if (!mapaListo || !ultimaPosicionGps) return;

        /*
        const estaDentroAhora = validarPuntoEnArea(
            ultimaPosicionGps.lng,
            ultimaPosicionGps.lat,
            CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO
        );

        // Si está fuera, no actualizamos la fuente (icono) ni hacemos flyTo
        if (!estaDentroAhora) return;
        */

        const source = map.getSource('user-pos-source') as any;
        if (!source) return;

        // 2. Si viene una posición nueva, actualizamos la global. 
        // Si no viene (caso de la orientación), usamos la que ya teníamos.
        

        // Si no tenemos ninguna posición aún, no podemos dibujar nada
        if (!ultimaPosicionGps) return;

        const coords: [number, number] = [ultimaPosicionGps.longitude, ultimaPosicionGps.latitude];

        const precisionActual = ultimaPosicionGps.accuracy;

        // Actualizamos el GeoJSON para el mapa
        userLocationGeoJSON.features[0].geometry.coordinates = coords;
        userLocationGeoJSON.features[0].properties.heading = alphaHeading;
        userLocationGeoJSON.features[0].properties.precision = precisionActual;

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
        configurarCapasBase(map);

        watchGpsId = iniciarSeguimiento(
            (pos: GeolocationPosition) => {
                // 1. Guardamos posición
                const { latitude, longitude, accuracy } = pos.coords;

                ultimaPosicionGps = { longitude: longitude, latitude: latitude, accuracy: accuracy };
                
                // 2. Movemos punto azul
                actualizarFuenteUsuario(ultimaPosicionGps);
                // 3. Avisamos al sidebar (si está escuchando)
                notificarSincronizacion();

            },
            (err) => console.error(err)
        );

        console.log("Cargando sensores...");

        desactivaOrientacion = watchOrientacionRaw((raw) => {
            // 1. Guardamos el valor bruto para la brújula del Sidebar
            
            ultimoHeadingRaw = raw;

            alphaHeading = navService.procesarHeading(raw);

            notificarSincronizacion();
            // 3. Movemos triángulo azul
            actualizarFuenteUsuario();
            
        });

    })

    map.on('remove', () => {
        // Detener GPS
        if (watchGpsId !== null) {
            detenerSeguimiento(watchGpsId);
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