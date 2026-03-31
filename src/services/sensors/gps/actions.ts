import dayjs from "dayjs";
// 1. Importamos las herramientas del motor y los datos limpios
import { obtenerPosicionActual, tienePrecisionSuficiente } from "./engine";
import { COORDENADAS_LOTES } from "../../../data/finca/limites.ts";
import { validarPuntoEnArea } from "./utils";
import { type RegistroPosicion } from "../../../types";

export const obtenerRegistroPosicionGeografica = async (galeria: number): Promise<Partial<RegistroPosicion>> => {
    try {
        // 2. Usamos el motor para obtener la posición (ya maneja permisos y errores traducidos)
        const posicion = await obtenerPosicionActual();
        const { latitude, longitude, accuracy } = posicion.coords;
        const ahora = dayjs();

        // 3. Validamos precisión usando la lógica centralizada del motor
        if (!tienePrecisionSuficiente(accuracy)) {
            throw new Error(`Señal GPS débil: (${accuracy.toFixed(1)}m). Intente nuevamente.`);
        }

        // 4. Validamos geocerca contra la nueva estructura de lotes
        const estaEnArea = validarPuntoEnArea(longitude, latitude, COORDENADAS_LOTES);

        if (!estaEnArea) {
            throw new Error("Ubicación fuera del área de trabajo.");
        }
        
        // 5. Retornamos el objeto limpio
        return {
            latitud: latitude,
            longitud: longitude,
            precision: accuracy,
            fecha_registro: ahora.format("YYYY-MM-DD"),
            hora_registro: ahora.format("HH:mm:ss"),
            galeria,
            sincronizacion: false,
            revision_planta: false,
            fecha_revision: null,
            hora_revision: null
        };

    } catch (error: any) {
        // Re-lanzamos el error para que la UI (el componente) lo muestre al usuario
        throw error;
    }
};