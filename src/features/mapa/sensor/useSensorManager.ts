import { useCallback, useRef} from 'react';
import { iniciarSensores } from './activarSensores';
import { useMensajeError } from './mensajeError/useMensajeError';
import { useUpdateLocation } from './localizacion/useUpdateLocation';
import { useNavegacionDestino } from './navegacion/useNavegacionDestino';
import { type CompassHandle } from '../components/Compass';
import type { CoordenadasGeograficas } from './sensorTypes';

export const useSensorManager = (compassRef: React.RefObject<CompassHandle | null>) => {

   
    const { 
        statusGpsOkRef, 
        statusHeadingOkRef, 
        procesarMensajeErrorGPS, 
        procesarMensajeErrorHeading 
    } = useMensajeError();

    const { 
        procesarPosicionGPS, 
        procesarHeading,
        resetearPrimerVuelo
    } = useUpdateLocation({
        statusGpsOkRef,
        statusHeadingOkRef
    });

    const { 
        conectarSincronizacionDestino, 
        procesarRafagaNavegacionCruda } = useNavegacionDestino();

    const ultimoGpsCrudoRef = useRef<CoordenadasGeograficas | null>(null);

    const ultimoHeadingCrudoRef = useRef<number | null>(null);

    const limpiarSincronizacionRef = useRef<(() => void) | null>(null);


    const encenderSensores = useCallback(() => {
    
        console.log("Iniciando sensores...");

        limpiarSincronizacionRef.current = conectarSincronizacionDestino();
    
        const detenerSensores = iniciarSensores(
            (gps) => {
                
                procesarMensajeErrorGPS(gps);

                procesarPosicionGPS(gps);

                 if (gps.lat === null || gps.lng === null || statusGpsOkRef.current === false) return;

                
                const gpsCrudo: CoordenadasGeograficas = { lng: gps.lng, lat: gps.lat };

                ultimoGpsCrudoRef.current = gpsCrudo;

                procesarRafagaNavegacionCruda(compassRef, gpsCrudo, ultimoHeadingCrudoRef.current);
                
                
            },

            (rawHeadingData) => {

                procesarMensajeErrorHeading(rawHeadingData);

                procesarHeading(rawHeadingData);

                if (typeof rawHeadingData.heading !== 'number' || statusHeadingOkRef.current === false) return;

                ultimoHeadingCrudoRef.current = rawHeadingData.heading;

                procesarRafagaNavegacionCruda(compassRef, ultimoGpsCrudoRef.current, rawHeadingData.heading);

            }
        );

    
        return () => {

            console.log("Deteniendo sensores y limpiando memoria...");

            detenerSensores();

            resetearPrimerVuelo();

            if (limpiarSincronizacionRef.current) {
                limpiarSincronizacionRef.current();
                limpiarSincronizacionRef.current = null;
            }

            ultimoGpsCrudoRef.current = null;
            
            ultimoHeadingCrudoRef.current = null;

        };

  }, [procesarPosicionGPS, procesarMensajeErrorGPS, procesarHeading, procesarMensajeErrorHeading]);

  return {
    encenderSensores
  }

}