import { Map, NavigationControl } from 'maplibre-gl';
import { INFO_FINCA } from '../../../data/finca/info';

export const inicializarMapa = (contenedor: HTMLDivElement) => {

    const { configMap } = INFO_FINCA;

    const map = new Map({
        container: contenedor,
        style: {
            version: 8,
            sources: {},
            layers: [{ id: 'fondo-blanco', type: 'background', paint: { 'background-color': '#FFFCFB' } }]
        },
        center: configMap.centroInicial,
        zoom: configMap.zoomInicial,
        minZoom: configMap.minZoom,
        maxZoom: configMap.maxZoom,
        maxBounds: configMap.maxBounds
    });

    map.addControl(new NavigationControl({ showCompass: true, showZoom: true }), 'top-left');
    
    return map;
};