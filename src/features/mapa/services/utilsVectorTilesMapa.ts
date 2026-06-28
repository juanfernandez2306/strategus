
import type { 
    SymbolLayerSpecification,
    LineLayerSpecification,
    CircleLayerSpecification,
    FillLayerSpecification
} from 'maplibre-gl';

import type { 
    OpcionesCapaPunto,
    OpcionesCapaLinea,
    OpcionesCapaPoligono,
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
    colorHex, // Ahora acepta arreglos de expresiones complejas de MapLibre
    grosorMinimoDetalle,
    grosorMaximoDetalle = null,
    configVector,
    dashArray = null,
    minzoom = null,
    maxzoom = null,
    filter = null,
    zoomMinimoDetalle = 12,
    zoomMaximoDetalle = 16
}: OpcionesCapaLinea): LineLayerSpecification {
    
    // Si se pasa un grosor máximo se interpola, sino se usa el valor estático fijo (como tu 1.5)
    const lineWidth = (grosorMaximoDetalle != null)
        ? (['interpolate', ['linear'], ['zoom'], zoomMinimoDetalle, grosorMinimoDetalle, zoomMaximoDetalle, grosorMaximoDetalle] as any)
        : grosorMinimoDetalle;

    return {
        'id': id,
        'type': 'line',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa],
        ...(minzoom != null && { minzoom }),
        ...(maxzoom != null && { maxzoom }),
        ...(filter != null && { filter }),
        'paint': {
            'line-color': colorHex, // MapLibre lo evalúa de forma dinámica si es un arreglo condicional
            'line-width': lineWidth,
            ...(dashArray != null && { 'line-dasharray': dashArray })
        }
    };
}


export function crearCapaPoligonos({
    id,
    nombreCapa,
    colorFill,
    configVector,
    filter = null,
    minzoom = null,
    maxzoom = null,
    opacidadFill = 0.5
}: OpcionesCapaPoligono): FillLayerSpecification {
    
    return {
        'id': id,
        'type': 'fill',
        'source': 'finca-danubio-source',
        'source-layer': configVector.capas[nombreCapa],
        ...(minzoom != null && { minzoom }),
        ...(maxzoom != null && { maxzoom }),
        ...(filter != null && { filter }),
        'paint': {
            'fill-color': colorFill,
            'fill-opacity': opacidadFill
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
    espaciadoSimbologia = 250,
    textOffset = [0, 0] // 👈 Valor por defecto plano y limpio
}: OpcionesEtiquetaLinea): SymbolLayerSpecification {

    return {
        id, 
        'type': 'symbol', 
        'source': 'finca-danubio-source', 
        'source-layer': configVector.capas[nombreCapa],
        ...(minzoom != null && { minzoom }), 
        ...(maxzoom != null && { maxzoom }), 
        ...(filter != null && { filter }),
        'layout': {
            'text-field': obtenerExpresionTexto(textoEstatico, campoContenedorTexto) as any,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': obtenerTextSize(zoomMinimoDetalle, tamanoMinimoDetalle, zoomMaximoDetalle, tamanoMaximoDetalle) as any,
            'symbol-placement': 'line',
            'text-rotation-alignment': 'map',
            'symbol-spacing': espaciadoSimbologia,
            'text-keep-upright': true,
            'text-transform': 'uppercase',
            
            // 👇 Asignación directa del parámetro plano enviado por el usuario 👇
            'text-offset': textOffset as any 
        },
        'paint': { 
            ...paintCompartidoBase, 
            'text-color': textoEstatico != null ? '#000000' : '#212121' 
        }
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


import type { OpcionesEtiquetaPuntoPersonalizada } from '../../../types';

export function crearEtiquetasPuntosPersonalizadas({
    id,
    coordenadas,
    texto,
    minzoom,
    maxzoom = 22,
    rotacion,
    desplazamiento = [0, 0]
}: OpcionesEtiquetaPuntoPersonalizada): SymbolLayerSpecification {
    return {
        id,
        'type': 'symbol',
        // Generamos un source GeoJSON dinámico único para este punto exacto
        'source': {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': coordenadas
                },
                'properties': {}
            }
        } as any,
        'minzoom': minzoom,
        'maxzoom': maxzoom,
        'layout': {
            'text-field': texto,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 14, // Tamaño fijo o rampa si prefieres
            'symbol-placement': 'point',
            
            // 🌟 AQUÍ ESTÁ EL TRUCO DE LA ORIENTACIÓN 🌟
            'text-rotate': rotacion, 
            'text-rotation-alignment': 'map', // Hace que rote respecto al mapa, no a la pantalla
            
            'text-offset': desplazamiento,
            'text-max-width': 50,
            'text-justify': 'center'
        },
        'paint': {
            'text-color': '#000000',
            'text-halo-color': '#FFFFFF', // Color del contorno (Blanco)
            'text-halo-width': 1.5
        }
    };
}