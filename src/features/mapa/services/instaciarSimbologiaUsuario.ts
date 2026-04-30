import { type Map as MapLibreMap, type GeoJSONSource } from 'maplibre-gl';
import { navService } from '../../../services/sensors/brujula/navigation.ts';

let haRealizadoPrimerVuelo = false;

export const userGeoJSON = {
    type: 'FeatureCollection' as const,
    features: [{
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [0, 0] },
        properties: { heading: 0, precision: 1 }
    }]
};


export const updateUserVisuals = (
    map: MapLibreMap, 
    lng: number, 
    lat: number, 
    accuracy: number, 
    headingRaw: number | null
) => {


    const source = map.getSource('user-pos-source') as GeoJSONSource;

    if (!source || !map.getStyle()) return;



    const headingParaMapa = (headingRaw !== null) 
        ? navService.procesarHeading(headingRaw) 
        : 9999;

    userGeoJSON.features[0].geometry.coordinates = [lng, lat];
    userGeoJSON.features[0].properties.precision = accuracy;
    userGeoJSON.features[0].properties.heading = headingParaMapa; 
    source.setData(userGeoJSON);

    if (!haRealizadoPrimerVuelo ) { 
        map.flyTo({
            center: [lng, lat],
            zoom: 18,
            speed: 1.2,
            essential: true
        });
        
        haRealizadoPrimerVuelo = true;
        console.log("Primer centrado de cámara completado.");
    }

}

