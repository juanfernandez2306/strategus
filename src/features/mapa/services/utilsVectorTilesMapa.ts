
import type { 
    SymbolLayerSpecification,
    LineLayerSpecification,
    CircleLayerSpecification
} from 'maplibre-gl';

import type { 
    OpcionesCapaPunto,
    OpcionesCapaLinea,
    OpcionesEtiquetaPunto, 
    OpcionesEtiquetaLinea, 
    OpcionesEtiquetaPoligono
 } from '../../../types';

/**
 * Fábrica (Factory) encargada de generar objetos de configuración de capas de puntos (círculos)
 * compatibles con la especificación oficial de MapLibre GL JS.
 */
export function crearCapaPuntos({
    id,
    nombreCapa,
    colorHex,
    configVector,
    filter = null,
    minzoom,
    maxzoom = null,
    radioMinimoDetalle = 1.5, // Valores por defecto extraídos de tu diseño original
    radioMaximoDetalle = 7.5,  // Valores por defecto extraídos de tu diseño original
    zoomMinimoDetalle = 15,
    zoomMaximoDetalle = 19
}: OpcionesCapaPunto): CircleLayerSpecification {

    return {
        'id': id,
        'type': 'circle',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa],
        // Inyecciones condicionales limpias e inline igual que en crearCapaLineas
        ...(minzoom != null && { minzoom }),
        ...(maxzoom != null && { maxzoom }),
        ...(filter != null && { filter }),
        'paint': {
            // Desvanecimiento suave al aparecer la capa a partir de su zoom inicial
            'circle-opacity': [
                'interpolate', ['linear'], ['zoom'],
                minzoom, 0,
                (minzoom + 0.5), 1
            ] as any,
            
            // Radio dinámico adaptado de forma continua según el nivel de detalle
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                zoomMinimoDetalle, radioMinimoDetalle,
                zoomMaximoDetalle, radioMaximoDetalle
            ] as any,
            
            'circle-color': colorHex,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#ffffff'
        }
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

/** Helper privado para resolver la expresión de texto común */
const obtenerExpresionTexto = (estatico: string | null | undefined, campo: string | null | undefined) => {
    return estatico != null ? estatico : ['get', campo || 'desc'];
};

/** Helper privado para resolver el text-size dinámico común */
const obtenerTextSize = (zMin: number, tMin: number, zMax: number, tMax: number) => [
    'interpolate', ['linear'], ['zoom'], zMin, tMin, zMax, tMax
];

const paintCompartidoBase = {
    'text-halo-color': '#ffffff',
    'text-halo-width': 1.5
};

// =========================================================================
// 1. RESPONSABILIDAD: ETIQUETAS PARA PUNTOS (Postes, Aspersores, Palmas)
// =========================================================================
export function crearEtiquetasPuntos({
    id, nombreCapa, configVector, filter = null, minzoom = null, maxzoom = null,
    textoEstatico = null, campoContenedorTexto = 'desc',
    tamanoMinimoDetalle = 10, tamanoMaximoDetalle = 16, zoomMinimoDetalle = 15, zoomMaximoDetalle = 19,
    desplazamientoTexto = [0, 0], anclajeTexto = 'center'
}: OpcionesEtiquetaPunto): SymbolLayerSpecification {
    return {
        id, 'type': 'symbol', 'source': 'finca-danubio-source', 'source-layer': configVector.capas[nombreCapa],
        ...(minzoom != null && { minzoom }), ...(maxzoom != null && { maxzoom }), ...(filter != null && { filter }),
        'layout': {
            'text-field': obtenerExpresionTexto(textoEstatico, campoContenedorTexto) as any,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': obtenerTextSize(zoomMinimoDetalle, tamanoMinimoDetalle, zoomMaximoDetalle, tamanoMaximoDetalle) as any,
            'text-anchor': anclajeTexto,
            'text-offset': desplazamientoTexto,
            'text-justify': 'center',
            'text-transform': 'uppercase'
        },
        'paint': { ...paintCompartidoBase, 'text-color': '#212121' }
    };
}

// =========================================================================
// 2. RESPONSABILIDAD: ETIQUETAS PARA LÍNEAS (Vías, Líneas de Cerca, Tendidos)
// =========================================================================
export function crearEtiquetasLineas({
    id, nombreCapa, configVector, filter = null, minzoom = null, maxzoom = null,
    textoEstatico = null, campoContenedorTexto = 'desc',
    tamanoMinimoDetalle = 10, tamanoMaximoDetalle = 14, zoomMinimoDetalle = 12, zoomMaximoDetalle = 16,
    espaciadoSimbologia = 250
}: OpcionesEtiquetaLinea): SymbolLayerSpecification {
    return {
        id, 'type': 'symbol', 'source': 'finca-danubio-source', 'source-layer': configVector.capas[nombreCapa],
        ...(minzoom != null && { minzoom }), ...(maxzoom != null && { maxzoom }), ...(filter != null && { filter }),
        'layout': {
            'text-field': obtenerExpresionTexto(textoEstatico, campoContenedorTexto) as any,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': obtenerTextSize(zoomMinimoDetalle, tamanoMinimoDetalle, zoomMaximoDetalle, tamanoMaximoDetalle) as any,
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'symbol-spacing': espaciadoSimbologia,
            'text-keep-upright': true,
            'text-transform': 'uppercase',
            // Si es un nombre dinámico (ej: vía), lo elevamos del eje; si es simbología estática (ej: 'X') va en el centro
            'text-offset': textoEstatico == null ? [0, -1.2] : [0, 0]
        },
        'paint': { ...paintCompartidoBase, 'text-color': textoEstatico != null ? '#000000' : '#212121' }
    };
}

// =========================================================================
// 3. RESPONSABILIDAD: ETIQUETAS PARA POLÍGONOS (Lotes / Parcelas)
// =========================================================================
export function crearEtiquetasPoligonos({
    id, nombreCapa, configVector, filter = null, minzoom = null, maxzoom = null,
    campoContenedorTexto = 'desc',
    tamanoMinimoDetalle = 10, tamanoMaximoDetalle = 18, zoomMinimoDetalle = 10, zoomMaximoDetalle = 18,
    caracteresWrap = 8
}: OpcionesEtiquetaPoligono): SymbolLayerSpecification {
    return {
        id, 'type': 'symbol', 'source': 'finca-danubio-source', 'source-layer': configVector.capas[nombreCapa],
        ...(minzoom != null && { minzoom }), ...(maxzoom != null && { maxzoom }), ...(filter != null && { filter }),
        'layout': {
            'text-field': obtenerExpresionTexto(null, campoContenedorTexto) as any,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': obtenerTextSize(zoomMinimoDetalle, tamanoMinimoDetalle, zoomMaximoDetalle, tamanoMaximoDetalle) as any,
            'text-max-width': caracteresWrap,
            'text-justify': 'center',
            'text-transform': 'uppercase'
        },
        'paint': { ...paintCompartidoBase, 'text-color': '#212121' }
    };
}