import { useEffect } from 'react';
import { startLocationSource } from '../services/inyeccionDatosUsuarioPosicion';

export const useSensorManager = () => {


    useEffect(() => {
    
        console.log("Iniciando sensores...");
    
    
        const stopSensors = startLocationSource(true);

    
        return () => {

            console.log("Deteniendo sensores y limpiando memoria...");

            stopSensors();

        };

  }, []);

}