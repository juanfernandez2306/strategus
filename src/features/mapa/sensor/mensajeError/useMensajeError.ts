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
     * FASE 1: Evalúa exclusivamente la salud e integridad física del hardware y señal GPS.
     */
    const validarFasePrecisionHardware = useCallback((dataGPS: GpsSensorData) => {
        const errorHardwareActual = gpsErrorMessagePrecisionCoordenadas(dataGPS);
        
        ultimoMensajeHardwareGPS.current = errorHardwareActual;
        statusPrecisionCoordenadasRef.current = (errorHardwareActual === null);
    }, []);

    /**
     * FASE 2: Evalúa condiciones espaciales (Arranque y Desplazamiento lineal) con Turf.
     */
    const validarFaseGeocerca = useCallback((dataGPS: GpsSensorData) => {
        // Si el hardware falla, reseteamos el estado de la geocerca para evitar residuos colaterales
        if (!statusPrecisionCoordenadasRef.current) {
            ultimoMensajeGeocerca.current = null;
            statusGeocercaOkRef.current = true; // Por defecto true para no duplicar errores si el hardware está roto
            return;
        }

        const lngActual = dataGPS.lng!;
        const latActual = dataGPS.lat!;

        // Evaluación de disparo: Primer pulso (0,0) o movimiento significativo > 30 metros
        const esPrimerPulso = ultimaPosicionGuardada.current.lat === 0 && ultimaPosicionGuardada.current.lng === 0;
        const seSuperoDistancia = esPrimerPulso || haSuperadoUmbralDistancia(dataGPS, ultimaPosicionGuardada.current);

        // Si no se cumple el umbral cinemático, se mantiene intacto el veredicto anterior (Persistencia)
        if (!seSuperoDistancia) return;

        // Actualizamos la posición de pivote y recalculamos la geocerca
        ultimaPosicionGuardada.current = { lng: lngActual, lat: latActual };
        
        // Pasamos una copia limpia del objeto de coordenadas
        const errorGeocerca = validarGeocerca({ lng: lngActual, lat: latActual });

        ultimoMensajeGeocerca.current = errorGeocerca;
        statusGeocercaOkRef.current = (errorGeocerca === null);
    }, []);

    /**
     * FASE 3: Orquesta la fusión de strings y gatilla eventos de Zustand/Sincronizador.
     */
    const sincronizarFaseFinal = useCallback(() => {
        const errorCombinadoActual = concatenarMensajes([
            ultimoMensajeHardwareGPS.current, 
            ultimoMensajeGeocerca.current
        ]);
        
        const gpsSaludableActual = statusPrecisionCoordenadasRef.current && statusGeocercaOkRef.current;

        const huboCambioMensaje = ultimoMensajeErrorGPS.current !== errorCombinadoActual;
        const huboCambioSalud = statusGpsOkRef.current !== gpsSaludableActual;

        // Cláusula de guarda para protección de re-renders redundantes
        if (!huboCambioMensaje && !huboCambioSalud) return;

        // Mutación controlada de estados globales
        ultimoMensajeErrorGPS.current = errorCombinadoActual;
        statusGpsOkRef.current = gpsSaludableActual;
        setStatusGpsOk(gpsSaludableActual);

        sincronizarSistemaListo();
    }, [sincronizarSistemaListo, setStatusGpsOk]);

    /**
     * Pipeline secuencial de telemetría GPS
     */
    const procesarMensajeErrorGPS = useCallback((dataGPS: GpsSensorData) => {
        validarFasePrecisionHardware(dataGPS);
        validarFaseGeocerca(dataGPS);
        sincronizarFaseFinal();
    }, [validarFasePrecisionHardware, validarFaseGeocerca, sincronizarFaseFinal]);

    /**
     * Pipeline de telemetría de Orientación (Brújula)
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