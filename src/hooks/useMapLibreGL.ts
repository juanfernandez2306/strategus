import { useEffect } from 'react';
import { useRef, useCallback } from 'react';
import { type Map as MapLibreMap } from 'maplibre-gl';
import { 
    crearInstanciaMapa, 
    datosGeoJsonSidebarData, 
    configurarClusteresEnMapa 
} from '../services/crearMapLibreGL';
import { type SidebarData } from '../services/servicioTipos';

/**
 * Hook para gestionar la lógica del mapa MapLibre y su interacción con IndexedDB.
 * @param onPointClick Función callback que se ejecuta al hacer click en un punto.
 */
export const useMapaLibreGLService = (onPointClick: (datos: SidebarData) => void) => {
    // Referencia persistente para la instancia del mapa
    const mapRef = useRef<MapLibreMap | null>(null);

    useEffect(() => {
        return () => {
          mapRef.current?.remove();
          mapRef.current = null;
        };
      }, []);

    /**
     * Inicializa el mapa en el contenedor proporcionado y carga los datos iniciales.
     */
    const inicializarMapa = useCallback(async (contenedor: HTMLDivElement) => {
        if (mapRef.current) return; // Evita inicializar más de una vez

        // 1. Crear la instancia base del mapa
        const mapa = crearInstanciaMapa(contenedor);
        mapRef.current = mapa;

        // 2. Esperar a que el estilo cargue antes de añadir capas/fuentes
        mapa.on('load', async () => {
            // 3. Obtener GeoJSON desde IndexedDB
            const respuesta = await datosGeoJsonSidebarData();
            
            // 4. Configurar clústeres, capas y eventos de click
            configurarClusteresEnMapa(mapa, respuesta, onPointClick);
        });
    }, [onPointClick]);

    /**
     * Consulta nuevamente la base de datos y actualiza los puntos en el mapa.
     * Útil después de actualizar 'revision_planta' en el Sidebar.
     */
    const refrescarPunto = useCallback(async () => {
        if (!mapRef.current) return;

        // Obtener datos actualizados
        const respuesta = await datosGeoJsonSidebarData();

        // Actualizar la fuente de datos existente en el mapa
        configurarClusteresEnMapa(mapRef.current, respuesta, onPointClick);
    }, [onPointClick]);

    return {
        inicializarMapa,
        refrescarPunto,
        mapaInstancia: mapRef.current // Opcional, por si se necesita acceso directo
    };
};