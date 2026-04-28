import { useEffect, useState, useRef } from 'react';

export const useSensorError = () => {

    const MENSAJE_INICIAL = "Iniciando sensores y buscando señal GPS...";
    
    const [mensajeError, setMensajeError] = useState<string | null>(MENSAJE_INICIAL);
    const ultimoMensajeRef = useRef<string | null>(MENSAJE_INICIAL);
    const [sistemaListo, setSistemaListo] = useState<boolean>(false);
    
    const gpsOkRef = useRef(false);
    const brujulaOkRef = useRef(false);
    

    useEffect(() => {
        const validacionErroresSensores = (e: any) => {

            const { headingRaw, datosGps, errorGps } = e.detail;

            /**controles referencias para GPS y brujula */
            gpsOkRef.current = !!(datosGps && datosGps.lat !== 0);
            brujulaOkRef.current = typeof headingRaw === 'number';

            const sistemaOperativoActual = gpsOkRef.current && brujulaOkRef.current;

            /** 
                si sistemaOperativoActual esta ok con los sensores
                se reincia los valores del estado del mensaje 
                y la referencia del ultimo mensaje
            */

            if (sistemaOperativoActual) {
                
                setMensajeError(null);
                setSistemaListo(sistemaOperativoActual);
                ultimoMensajeRef.current = null;
                
            } else {

                let mensajeObjetivo: string | null = null;

                const fallos = [];

                if (!gpsOkRef.current) fallos.push(errorGps);

                if (!brujulaOkRef.current) fallos.push("Esperando respuesta de la brújula");

                mensajeObjetivo = `${fallos.join(' y ')}`;

                if (ultimoMensajeRef.current !== mensajeObjetivo) {
                    ultimoMensajeRef.current = mensajeObjetivo;
                    setMensajeError(mensajeObjetivo);
                    setSistemaListo(sistemaOperativoActual);
                }
                
                
            }
        };

        window.addEventListener('heading-update', validacionErroresSensores);
        return () => window.removeEventListener('heading-update', validacionErroresSensores);
    }, []);

    return { 
        mensajeError,
        sistemaListo,
        gpsOkRef,
        brujulaOkRef 
    };
};