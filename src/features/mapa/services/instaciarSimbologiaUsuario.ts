import { type Map as MapLibreMap, type GeoJSONSource } from 'maplibre-gl';
import { ServicioNavegacion } from '../sensor/navegacion/ServicioNavegacion';
import { useRef } from 'react';

export const userGeoJSON = {
    type: 'FeatureCollection' as const,
    features: [{
        type: 'Feature' as const,
        geometry: { 
            type: 'Point' as const, 
            coordinates: [0, 0] as [number, number] 
        },
        properties: { 
            // Forzamos el tipo unión aquí
            heading: null as number | null, 
            esPreciso: false 
        }
    }]
};


export const updateUserVisuals = (
    map: MapLibreMap, 
    lng: number, 
    lat: number, 
    esPrecisoGPS: boolean, 
    headingRaw: number | null
) => {

    const haRealizadoPrimerVuelo = useRef(false);

    const source = map.getSource('user-pos-source') as GeoJSONSource;

    if (!map || typeof map.getStyle !== 'function' || !map.getStyle()) {
        return; 
    }

    if (!source || (lng === 0 && lat === 0)) return;

    const servicioNavegacion = new ServicioNavegacion();

    const headingParaMapa = (headingRaw !== null) 
        ? servicioNavegacion.procesarHeading(headingRaw)
        : 9999;

    userGeoJSON.features[0].geometry.coordinates = [lng, lat];
    userGeoJSON.features[0].properties.esPreciso = esPrecisoGPS;
    userGeoJSON.features[0].properties.heading = headingParaMapa; 
    source.setData(userGeoJSON);

    if (!haRealizadoPrimerVuelo.current && lng !== 0 ) { 
        map.flyTo({
            center: [lng, lat],
            zoom: 18,
            speed: 1.2,
            essential: true
        });
        
        haRealizadoPrimerVuelo.current =  true;

        console.log("Primer centrado de cámara completado.");
    }

}

