// features/mapa/sensor/navegacion/useNavegacionDestino.ts
import { useCallback, useRef } from "react";
import { useSistemaStore } from "../../hooks/useSistemaStore";
import { ServicioNavegacion } from "./ServicioNavegacion";
import { type CompassHandle } from "../../../../components/Compass";
import type { CoordenadasGeograficas } from "../sensorTypes";

export const useNavegacionDestino = () => {
    
    const posicionDestinoActualRef = useRef<CoordenadasGeograficas | null>(useSistemaStore.getState().posicionDestino);
    const unsubscribeZustandPosicionDestinoRef = useRef<(() => void) | null>(null);
    const hasVibratedRef = useRef<boolean>(false);
    const engineRef = useRef<ServicioNavegacion | null>(null);
    const proximityModeRef = useRef<boolean>(false);

    const { setProximityMode } = useSistemaStore()

    if (!engineRef.current) {
        engineRef.current = new ServicioNavegacion();
    }

    
    const conectarSincronizacionDestino = useCallback(() => {
        console.log("SIG: Conectando canalizador de destino pasivo...");
        
        posicionDestinoActualRef.current = useSistemaStore.getState().posicionDestino;

        unsubscribeZustandPosicionDestinoRef.current = useSistemaStore.subscribe(
            (state) => state.posicionDestino,
            (nuevaPosicionDestino) => {
                posicionDestinoActualRef.current = nuevaPosicionDestino as CoordenadasGeograficas | null;
                if (!nuevaPosicionDestino) {
                    hasVibratedRef.current = false;
                }
            }
        );

        return () => {
            console.log("SIG: Cancelando canalizador de destino pasivo.");
            if (unsubscribeZustandPosicionDestinoRef.current) {
                unsubscribeZustandPosicionDestinoRef.current();
                unsubscribeZustandPosicionDestinoRef.current = null;
            }
            posicionDestinoActualRef.current = null;
            hasVibratedRef.current = false;
        };
    }, []);

    // 3. PROCESADOR DE RÁFAGAS: Aquí es donde verdaderamente hacemos el cortocircuito si no hay destino
    const procesarRafagaNavegacionCruda = useCallback((
        compassRef: React.RefObject<CompassHandle | null>,
        gpsCrudo: CoordenadasGeograficas | null,
        headingCrudo: number | null
    ) => {
        
        if (!posicionDestinoActualRef.current || !gpsCrudo || headingCrudo === null || !compassRef.current || !engineRef.current) {
            return;
        }

        const { distanciaFiltrada, anguloFiltrado, proximidadModo } = engineRef.current.calcularNavegacion(
            gpsCrudo,
            posicionDestinoActualRef.current,
            headingCrudo
        );

        
        compassRef.current.updateDistance(distanciaFiltrada);
        compassRef.current.updateAngle(anguloFiltrado);
        compassRef.current.setProximityMode(proximidadModo);

        if(proximityModeRef.current !== proximidadModo){
            proximityModeRef.current = proximidadModo;
            setProximityMode(proximidadModo);
        }

        if (proximidadModo && !hasVibratedRef.current) {
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            hasVibratedRef.current = true;
        }
    }, []);

    
    return {
        conectarSincronizacionDestino,
        procesarRafagaNavegacionCruda
    };
};