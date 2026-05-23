import { useCallback, useRef } from 'react';
import { useUpdateSistemaListo } from './useUpdateSistemaListo';
import { useSistemaStore } from '../../hooks/useSistemaStore';

import { 
    gpsErrorMessage,
    headingErrorMessage
 } from './utilsMensajeError';

 import { type GpsSensorData, type HeadingSensorData } from '../sensorTypes';

export const useMensajeError = () => {

    let ultimoMensajeErrorGps = useRef<string | null>(null);
    let statusGpsOkRef = useRef<boolean>(false);
    let ultimoMensajeErrorHeading = useRef<null | string>(null);
    let statusHeadingOkRef = useRef<boolean>(false);
    let conteoValidacionRef = useRef<number>(0);

    const { sincronizarSistemaListo } = useUpdateSistemaListo({
        statusGpsOkRef,
        statusHeadingOkRef,
        errorGpsRef: ultimoMensajeErrorGps,
        errorHeadingRef: ultimoMensajeErrorHeading
    });

    const { setStatusGpsOk } = useSistemaStore();

    const procesarMensajeErrorGPS = useCallback((dataGPS: GpsSensorData) => {

        let mensajeGPSerrorActual = gpsErrorMessage(
            dataGPS, 
            conteoValidacionRef.current
        );

        if (ultimoMensajeErrorGps.current !== mensajeGPSerrorActual){
            ultimoMensajeErrorGps.current = mensajeGPSerrorActual
        }

        
        const gpsSaludable = ultimoMensajeErrorGps.current === null;

        if (statusGpsOkRef.current !== gpsSaludable) {
            statusGpsOkRef.current = gpsSaludable;
            setStatusGpsOk(gpsSaludable);
        }

        sincronizarSistemaListo()

        if (conteoValidacionRef.current >= 16) {
            conteoValidacionRef.current = 1;
        } else {
            conteoValidacionRef.current += 1;
        }

    }, [sincronizarSistemaListo, setStatusGpsOk]);

    const procesarMensajeErrorHeading = useCallback((dataHeading: HeadingSensorData) => {
        
        let mensajeHeadingActual = headingErrorMessage(dataHeading);

        if (ultimoMensajeErrorHeading.current !== mensajeHeadingActual){
            ultimoMensajeErrorHeading.current = mensajeHeadingActual
        }

        const headingSaludable = (
            mensajeHeadingActual === null && 
            dataHeading.heading !== null 
        );

        if (statusHeadingOkRef.current !== headingSaludable){
            statusHeadingOkRef.current = headingSaludable
        }

        sincronizarSistemaListo()

    }, [sincronizarSistemaListo])

    return {
        statusGpsOkRef,
        statusHeadingOkRef,
        procesarMensajeErrorGPS,
        procesarMensajeErrorHeading
    }

}

