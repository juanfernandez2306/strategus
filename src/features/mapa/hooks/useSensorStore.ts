import { create } from 'zustand';

interface SensorState {
    // estados
    lat: number;
    lng: number;
    accuracy: number;
    headingRaw: number | null;
    errorGps: string | null;
    canUpdate: boolean;

    // Acciones para actualizar el estado
    updateLocation: (lng: number, lat: number, accuracy: number) => void;
    updateHeading: (heading: number | null) => void;
    setGpsError: (error: string | null) => void;
    setCanUpdate: (canUpdate: boolean) => void;
}

export const useSensorStore = create<SensorState>((set) => ({
    lat: 0,
    lng: 0,
    accuracy: 0,
    headingRaw: null,
    errorGps: null,
    canUpdate: false,

    updateLocation: (lng, lat, accuracy) => {

        set({ lng, lat, accuracy })

    },
    
    updateHeading: (headingRaw) => {

        set({ headingRaw })
    },
    
    setGpsError: (errorGps) => {

        set({ errorGps })
    },

    setCanUpdate: (canUpdate) => {

        set({canUpdate})
        
    },

}));