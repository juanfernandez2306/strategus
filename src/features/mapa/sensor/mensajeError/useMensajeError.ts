import { useCallback, useRef } from 'react';
import { useUpdateSistemaListo } from './useUpdateSistemaListo';
import { useSistemaStore } from '../../hooks/useSistemaStore';

import { 
    gpsErrorMessagePrecisionCoordenadas,
    headingErrorMessage,
    haSuperadoUmbralDistancia,
    validarGeocerca,
    concatenarMensajes
} from './utilsMensajeError';

import type { 
    CoordenadasGeograficas, 
    GpsSensorData, 
    HeadingSensorData 
} from '../sensorTypes';

export const useMensajeError = () => {
    // Almacenamiento persistente de alertas individuales
    const ultimoMensajeErrorGPS = useRef<string | null>(null);
    const ultimoMensajeHardwareGPS = useRef<string | null>(null);
    const ultimoMensajeGeocerca = useRef<string | null>(null);
    
    // Pivote geográfico para cálculo de distancias
    const ultimaPosicionGuardada = useRef<CoordenadasGeograficas>({ lat: 0, lng: 0 });

    // Semáforos de control de fases
    const statusPrecisionCoordenadasRef = useRef<boolean>(false);
    const statusGeocercaOkRef = useRef<boolean>(false);
    
    // Referencias de enlace externo
    const statusGpsOkRef = useRef<boolean>(false);
    const ultimoMensajeErrorHeading = useRef<null | string>(null);
    const statusHeadingOkRef = useRef<boolean>(false);

    const { sincronizarSistemaListo } = useUpdateSistemaListo({
        statusGpsOkRef,
        statusHeadingOkRef,
        errorGpsRef: ultimoMensajeErrorGPS,
        errorHeadingRef: ultimoMensajeErrorHeading
    });

    const { setStatusGpsOk } = useSistemaStore();

    /**
     * FASE 1: Validación de Precisión de Hardware
     * Verifica que lat/lng sean números y accuracy <= 20m.
     */
    const validarFasePrecisionHardware = useCallback((dataGPS: GpsSensorData) => {
        const mensajeHardwareActual = gpsErrorMessagePrecisionCoordenadas(dataGPS);
        
        if (ultimoMensajeHardwareGPS.current !== mensajeHardwareActual) {
            ultimoMensajeHardwareGPS.current = mensajeHardwareActual;
        }
        
        // Es verdadero SI Y SOLO SI no hay mensaje de error de hardware (es null)
        statusPrecisionCoordenadasRef.current = (mensajeHardwareActual === null);
    }, []);

    /**
     * FASE 2: Validación de Geocerca
     * Si la fase anterior falló (statusPrecisionCoordenadasRef es false), se aborta inmediatamente.
     */
    const validarFaseGeocerca = useCallback((dataGPS: GpsSensorData) => {
        // CONDICIÓN DE CORTE: Si el hardware reportó error, cortamos y no calculamos nada
        if (!statusPrecisionCoordenadasRef.current) {
            statusGeocercaOkRef.current = false;
            ultimoMensajeGeocerca.current = null; // Limpiamos para evitar residuos viejos
            return;
        }

        // Si el hardware está OK, procedemos a evaluar la distancia y envolvente
        const requiereValidacionDura = haSuperadoUmbralDistancia(dataGPS, ultimaPosicionGuardada.current);

        if (requiereValidacionDura) {
            const posicionActual: CoordenadasGeograficas = { lat: dataGPS.lat!, lng: dataGPS.lng! };
            const mensajeGeocercaActual = validarGeocerca(posicionActual);

            if (ultimoMensajeGeocerca.current !== mensajeGeocercaActual) {
                ultimoMensajeGeocerca.current = mensajeGeocercaActual;
            }

            statusGeocercaOkRef.current = (mensajeGeocercaActual === null);

            if (statusGeocercaOkRef.current) {
                ultimaPosicionGuardada.current = posicionActual;
            }
        }
    }, []);

    /**
     * FASE TERMINAL: Sincronización y Compuerta AND Infranqueable
     */
    const sincronizarFaseFinal = useCallback(() => {
        // Concatenamos los mensajes actuales de ambas fases
        const errorCombinadoActual = concatenarMensajes([
            ultimoMensajeHardwareGPS.current,
            ultimoMensajeGeocerca.current
        ]);

        // COMPUERTA AND PURA: El GPS está OK si no hay strings de error (null)
        // Y el hardware pasó Y la geocerca pasó.
        const gpsSaludableActual = (errorCombinadoActual === null) && 
                                   statusPrecisionCoordenadasRef.current && 
                                   statusGeocercaOkRef.current;

        // Condición de guardia para evitar loops innecesarios en ráfagas
        if (gpsSaludableActual === statusGpsOkRef.current && errorCombinadoActual === ultimoMensajeErrorGPS.current) {
            return;
        }

        // Guardamos los estados reales definitivos
        ultimoMensajeErrorGPS.current = errorCombinadoActual;
        statusGpsOkRef.current = gpsSaludableActual;
        setStatusGpsOk(gpsSaludableActual);

        // Despierta al unificador para evaluar si el sistema completo (GPS + Brújula) está listo
        sincronizarSistemaListo();
    }, [sincronizarSistemaListo, setStatusGpsOk]);

    /**
     * Orquestador secuencial lineal (Pipeline sin anidamientos peligrosos)
     */
    const procesarMensajeErrorGPS = useCallback((dataGPS: GpsSensorData) => {
        validarFasePrecisionHardware(dataGPS);
        validarFaseGeocerca(dataGPS);
        sincronizarFaseFinal();
    }, [validarFasePrecisionHardware, validarFaseGeocerca, sincronizarFaseFinal]);

    /**
     * Procesamiento del Heading (Brújula)
     */
    const procesarMensajeErrorHeading = useCallback((dataHeading: HeadingSensorData) => {
        const mensajeHeadingActual = headingErrorMessage(dataHeading);

        if (ultimoMensajeErrorHeading.current !== mensajeHeadingActual) {
            ultimoMensajeErrorHeading.current = mensajeHeadingActual;
        }

        const headingSaludable = mensajeHeadingActual === null && dataHeading.heading !== null;

        if (statusHeadingOkRef.current !== headingSaludable) {
            statusHeadingOkRef.current = headingSaludable;
        }

        sincronizarSistemaListo();
    }, [sincronizarSistemaListo]);

    return {
        statusGpsOkRef,
        statusHeadingOkRef,
        procesarMensajeErrorGPS,
        procesarMensajeErrorHeading
    };
};