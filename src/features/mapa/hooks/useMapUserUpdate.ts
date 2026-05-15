import { useEffect } from 'react';
import { type Map as MapLibreMap } from 'maplibre-gl';

/**
 * Hook que sincroniza los eventos de hardware con la visualización del mapa
 * sin provocar re-renders en el componente principal.
 */
export const useMapSensorSync = (
    mapInstance: MapLibreMap | null,
    sistemaListo: boolean
) => {
    useEffect(() => {

        

        if (!mapInstance || !sistemaListo) return;

        console.log("map instance listo y sistema listo");

        // Referencias locales para mantener el último estado conocido
        let lastLat = 0;
        let lastLng = 0;
        let lastAccuracy = 999;
        let lastHeading = 0;

        const handleGpsUpdate = (e: any) => {
            const { lat, lng, accuracy } = e.detail;
            lastLat = lat;
            lastLng = lng;
            lastAccuracy = accuracy;

            console.log("enviando datos", lastLat, lastLng, lastAccuracy)
            
           
        };

        const handleHeadingUpdate = (e: any) => {
            const { heading } = e.detail;
            lastHeading = heading;
            
            // Si ya tenemos una posición, actualizamos el rumbo
            
        };

        
        window.addEventListener('sensorUpdateGPS' as any, handleGpsUpdate);
        window.addEventListener('sensorUpdateHeading' as any, handleHeadingUpdate);

        return () => {
            window.removeEventListener('sensorUpdateGPS' as any, handleGpsUpdate);
            window.removeEventListener('sensorUpdateHeading' as any, handleHeadingUpdate);
        };

    }, [mapInstance, sistemaListo]);
};