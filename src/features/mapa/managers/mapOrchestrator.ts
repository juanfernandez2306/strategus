import { type Map as MapLibreMap } from 'maplibre-gl';
import { featureCollection, point } from '@turf/turf';

// Importaciones de Negocio / Tipos
import { obtenerRegistroSidebarData } from '../../../services/indexedbd/palmaQueries';
import { type SidebarData, type RespuestaGeoJsonSidebarData } from '../../../types';

// Importaciones de la Feature Mapa (Las piezas que creamos)
import { inicializarMapa } from '../services/instanciarMapa';
import { configurarCapasBase as configurarInfraestructura } from '../services/capasVectorTilesMapa';
import { configurarUserLocation } from '../services/capaUserLocation';
import { setupUserTracking } from './userLocationOrchestrator.ts';
import { configurarClusteresEnMapa } from '../services/capaClusteres.ts';

/**
 * Obtiene y transforma los datos de la DB local
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
 * Función principal que tu componente llamará en el useEffect
 */
export const iniciarServicioMapa = async (
    contenedor: HTMLDivElement,
    onPointClick: (datos: SidebarData) => void
): Promise<MapLibreMap> => {

    // 1. Instancia base
    const map = inicializarMapa(contenedor);

    // VARIABLE PARA LIMPIEZA ACCESIBLE DESDE EL INICIO
    let limpiarSensores: (() => void) | null = null;

    let mapaRemovido = false; // Bandera de seguridad

    // 2. Referencia única para el GeoJSON del usuario
    // Se pasa por referencia a los servicios para que todos hablen del mismo objeto
    const userGeoJSON = {
        type: 'FeatureCollection',
        features: [{
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [0, 0] },
            properties: { heading: 0, precision: 1 }
        }]
    };

    map.on('load', async () => {
        
        // Si el usuario ya cerró el mapa, no hagas nada más
        if (mapaRemovido) return;
        // A. Configurar Infraestructura (Tiles, Lotes, Palmas base)
        configurarInfraestructura(map);

        // B. Configurar Capa Visual del Usuario (Punto, Flecha, Halo)
        configurarUserLocation(map, userGeoJSON);

        // C. Encender Sensores (GPS + Brújula)
        // Guardamos el "detonador" de apagado
        limpiarSensores = setupUserTracking(map, userGeoJSON);

        // D. Cargar Capas Dinámicas (Datos de IndexedDB)
        const dbData = await datosGeoJsonSidebarData();
        // Aquí llamarías a tu función de clústeres si la tienes separada
        configurarClusteresEnMapa(map, dbData, onPointClick);

        
        
    });

    map.on('remove', () => {

        mapaRemovido = true; // Marcamos que el mapa ya no existe

        // E. Limpieza Automática
        if (limpiarSensores) {
            limpiarSensores();
            console.log("Orquestador: Sensores apagados por remoción de mapa.");
        }
    });

    return map;
};