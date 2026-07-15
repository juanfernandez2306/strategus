import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CoordenadasGeograficas } from '../sensor/sensorTypes';
import type { SidebarData } from '../../../types';

interface TelemetriaState {
    sistemaListo: boolean;
    setSistemaListo: (val: boolean) => void;

    mensajeError: string | null;
    setMensajeError: (error: string | null) => void;

    posicionGPS: CoordenadasGeograficas;
    setPosicionGPS: (posicionGPS: CoordenadasGeograficas) => void;

    esPrecisoGPS: boolean;
    setEsPrecisoGPS: (esPrecisoGPS: boolean) => void;

    headingAlfa: number | null;
    setHeadingAlfa: (headingAlfa: number | null) => void;

    primerVueloCompletado: boolean;
    setPrimerVueloCompletado: (primerVueloCompletado: boolean) => void;

    statusGpsOk: boolean;
    setStatusGpsOk: (statusGpsOk: boolean) => void;

    posicionDestino: CoordenadasGeograficas | null;
    setPosicionDestino: (posicionDestion: CoordenadasGeograficas | null) => void;

    proximityMode: boolean;
    setProximityMode: (proximityMode: boolean) => void;


    detallePunto: SidebarData | null;
    setDetallePunto: (detallePunto: SidebarData | null) => void;
    
}   
    
// Envolvemos el creador del store con el middleware de selección
export const useSistemaStore = create<TelemetriaState>()(
    subscribeWithSelector((set) => ({
        sistemaListo: false,
        setSistemaListo: (sistemaListo) => set({ sistemaListo }),

        mensajeError: "Iniciando sensores...",
        setMensajeError: (mensajeError) => set({ mensajeError }),

        posicionGPS: { lng: 0, lat: 0 },
        setPosicionGPS: (posicionGPS) => set({ posicionGPS }),

        esPrecisoGPS: false,
        setEsPrecisoGPS: (esPrecisoGPS) => set({ esPrecisoGPS }),

        headingAlfa: null,
        setHeadingAlfa: (headingAlfa) => set({ headingAlfa }),

        primerVueloCompletado: false,
        setPrimerVueloCompletado: (primerVueloCompletado) => set({ primerVueloCompletado }),

        statusGpsOk: false,
        setStatusGpsOk: (statusGpsOk) => set({ statusGpsOk }),

        posicionDestino: null,
        setPosicionDestino: (posicionDestino) => set({ posicionDestino }),

        proximityMode: false,
        setProximityMode: (proximityMode) => set({ proximityMode }),

        detallePunto: null,
        setDetallePunto: (nuevoPunto) => set(() => {
            if (nuevoPunto === null) {
                // Si cerramos el sidebar (seteando null), limpiamos el GPS y sensores de raíz
                return { 
                    detallePunto: null, 
                    posicionDestino: null, 
                    proximityMode: false 
                };
            }
            // Si abrimos un punto, asignamos automáticamente su destino para el GPS
            return { 
                detallePunto: nuevoPunto, 
                posicionDestino: { lng: nuevoPunto.lng, lat: nuevoPunto.lat } 
            };
        }),
        
    }))
);