import { useRef } from "react";
import { useSistemaStore } from "../hooks/useSistemaStore";

interface SincronizadorProps {
    statusGpsOkRef: React.RefObject<boolean>;
    statusHeadingOkRef: React.RefObject<boolean>;
    errorGpsRef: React.RefObject<string | null>;
    errorHeadingRef: React.RefObject<string | null>;
}

export const useSincronizadorSistema = ({
    statusGpsOkRef,
    statusHeadingOkRef,
    errorGpsRef,
    errorHeadingRef
}: SincronizadorProps) => {
    
    const { setSistemaListo, setMensajeError } = useSistemaStore();

    
    const ultimoEstadoListoEnviado = useRef<boolean>(false);
    const ultimoMensajeEnviado = useRef<string | null>(null);

    const sincronizar = () => {
        
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
    };

    return { sincronizar };
};