import { useEffect, useState, useRef, useCallback } from 'react';
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
    const [mensajeError, setMensajeError] = useState<string | null>(null);

    // Tu "filtro de ruido" persistente
    const ultimoMensajeRef = useRef<string | null>(null);


    // 1. Escuchar eventos globales de error (emitidos por el UserLocationManager)
    useEffect(() => {
        const manejarGpsUpdate = (e: any) => {
            // Si el evento es 'heading-update', el mensaje es null (Todo OK)
            // Si el evento es 'gps-error', viene el string con los errores unidos
            const mensajeActual = e.detail?.mensaje || null;

            if (mensajeActual !== ultimoMensajeRef.current) {
                ultimoMensajeRef.current = mensajeActual;
                setMensajeError(mensajeActual);

                if (mensajeActual) {
                    console.warn(`ESTADO CRÍTICO: ${mensajeActual}`);
                } else {
                    console.log("Sistema operativo: Posición y precisión OK.");
                }
            }
        };

        window.addEventListener('gps-error', manejarGpsUpdate);
        window.addEventListener('heading-update', manejarGpsUpdate);

        return () => {
            window.removeEventListener('gps-error', manejarGpsUpdate);
            window.removeEventListener('heading-update', manejarGpsUpdate);
        };
    }, []);

    /**
     * Llama al Orquestador para levantar todo el sistema de mapas.
     */
    const inicializarMapa = useCallback(async (contenedor: HTMLDivElement) => {

        if (mapRef.current) return;

        try {

            // El orquestador se encarga de: Instancia, Capas QGIS, Usuario, Sensores y Clústeres.
            const mapa = await iniciarServicioMapa(contenedor, onPointClick);
            mapRef.current = mapa;

        } catch (error) {

            setMensajeError("Error crítico al iniciar el mapa.");
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
        mapaInstancia: mapRef.current,
        mensajeError
    };
};