import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { CoordenadasGeograficas } from '../sensor/sensorTypes';

interface TelemetriaState {
    sistemaListo: boolean;
    mensajeError: string | null;
    posicionGPS: CoordenadasGeograficas;
    esPrecisoGPS: boolean;
    headingAlfa: number | null;
    primerVueloCompletado: boolean;
    statusGpsOk: boolean;
    
    setSistemaListo: (val: boolean) => void;
    setMensajeError: (error: string | null) => void;
    setPosicionGPS: (posicionGPS: CoordenadasGeograficas) => void;
    setEsPrecisoGPS: (esPrecisoGPS: boolean) => void;
    setHeadingAlfa: (headingAlfa: number | null) => void;
    setPrimerVueloCompletado: (primerVueloCompletado: boolean) => void;
    setStatusGpsOk: (statusGpsOk: boolean) => void;
}

// Envolvemos el creador del store con el middleware de selección
export const useSistemaStore = create<TelemetriaState>()(
    subscribeWithSelector((set) => ({
        sistemaListo: false,
        mensajeError: "Iniciando sensores...",
        posicionGPS: { lng: 0, lat: 0 },
        esPrecisoGPS: false,
        headingAlfa: null,
        primerVueloCompletado: false,
        statusGpsOk: false,

        setSistemaListo: (sistemaListo) => set({ sistemaListo }),
        setMensajeError: (mensajeError) => set({ mensajeError }),
        setPosicionGPS: (posicionGPS) => set({ posicionGPS }),
        setEsPrecisoGPS: (esPrecisoGPS) => set({ esPrecisoGPS }),
        setHeadingAlfa: (headingAlfa) => set({ headingAlfa }),
        setPrimerVueloCompletado: (primerVueloCompletado) => set({ primerVueloCompletado }),
        setStatusGpsOk: (statusGpsOk) => set({ statusGpsOk }),
    }))
);