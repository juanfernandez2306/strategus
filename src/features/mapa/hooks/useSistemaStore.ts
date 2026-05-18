import { create } from 'zustand';
import type { CoordenadasGeograficas } from '../sensor/sensorTypes';

interface TelemetriaState {
    // Estados de Control de Hardware
    sistemaListo: boolean;
    mensajeError: string | null;

    // Estados de control para la localizacion
    posicionInicialZoom: CoordenadasGeograficas;
    posicionGPS: CoordenadasGeograficas;
    esPrecisoGPS: boolean;
    headingAlfa: number;
    
    // Actions (Setters)
    setSistemaListo: (val: boolean) => void;
    setMensajeError: (error: string | null) => void;
    setPosicionInicialZoom: (posicionInicialZoom: CoordenadasGeograficas) => void,
    setPosicionGPS: (posicionGPS: CoordenadasGeograficas) => void,
    setEsPrecisoGPS: (esPrecisoGPS: boolean) => void,
    setHeadingAlfa: (headingAlfa: number) => void,
}

export const useSistemaStore = create<TelemetriaState>((set) => ({
    sistemaListo: false,
    mensajeError: "Iniciando sensores...",
    posicionInicialZoom: {lng: 0, lat: 0},
    posicionGPS: {lng: 0, lat: 0},
    esPrecisoGPS: false,
    headingAlfa: 0,


    setSistemaListo: (sistemaListo) => set({ sistemaListo }),
    setMensajeError: (mensajeError) => set({ mensajeError }),
    setPosicionInicialZoom: (posicionInicialZoom) => set({ posicionInicialZoom }),
    setPosicionGPS: (posicionGPS) => set({ posicionGPS }),
    setEsPrecisoGPS: (esPrecisoGPS) => set({ esPrecisoGPS }),
    setHeadingAlfa: (headingAlfa) => set({ headingAlfa })

}));