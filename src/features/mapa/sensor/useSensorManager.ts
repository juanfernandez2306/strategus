import { useCallback} from 'react';
import { iniciarSensores } from './activarSensores';
import { useMensajeError } from './mensajeError/useMensajeError';
import { useUpdateLocation } from './localizacion/useUpdateLocation';

export const useSensorManager = () => {

   
    const { 
        statusGpsOkRef, 
        statusHeadingOkRef, 
        procesarMensajeErrorGPS, 
        procesarMensajeErrorHeading 
    } = useMensajeError();

    const { 
        procesarPosicionGPS, 
        procesarHeading 
    } = useUpdateLocation({
        statusGpsOkRef,
        statusHeadingOkRef
    });

    const encenderSensores = useCallback(() => {
    
        console.log("Iniciando sensores...");
    
    
        const detenerSensores = iniciarSensores(
            (gps) => {
                
                procesarMensajeErrorGPS(gps);

                procesarPosicionGPS(gps);
                
                
            },

            (rawHeadingData) => {

                procesarMensajeErrorHeading(rawHeadingData);

                procesarHeading(rawHeadingData);
            }
        );

    
        return () => {

            console.log("Deteniendo sensores y limpiando memoria...");

            detenerSensores();

        };

  }, [procesarMensajeErrorGPS, procesarMensajeErrorHeading]);

  return {
    encenderSensores
  }

}