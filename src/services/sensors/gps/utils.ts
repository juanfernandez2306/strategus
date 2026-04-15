import { point, polygon } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

export const validarPuntoEnArea = (
    lng: number, 
    lat: number, 
    geometria: any
): boolean => {
    try {
        
        if (!geometria || lng === undefined || lat === undefined) return false;

        const p = point([lng, lat]);

        // CASO A: Array simple de coordenadas (CONFIG_ENVOLVENTE_MIN_AREA_TRABAJO)
        // Estructura esperada: [[lng, lat], [lng, lat]...]
        if (Array.isArray(geometria) && !Array.isArray(geometria[0][0])) {
            const poli = polygon([geometria]);
            return booleanPointInPolygon(p, poli);
        } 

        // NUEVO CASO B: Array de Polígonos (COORDENADAS_LOTES)
        // Estructura esperada: [ [[lng, lat]...], [[lng, lat]...] ]
        if (Array.isArray(geometria) && Array.isArray(geometria[0][0])) {
            return geometria.some((coordsIndividuales: any) => {
                // Cada elemento es un polígono independiente (isla)
                const poli = polygon(coordsIndividuales);
                return booleanPointInPolygon(p, poli);
            });
        } 

        // CASO C: Soporte para GeoJSON (por si acaso recibes uno de QGIS directo)
        if (geometria.type === 'FeatureCollection') {
            return geometria.features.some((f: any) => booleanPointInPolygon(p, f));
        } 

        if (geometria.type === 'Feature' || geometria.type === 'Polygon' || geometria.type === 'MultiPolygon') {
            return booleanPointInPolygon(p, geometria);
        }

        return false;

    } catch (error) {
        console.error("Error crítico en validarPuntoEnArea:", error);
        return false;
    }
};