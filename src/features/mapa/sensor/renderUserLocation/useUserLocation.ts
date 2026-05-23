import { useCallback, useRef } from 'react';
import { type Map as MapLibreMap, type GeoJSONSource } from 'maplibre-gl';
import { useSistemaStore } from '../../hooks/useSistemaStore'; 
import { userGeoJSON } from '../../services/instaciarSimbologiaUsuario'; 

/**
 * Hook de Infraestructura: Expone la subrutina imperativa para acoplar la telemetría
 * de Zustand directamente sobre la GPU de MapLibre sin ciclo de vida de React.
 */
export const useUserLocation = () => {
    
    // Referencias mutables para lectura síncrona instantánea dentro de los callbacks de los sensores
    const posicionRef = useRef(useSistemaStore.getState().posicionGPS);
    const esPrecisoRef = useRef(useSistemaStore.getState().esPrecisoGPS);
    const headingRef = useRef(useSistemaStore.getState().headingAlfa);
    const sistemaListoRef = useRef(useSistemaStore.getState().sistemaListo);
    const primerVueloRef = useRef(useSistemaStore.getState().primerVueloCompletado);

    /**
     * Inicializa las suscripciones de Zustand conectándolas al Source del mapa.
     * Retorna una función de limpieza para destruir los listeners de forma síncrona.
     */
    const conectarSincronizacionStore = useCallback((mapInstance: MapLibreMap) => {
        if (!mapInstance) return () => {};

        console.log("Subrutina Usuario: Conectando tubería imperativa Zustand -> MapLibre...");

        /**
         * Lee las referencias y empuja el GeoJSON actualizado directamente a la GPU
         */
        const empujarTelemetriaAlMapa = () => {
            if (!mapInstance || typeof mapInstance.getStyle !== 'function' || !mapInstance.getStyle()) return;

            const source = mapInstance.getSource('user-pos-source') as GeoJSONSource | undefined;
            if (!source) return;

            // 1. Extraemos los valores ya filtrados por tus umbrales (3 metros y 6 grados)
            const coords = posicionRef.current;
            const heading = headingRef.current;

            // 2. Modificamos la pizarra local (CPU) de forma ultra rápida sin romper tipados
            userGeoJSON.features[0].geometry.coordinates = [coords.lng, coords.lat];
            userGeoJSON.features[0].properties.esPreciso = esPrecisoRef.current;
            userGeoJSON.features[0].properties.heading = heading;

            // 3. Empujamos la referencia directo al hilo de renderizado
            source.setData(userGeoJSON);
        };

        // --- SUSCRIPCIONES ATÓMICAS (Requiere subscribeWithSelector en el store) ---

        const unsubPosicion = useSistemaStore.subscribe(
            (state) => state.posicionGPS,
            (newPos) => {
                posicionRef.current = newPos;
                empujarTelemetriaAlMapa();
            }
        );

        const unsubEsPreciso = useSistemaStore.subscribe(
            (state) => state.esPrecisoGPS,
            (newPreciso) => {
                esPrecisoRef.current = newPreciso;
                empujarTelemetriaAlMapa();
            }
        );

        const unsubHeading = useSistemaStore.subscribe(
            (state) => state.headingAlfa,
            (newHeading) => {
                headingRef.current = newHeading;
                empujarTelemetriaAlMapa();
            }
        );

        const unsubSistemaListo = useSistemaStore.subscribe(
            (state) => state.sistemaListo,
            (newListo) => {
                sistemaListoRef.current = newListo;
                empujarTelemetriaAlMapa();
            }
        );

        const unsubPrimerVuelo = useSistemaStore.subscribe(
            (state) => state.primerVueloCompletado,
            (newVuelo) => {
                primerVueloRef.current = newVuelo;
                
                // Animación de cámara única imperativa al recibir fijación inicial en campo
                if (newVuelo && posicionRef.current) {
                    mapInstance.flyTo({
                        center: [posicionRef.current.lng, posicionRef.current.lat],
                        zoom: 17,
                        speed: 1.2,
                        essential: true
                    });
                }
                empujarTelemetriaAlMapa();
            }
        );

        // Forzar renderizado inicial con la telemetría actual que ya esté en el store
        empujarTelemetriaAlMapa();

        /**
         * Retornamos la clausura de limpieza. Quien ejecute 'conectarSincronizacionSensores'
         * guardará esta función para apagar la tubería cuando el mapa muera.
         */
        return () => {
            console.log("Subrutina Usuario: Desconectando tubería de Zustand.");
            unsubPosicion();
            unsubEsPreciso();
            unsubHeading();
            unsubSistemaListo();
            unsubPrimerVuelo();
        };

    }, []); // Al no tener dependencias, la referencia de la función en memoria es idéntica siempre.

    return { conectarSincronizacionStore };
};