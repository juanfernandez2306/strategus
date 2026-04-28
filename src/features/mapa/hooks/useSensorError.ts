import { useEffect, useState, useRef } from 'react';

export const useSensorError = () => {

    const MENSAJE_INICIAL = "Iniciando sensores y buscando señal GPS...";
    
    const [mensajeError, setMensajeError] = useState<string | null>(MENSAJE_INICIAL);
    const ultimoMensajeRef = useRef<string | null>(MENSAJE_INICIAL);
    
    const gpsOkRef = useRef(false);
    const brujulaOkRef = useRef(false);
    

    useEffect(() => {
        const validacionErroresSensores = (e: any) => {

            const { headingRaw, datosGps, errorGps } = e.detail;

            /**controles referencias para GPS y brujula */
            gpsOkRef.current = !!(datosGps && datosGps.lat !== 0);
            brujulaOkRef.current = typeof headingRaw === 'number';

            const sistemaOperativoActual = gpsOkRef.current && brujulaOkRef.current;

            /** si sistemaOperativoActual esta ok con los sensores
            se reincia los valores del estado del mensaje 
            y la referencia del ultimo mensaje
             */

            console.log(sistemaOperativoActual, 'hola');

            if (sistemaOperativoActual) {
                
                setMensajeError(null);
                ultimoMensajeRef.current = null;
                
            } else {

                console.log("hola");

                let mensajeObjetivo: string | null = null;

                const fallos = [];

                if (!gpsOkRef.current) fallos.push(errorGps);

                if (!brujulaOkRef.current) fallos.push("Brújula");

                mensajeObjetivo = `Esperando respuesta de: ${fallos.join(' y ')}`;

                if (ultimoMensajeRef.current !== mensajeObjetivo) {
                    ultimoMensajeRef.current = mensajeObjetivo;
                    setMensajeError(mensajeObjetivo);
                }
                
                
            }
        };

        window.addEventListener('heading-update', validacionErroresSensores);
        return () => window.removeEventListener('heading-update', validacionErroresSensores);
    }, []);

    return { 
        mensajeError,
        gpsOkRef,
        brujulaOkRef 
    };
};