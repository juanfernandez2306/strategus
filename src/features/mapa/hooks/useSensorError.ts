import { useSensorStore } from './useSensorStore';

export const useSensorError = () => {
    const MENSAJE_INICIAL = "Iniciando sensores y buscando señal GPS...";
    
    // Obtenemos los estados exactos del store
    const lat = useSensorStore((state) => state.lat);
    const headingRaw = useSensorStore((state) => state.headingRaw);
    const errorGps = useSensorStore((state) => state.errorGps);

    const tieneGps = lat !== 0;
    const tieneHeading = typeof headingRaw === 'number';

    // El sistema está listo SOLO si tiene posición, tiene brújula Y NO hay errores críticos
    // Si hay un error de "Fuera de área", el sistema NO debería estar listo.
    const sistemaListo = tieneGps && tieneHeading && !errorGps;

    const obtenerMensaje = () => {
        // Si todo está perfecto, devolvemos null para ocultar el Snackbar
        if (sistemaListo) return null;

        const fallos = [];

        // 1. Prioridad: Errores reportados por el motor (Fuera de área, Precisión mala)
        if (errorGps) fallos.push(errorGps);

        // 2. Errores de conexión/estado
        if (!tieneGps) fallos.push("Buscando señal GPS...");
        if (!tieneHeading) fallos.push("Esperando brújula...");

        return fallos.length > 0 ? fallos.join(' | ') : MENSAJE_INICIAL;
    }

    return { 
        mensajeError: obtenerMensaje(),
        sistemaListo 
    };
};