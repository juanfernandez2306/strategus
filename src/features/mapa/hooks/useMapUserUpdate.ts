import { useEffect } from 'react';
import { useSensorStore } from './useSensorStore';
import { updateUserVisuals } from '../services/instaciarSimbologiaUsuario';
import { type Map as MapLibreMap } from 'maplibre-gl';

export const useMapUserUpdate = (
    mapInstance: MapLibreMap | null, 
    sistemaListo: boolean
) => {
    
    const lat = useSensorStore(s => s.lat);
    const lng = useSensorStore(s => s.lng);
    const accuracy = useSensorStore(s => s.accuracy);
    const headingRaw = useSensorStore(s => s.headingRaw);

    useEffect(() => {

        if (!mapInstance || !mapInstance.getStyle()) return;

        // Control de visibilidad atómico
        const visibility = sistemaListo ? 'visible' : 'none';
        
        // Lista de capas que conforman la simbología del usuario
        const layers = ['user-pos-layer', 'user-arrow-layer', 'user-halo-layer'];
        
        layers.forEach(layerId => {

            if (mapInstance.getLayer(layerId)) {
                mapInstance.setLayoutProperty(layerId, 'visibility', visibility);
            }

        });

        
        if (sistemaListo) {

            updateUserVisuals(mapInstance, lng, lat, accuracy, headingRaw);
        }

    }, [mapInstance, lat, lng, accuracy, headingRaw, sistemaListo]);
};