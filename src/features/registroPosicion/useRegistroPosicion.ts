// src/hooks/useRegistroPosicion.ts
import { useState, useEffect } from "react";
import { obtenerRegistroPosicionGeografica } from "../../services/sensors/gps/actions.ts"; 
import { guardarRegistroPosicionEnIndexedDB } from "../../services/indexedbd/palmaActions.ts"; 
import { obtenerConteoRegistrosDelDia } from "../../services/indexedbd/palmaQueries.ts"; 
import { type RegistroPosicion } from "../../types/index.ts";

export const useRegistroPosicion = () => {
  const [conteoDiario, setConteoDiario] = useState<number>(0);

  // EFECTO: Se ejecuta al refrescar la pantalla
  useEffect(() => {
    const inicializarConteo = async () => {
      try {
        const total = await obtenerConteoRegistrosDelDia();
        setConteoDiario(total);
      } catch (err) {
        console.error("Error al inicializar conteo:", err);
      }
    };
    inicializarConteo();
  }, []);

  const registrarPosicionActual = async (galeria: number, uuid: string): Promise<string> => {
    // 1. Obtener GPS
    const datosGps = await obtenerRegistroPosicionGeografica(galeria);
    
    // 2. Completar el objeto (añadiendo el uuid que generas)
    const nuevoRegistro: RegistroPosicion = {
      ...(datosGps as RegistroPosicion),
      uuid: uuid,
    };

    // 3. Guardar en IndexedDB
    const mensaje = await guardarRegistroPosicionEnIndexedDB(nuevoRegistro);

    // 4. Actualizar el estado local del conteo
    const nuevoTotal = await obtenerConteoRegistrosDelDia();
    setConteoDiario(nuevoTotal);

    return mensaje;
  };

  return { registrarPosicionActual, conteoDiario };
};