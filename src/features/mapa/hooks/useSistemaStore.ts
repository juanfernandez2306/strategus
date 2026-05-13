import { create } from 'zustand';

interface SensorStatusState {
    sistemaListo: boolean;
    mensajeError: string | null;
    setSistemaListo: (val: boolean) => void;
    setMensajeError: (error: string | null) => void;
}

export const useSistemaStore = create<SensorStatusState>((set) => ({
    sistemaListo: false,
    mensajeError: null,
    setSistemaListo: (sistemaListo) => set({ sistemaListo }),
    setMensajeError: (mensajeError) => set({ mensajeError }),
}));