import { useEffect, useState, useRef } from 'react';

export const useSensorError = () => {
    // Iniciamos con el mensaje de espera que sugeriste
    const [mensajeError, setMensajeError] = useState<string | null>("Iniciando sensores y buscando señal GPS...");
    
    const gpsOkRef = useRef(false);
    const brujulaOkRef = useRef(false);
    const sistemaListoRef = useRef(false);

    useEffect(() => {
        const validacionErresSensores = (e: any) => {
            const { headingRaw, datosGps } = e.detail;

            // 1. Actualización de banderas (Banderas de hardware)
            gpsOkRef.current = !!(datosGps && datosGps.lat !== 0);
            brujulaOkRef.current = typeof headingRaw === 'number';

            console.log('valor brujula', headingRaw, '-->', 'valor ref brujula', brujulaOkRef.current)

            const sistemaOperativoActual = gpsOkRef.current && brujulaOkRef.current;

            // 2. Lógica de Cambio de Estado (Evita re-renders innecesarios)
            if (sistemaOperativoActual !== sistemaListoRef.current) {
                if (sistemaOperativoActual) {
                    setMensajeError(null); // Todo OK: Limpia el alert
                } else {
                    console.log('fallando');

                    // Construcción del mensaje según el fallo
                    let fallos = [];
                    if (!gpsOkRef.current) fallos.push("GPS");
                    if (!brujulaOkRef.current) fallos.push("Brújula");
                    setMensajeError(`Esperando respuesta de: ${fallos.join(' y ')}`);
                }
                sistemaListoRef.current = sistemaOperativoActual;
            }
        };

        window.addEventListener('heading-update', validacionErresSensores);
        return () => window.removeEventListener('heading-update', validacionErresSensores);
    }, []);

    return { 
        mensajeError, 
        sistemaListo: sistemaListoRef.current,
        gpsOkRef,
        brujulaOkRef 
    };
};