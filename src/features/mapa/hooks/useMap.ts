import { useRef, useCallback } from 'react';
import { type Map as MapLibreMap } from 'maplibre-gl';
import { type SidebarData } from '../../../types/index.ts';

// Importamos el Orquestador y los servicios necesarios
import { iniciarServicioMapa, datosGeoJsonSidebarData as obtenerDatosLocalesGeoJson } from '../managers/mapOrchestrator';
import { configurarClusteresEnMapa } from '../services/capaClusteres.ts';

/**
 * Hook refinado: Actúa como puente entre la UI de React y el Orquestador del Mapa.
 */
export const useMapa = (onPointClick: (datos: SidebarData) => void) => {
    const mapRef = useRef<MapLibreMap | null>(null);
    


    /**
     * Llama al Orquestador para levantar todo el sistema de mapas.
     */
    const inicializarMapa = useCallback(async (contenedor: HTMLDivElement) => {

        if (mapRef.current) return;

        try {

            // El orquestador se encarga de: Instancia, Capas QGIS, Usuario, Sensores y Clústeres.
            const mapa = await iniciarServicioMapa(contenedor, onPointClick);
            mapRef.current = mapa;

            return mapa;

        } catch (error) {

            
            console.error(error);

        }
    }, [onPointClick]);

    /**
     * Refresca los puntos de la DB (Clústeres) sin recargar todo el mapa.
     * Útil cuando el usuario guarda cambios en el Sidebar.
     */
    const refrescarPunto = useCallback(async () => {
        if (!mapRef.current) return;

        const respuesta = await obtenerDatosLocalesGeoJson();
        configurarClusteresEnMapa(mapRef.current, respuesta, onPointClick);
    }, [onPointClick]);

    return { 
        inicializarMapa,
        refrescarPunto,  
        mapaInstancia: mapRef.current
    };
};