import type { ConfigVector as ConfigVectorType }  from '../../../types';


import type { 
    SymbolLayerSpecification,
    LineLayerSpecification,
    CircleLayerSpecification,
    FilterSpecification 
} from 'maplibre-gl';

import type { OpcionesCapaLinea } from '../../../types';

export function crearCapaPuntos(
    id: string,
    nombreCapa: keyof ConfigVectorType['capas'], 
    filter: FilterSpecification | null,
    minzoom: number,
    maxzoom: number | undefined,
    colorHex: string,
    configVector: ConfigVectorType
): CircleLayerSpecification {
    
    const paintCompartido: CircleLayerSpecification['paint'] = {
        // Desvanecimiento suave al aparecer la capa
        'circle-opacity': [
            'interpolate', ['linear'], ['zoom'],
            15, 0,
            15.5, 1
        ],
        // Radio dinámico adaptado al rango de visibilidad real (> 15)
        'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            15, 1.5,
            17, 4.5,
            19, 7.5
        ],
        // ASIGNACIÓN DIRECTA: Usamos el parámetro sin condicionales 'match' o 'get'
        'circle-color': colorHex, 
        
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff'
    };

    const capa: CircleLayerSpecification = {
        'id': id,
        'type': 'circle',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa], 
        'minzoom': minzoom,
        'paint': paintCompartido
    };

    if (maxzoom !== undefined) {
        capa['maxzoom'] = maxzoom;
    }

    if (filter !== null) {
        capa['filter'] = filter;
    }

    return capa;
}

export function crearCapaEtiquetas(
    id: string,
    nombreCapa: keyof ConfigVectorType['capas'],
    filter: FilterSpecification | null, 
    minzoom: number, 
    maxzoom: number,
    configVector: ConfigVectorType,
    caracteresWrap: number | null = null,
    esLinea: boolean = false
): SymbolLayerSpecification {
    
    const layoutCompartido: SymbolLayerSpecification['layout'] = {
        'text-field': ['get', 'desc'],
        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
        'text-size': ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 14, 18, 18],
        'text-justify': 'center',
        'text-transform': 'uppercase',
        'text-padding': 10,
        'text-allow-overlap': false
    };

    if (esLinea) {
        layoutCompartido['symbol-placement'] = 'line';
        layoutCompartido['text-rotation-alignment'] = 'map';
        layoutCompartido['symbol-spacing'] = 250;
        layoutCompartido['text-offset'] = [0, -1.2]
    }

    if (caracteresWrap !== null) {
        // Dividimos entre 1.2 porque text-max-width se mide en 'ems' (ancho de la letra M)
        layoutCompartido['text-max-width'] = caracteresWrap; 
    }

    const paintCompartido: SymbolLayerSpecification['paint'] = {
        'text-color': '#212121',
        'text-halo-color': '#ffffff',
        'text-halo-width': 2
    };

    return {
        'id': id,
        'type': 'symbol',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa],
        'minzoom': minzoom,
        'maxzoom': maxzoom,
        ...(filter && { filter }),
        'layout': layoutCompartido,
        'paint': paintCompartido
    };
}


export function crearCapaLineas({
    id,
    nombreCapa,
    colorHex,
    grosorMinimoDetalle,
    grosorMaximoDetalle,
    configVector,
    dashArray = null,
    minzoom = null,
    zoomMinimoDetalle = 12,
    zoomMaximoDetalle = 16
}: OpcionesCapaLinea): LineLayerSpecification {
    
    // Si definimos un grosor para cuando el mapa requiera Máximo Detalle, interpolamos de forma ascendente
    const lineWidth = (grosorMaximoDetalle != null)
        ? (['interpolate', ['linear'], ['zoom'], zoomMinimoDetalle, grosorMinimoDetalle, zoomMaximoDetalle, grosorMaximoDetalle] as any)
        : grosorMinimoDetalle;

    return {
        'id': id,
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa],
        ...(minzoom != null && { minzoom }),
        'layout': {
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': colorHex,
            'line-width': lineWidth,
            ...(dashArray != null && { 'line-dasharray': dashArray })
        }
    };
}