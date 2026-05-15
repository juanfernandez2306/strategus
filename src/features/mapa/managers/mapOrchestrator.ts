import { type Map as MapLibreMap } from 'maplibre-gl';
import { featureCollection, point } from '@turf/helpers';

// Importaciones de Negocio / Tipos
import { obtenerRegistroSidebarData } from '../../../services/indexedbd/palmaQueries';
import { type SidebarData, type RespuestaGeoJsonSidebarData } from '../../../types';

// Importaciones de la Feature Mapa (Las piezas que creamos)
import { inicializarMapa } from '../services/instanciarMapa';
import { configurarCapasBase as configurarInfraestructura } from '../services/capasVectorTilesMapa';
import { configurarUserLocation } from '../services/capaUserLocation';
import { userGeoJSON } from '../services/instaciarSimbologiaUsuario';

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
    contenedor: HTMLDivElement
): Promise<MapLibreMap> => {

    // 1. Instancia base
    const map = inicializarMapa(contenedor);

    // let unsubSensor: (() => void) | null = null;
    
    let mapaRemovido = false;


    map.on('load', async () => {

        console.log("Orquestador: Mapa cargado");

        
        if (mapaRemovido) return;

        // A. Configurar Infraestructura (Tiles, Lotes, Palmas base)
        configurarInfraestructura(map);

        configurarUserLocation(map, userGeoJSON);

    });

    map.on('remove', () => {

        mapaRemovido = true;

        console.log("Se desmonto el mapa");

    });

    return map;
};