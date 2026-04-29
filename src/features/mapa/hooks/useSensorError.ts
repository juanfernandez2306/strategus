import { useSensorStore } from './useSensorStore';

export const useSensorError = () => {

    const MENSAJE_INICIAL = "Iniciando sensores y buscando señal GPS...";
    
    const tieneGps = useSensorStore((state) => state.lat !== 0);
    const tieneHeading = useSensorStore((state) => typeof state.headingRaw === 'number');
    const errorGps = useSensorStore((state) => state.errorGps);

    const sistemaListo: boolean = tieneGps && tieneHeading;

    const obtenerMensaje = () => {
        
        if (sistemaListo) return null;

        const fallos = [];

        if (!tieneGps) fallos.push(errorGps);

        if (!tieneHeading) fallos.push("Esperando respuesta de la brújula");

        return fallos.length > 0 ? fallos.join(' y ') : MENSAJE_INICIAL;;
    }

    return { 
        mensajeError: obtenerMensaje(),
        sistemaListo 
    };
};