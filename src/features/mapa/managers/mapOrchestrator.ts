// mapOrchestrator.ts
import { type Map as MapLibreMap } from 'maplibre-gl';
import { featureCollection, point } from '@turf/helpers';

import { obtenerRegistroSidebarData } from '../../../services/indexedbd/palmaQueries';
import { type SidebarData, type RespuestaGeoJsonSidebarData } from '../../../types';

import { inicializarMapa } from '../services/instanciarMapa';
import { configurarCapasBase as configurarInfraestructura } from '../services/capasVectorTilesMapa';
import { configurarUserLocation } from '../services/capaUserLocation';
import { configurarClusteresEnMapa } from '../services/capaClusteres'; // Tu archivo de clústeres
import { userGeoJSON } from '../services/instaciarSimbologiaUsuario';

export const datosGeoJsonSidebarData = async (): Promise<RespuestaGeoJsonSidebarData> => {
    try {
        const datos: SidebarData[] = await obtenerRegistroSidebarData();
        if (!datos || datos.length === 0) {
            return { data: featureCollection([]), message: "No hay datos", success: true };
        }
        const puntos = datos.map(punto => 
            point([punto.lng, punto.lat], { uuid: punto.uuid, revision_planta: punto.revision_planta })
        );
        return { data: featureCollection(puntos), message: "Datos cargados", success: true };
    } catch (error) {
        return { data: featureCollection([]), message: "Error en DB local", success: false };
    }
};

/**
 * Orquestador Secuencial Puro (Estilo SIG):
 * Devuelve el mapa montado, con infraestructura, localización y clústeres inyectados.
 */
export const iniciarServicioMapa = (
    contenedor: HTMLDivElement,
    onPointClick: (datos: SidebarData) => void
): Promise<MapLibreMap> => {
    return new Promise((resolve, reject) => {
        // 1. Instanciamos el Canvas nativo
        const map = inicializarMapa(contenedor);
        let mapaRemovido = false;

        map.on('load', async () => {
            console.log("Orquestador: Estilos base cargados. Iniciando pipeline SIG...");
            if (mapaRemovido) return;
            
            try {
                // 2. PARALELISMO CONTROLADO: Traemos los datos de IndexedDB mientras cargamos capas vectoriales
                const [respuestaDB] = await Promise.all([
                    datosGeoJsonSidebarData(),
                    configurarInfraestructura(map) // Asumiendo que es sincrónico o retorna promesa
                ]);

                if (mapaRemovido) return;

                // 3. Inyectamos la capa de localización del usuario (Pizarra estática inicial)
                configurarUserLocation(map, userGeoJSON);

                // 4. Inyectamos los clústeres de palmas de la DB local pasándole tu callback
                configurarClusteresEnMapa(map, respuestaDB, onPointClick);

                console.log("Orquestador: Pipeline completado. Mapa e infraestructura listos.");

                resolve(map);

            } catch (error) {
                console.error("Orquestador: Fallo en el pipeline de inicialización:", error);
                reject(error);
            }
        });

        map.on('remove', () => {
            mapaRemovido = true;
            console.log("Se desmonto el mapa del Orquestador");
        });
    });
};