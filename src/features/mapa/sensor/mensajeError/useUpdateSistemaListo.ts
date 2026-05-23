import { useCallback, useRef } from "react";
import { useSistemaStore } from "../../hooks/useSistemaStore";

interface SincronizadorSistemaListo {
    statusGpsOkRef: React.RefObject<boolean>;
    statusHeadingOkRef: React.RefObject<boolean>;
    errorGpsRef: React.RefObject<string | null>;
    errorHeadingRef: React.RefObject<string | null>;
}

export const useUpdateSistemaListo = ({
    statusGpsOkRef,
    statusHeadingOkRef,
    errorGpsRef,
    errorHeadingRef
}: SincronizadorSistemaListo) => {
    
    const { setSistemaListo, setMensajeError } = useSistemaStore();

    
    const ultimoEstadoListoEnviado = useRef<boolean>(false);
    const ultimoMensajeEnviado = useRef<string | null>(null);

    const sincronizarSistemaListo = useCallback(() => {
        
        const sistemaListoActual = statusGpsOkRef.current && statusHeadingOkRef.current;

        const mensajes: string[] = [];

        if (errorGpsRef.current) mensajes.push(errorGpsRef.current);

        if (errorHeadingRef.current) mensajes.push(errorHeadingRef.current);

        const mensajeCombinado = mensajes.length > 0 ? mensajes.join(' | ') : null;

        
        if (ultimoEstadoListoEnviado.current !== sistemaListoActual) {

            ultimoEstadoListoEnviado.current = sistemaListoActual;

            setSistemaListo(sistemaListoActual);

        }

        if (ultimoMensajeEnviado.current !== mensajeCombinado){

            ultimoMensajeEnviado.current = mensajeCombinado;

            setMensajeError(mensajeCombinado);

        }
    }, [setSistemaListo, setMensajeError]);

    return { sincronizarSistemaListo };
};