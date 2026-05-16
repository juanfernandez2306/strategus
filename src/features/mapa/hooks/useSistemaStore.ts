import { create } from 'zustand';

interface TelemetriaState {
    // Estados de Control de Hardware
    sistemaListo: boolean;
    mensajeError: string | null;
    
    // Ubicación del Usuario
    posicionInicial: [number, number] | null; // [lng, lat] exclusivo para el primer zoom
    posicionUsuario: { lng: number; lat: number; accuracy: number } | null;
    heading: number | null; // Orientación del dispositivo (0 - 360°)
    
    // Navegación hacia Destino
    posicionDestino: { lng: number; lat: number } | null;
    distancia: number | null; // Distancia en metros al destino
    orientacionHaciaDestino: number | null; // Ángulo (bearing) hacia el destino
    
    // Actions (Setters)
    setSistemaListo: (val: boolean) => void;
    setMensajeError: (error: string | null) => void;
    setPosicionInicial: (coords: [number, number]) => void;
    setPosicionUsuario: (lng: number, lat: number, accuracy: number) => void;
    setHeading: (heading: number) => void;
    setPosicionDestino: (coords: { lng: number; lat: number } | null) => void;
    actualizarCalculosNavegacion: (distancia: number, orientacion: number) => void;
}

export const useSistemaStore = create<TelemetriaState>((set) => ({
    sistemaListo: false,
    mensajeError: "Iniciando sensores...",
    
    posicionInicial: null,
    posicionUsuario: null,
    heading: null,
    
    posicionDestino: null,
    distancia: null,
    orientacionHaciaDestino: null,

    setSistemaListo: (sistemaListo) => set({ sistemaListo }),
    setMensajeError: (mensajeError) => set({ mensajeError }),
    
    setPosicionInicial: (posicionInicial) => set((state) => {
        // Aquí SÍ se usa 'state', por lo que este está perfecto
        if (state.posicionInicial !== null) return {};
        return { posicionInicial };
    }),
    
    setPosicionUsuario: (lng, lat, accuracy) => set({ 
        posicionUsuario: { lng, lat, accuracy } 
    }),
    
    setHeading: (heading) => set({ heading }),
    
    // CORREGIDO: Quitamos el parámetro 'state' que no se leía
    setPosicionDestino: (posicionDestino) => set(() => {
        if (!posicionDestino) {
            return { posicionDestino: null, distancia: null, orientacionHaciaDestino: null };
        }
        return { posicionDestino };
    }),
    
    actualizarCalculosNavegacion: (distancia, orientacionHaciaDestino) => set({ 
        distancia, 
        orientacionHaciaDestino 
    })
}));