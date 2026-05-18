import { create } from 'zustand';
import type { CoordenadasGeograficas } from '../sensor/sensorTypes';

interface TelemetriaState {
    // Estados de Control de Hardware
    sistemaListo: boolean;
    mensajeError: string | null;

    // Estados de control para la localizacion
    posicionGPS: CoordenadasGeograficas;
    esPrecisoGPS: boolean;
    headingAlfa: number | null;
    
    // Actions (Setters)
    setSistemaListo: (val: boolean) => void;
    setMensajeError: (error: string | null) => void;
    setPosicionGPS: (posicionGPS: CoordenadasGeograficas) => void,
    setEsPrecisoGPS: (esPrecisoGPS: boolean) => void,
    setHeadingAlfa: (headingAlfa: number | null) => void,
}

export const useSistemaStore = create<TelemetriaState>((set) => ({
    sistemaListo: false,
    mensajeError: "Iniciando sensores...",
    posicionGPS: {lng: 0, lat: 0},
    esPrecisoGPS: false,
    headingAlfa: null,


    setSistemaListo: (sistemaListo) => set({ sistemaListo }),
    setMensajeError: (mensajeError) => set({ mensajeError }),
    setPosicionGPS: (posicionGPS) => set({ posicionGPS }),
    setEsPrecisoGPS: (esPrecisoGPS) => set({ esPrecisoGPS }),
    setHeadingAlfa: (headingAlfa) => set({ headingAlfa })

}));