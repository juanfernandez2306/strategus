import { useEffect } from 'react';
import { useSensorStore } from './useSensorStore';
import { updateUserVisuals } from '../services/instaciarSimbologiaUsuario';
import { type Map as MapLibreMap } from 'maplibre-gl';

// useMapUserUpdate.ts
export const useMapUserUpdate = (
    mapInstance: MapLibreMap | null, 
    sistemaListo: boolean,
    mensajeError: string | null // <-- Pasamos el mensaje de error aquí
) => {
    const { lat, lng, accuracy, headingRaw } = useSensorStore();

    useEffect(() => {
        // 1. Validación de seguridad: Si no hay mapa o el estilo está roto, abortar.
        if (!mapInstance) return;
        
        try {
            // Verificación profunda de MapLibre
            if (!mapInstance.getStyle() || !mapInstance.isStyleLoaded()) {
                return; 
            }

            // 2. Condición de visibilidad: 
            // Mostramos SOLO si el sistema está listo Y no hay mensajes de error críticos
            const mostrarSimbolo = sistemaListo && !mensajeError && lat !== 0;
            const visibility = mostrarSimbolo ? 'visible' : 'none';
            
            const layers = ['user-heading-arrow', 'user-halo', 'user-dot'];
            
            layers.forEach(layerId => {
                if (mapInstance.getLayer(layerId)) {
                    mapInstance.setLayoutProperty(layerId, 'visibility', visibility);
                } else {
                    console.warn(`[Hook] Capa no encontrada: ${layerId}`);
                }
            });

            // 3. Si todo está ok, actualizamos posición
            if (mostrarSimbolo) {
                updateUserVisuals(mapInstance, lng, lat, accuracy, headingRaw);
            }

        } catch (err) {
            // Captura el error "There is no style added to the map" de tus logs
            console.log("Esperando estabilidad del mapa...");
        }

    }, [mapInstance, lat, lng, accuracy, headingRaw, sistemaListo, mensajeError]);
};