import { useEffect, useRef } from 'react';
import { iniciarSensores } from './activarSensores';
import { useSincronizadorSistema } from './useSincronizadorSistema';

import { 
    gpsErrorMessage,
    haSuperadoUmbral,
    dispatchSensorEvent,
    headingErrorMessage,
    haSuperadoUmbralHeading
 } from './sensorUtils';

export const useSensorManager = () => {

    let ultimaPosicionRef = useRef<{ lng: number; lat: number }>({
        lng: 0, 
        lat: 0 
    });

    let ultimoMensajeErrorGps = useRef<string | null>(null);

    let statusGpsOkRef = useRef<boolean>(false);

    let ultimoHeadingRaw = useRef<number | null>(null);

    let ultimoMensajeErrorHeading = useRef<null | string>(null);

    let statusHeadingOkRef = useRef<boolean>(false);

    let conteoValidacionRef = useRef<number>(0);

    /**
     * Se calculo a partir de 3/111,111.11 
     * que equivale en el arco de latitud cerca del ecuador
     */
    const UMBRAL_TOLERANCIA = 0.000027;


    const { sincronizar } = useSincronizadorSistema({
        statusGpsOkRef,
        statusHeadingOkRef,
        errorGpsRef: ultimoMensajeErrorGps,
        errorHeadingRef: ultimoMensajeErrorHeading
    });

    useEffect(() => {
    
        console.log("Iniciando sensores...");
    
    
        const detenerSensores = iniciarSensores(
            (gps) => {
                
                let mensajeGPSerrorActual = gpsErrorMessage(
                    gps, 
                    conteoValidacionRef.current
                );

                if (ultimoMensajeErrorGps.current !== mensajeGPSerrorActual){
                    ultimoMensajeErrorGps.current = mensajeGPSerrorActual
                }
                
                const { lng, lat } = gps;

                const gpsSaludable = (mensajeGPSerrorActual === null && lng !== null && lat !== null);

                if (statusGpsOkRef.current !== gpsSaludable) {
                    statusGpsOkRef.current = gpsSaludable;
                }

                sincronizar();

                if (!gpsSaludable) return;

                const haSuperadoUmbralValue = haSuperadoUmbral(
                    {
                        lng: ultimaPosicionRef.current.lng,
                        lat: ultimaPosicionRef.current.lat
                    },
                    {lng, lat},
                    UMBRAL_TOLERANCIA
                );

                if (haSuperadoUmbralValue) {

                    ultimaPosicionRef.current = { lng, lat };

                    dispatchSensorEvent('sensorUpdateGPS', { lng, lat });

                }
                
                if (conteoValidacionRef.current >= 16) {
                    conteoValidacionRef.current = 1;
                } else {
                    conteoValidacionRef.current += 1;
                }

            },

            (rawHeadingData) => {

                let mensajeHeadingActual = headingErrorMessage(rawHeadingData);

                if (ultimoMensajeErrorHeading.current !== mensajeHeadingActual){
                    ultimoMensajeErrorHeading.current = mensajeHeadingActual
                }

                const { heading, accuracy } = rawHeadingData;

                const headingSaludable = (
                    mensajeHeadingActual === null && 
                    heading !== null && 
                    accuracy !== null
                );

                if (statusHeadingOkRef.current !== headingSaludable){
                    statusHeadingOkRef.current = headingSaludable
                }

                sincronizar();

                if (!headingSaludable || heading === null) return;

                if (ultimoHeadingRaw.current === null) {
                    ultimoHeadingRaw.current = heading;
                    dispatchSensorEvent('sensorUpdateHeading', { heading });
                    return;
                }

                const haSuperadoUmbralHeadingValue = haSuperadoUmbralHeading(
                    ultimoHeadingRaw.current,
                    heading
                );

                if (haSuperadoUmbralHeadingValue) {
                    
                    ultimoHeadingRaw.current = heading;

                    dispatchSensorEvent('sensorUpdateHeading', { heading });

                }

            }
        );

    
        return () => {

            console.log("Deteniendo sensores y limpiando memoria...");

            detenerSensores();

        };

  }, []);

}