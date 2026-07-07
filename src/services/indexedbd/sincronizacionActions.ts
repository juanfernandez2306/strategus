import { obtenerRegistroFiltro } from "./queries";
import { escribirRegistro, borrarRegistroPorUUID } from "./actions";
import { useAuthStore } from "../../hooks/useAuthStore";
import { type RegistroPosicion } from "../../types/index";

import { URL_API_BACKEND } from "../../data/finca/info";

/**
 * Coordina la sincronización masiva y atómica de los registros locales con el backend.
 * Si todo el lote se guarda con éxito, limpia o actualiza los estados en IndexedDB.
 */
export const sincronizarRegistrosPendientes = async (): Promise<string> => {
  // 1. Obtener el token de seguridad desde Zustand
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("No hay una sesión activa para sincronizar.");

  try {
    // 2. Traer todos los registros locales de IndexedDB para aplicar el filtro dinámico
    const todosLosRegistros: RegistroPosicion[] = await obtenerRegistroFiltro(null, null);

    const registrosPendientes = todosLosRegistros.filter((registro) => {
      // Condición A: El punto es nuevo y nunca se ha sincronizado
      const noSincronizado = registro.sincronizacion === false;

      // Condición B: Ya se enviaron las coordenadas antes, pero ahora tiene una revisión lista para subir
      const tieneRevisionPendiente = registro.sincronizacion === true && registro.fecha_revision !== null;

      return noSincronizado || tieneRevisionPendiente;
    });

    // Si el dispositivo está al día, detenemos el flujo rápidamente
    if (registrosPendientes.length === 0) {
      return "Todos los registros ya están al día en el servidor.";
    }

    // 3. Enviar el lote completo en una única petición HTTP POST
    const respuesta = await fetch(`${URL_API_BACKEND}/strategus/sincronizar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registrosPendientes),
    });

    // DETECCIÓN DE FALLO: Si el backend hizo Rollback (422) o hubo otro error, saltamos al catch
    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      console.error("Transacción revertida en MySQL:", errorData);
      throw new Error(
        errorData.error?.message || "La transacción falló en el servidor. Lote revertido."
      );
    }

    // 4. PROCESAMIENTO POST-SINCRONIZACIÓN (Estatus 200 OK)
    const resultado = await respuesta.json();

    // Extraemos los arrays de UUIDs clasificados por el backend
    const uuidsParaBorrar: string[] = resultado.data?.completados || [];
    const uuidsParaActualizarA_True: string[] = resultado.data?.guardados_sin_revision || [];

    // ACCIÓN A: Borrar de IndexedDB las palmas que ya cerraron su ciclo (Sincronizadas + Revisadas)
    for (const uuid of uuidsParaBorrar) {
      await borrarRegistroPorUUID(uuid);
    }

    // ACCIÓN B: Marcar como sincronizacion = true las palmas cuyas coordenadas ya están a salvo 
    // en el servidor pero que siguen esperando por su revisión en el campo.
    for (const registro of registrosPendientes) {
      if (uuidsParaActualizarA_True.includes(registro.uuid)) {
        const registroSincronizadoSinRevision: RegistroPosicion = {
          ...registro,
          sincronizacion: true, // Se pausa su envío hasta que se le agregue una fecha_revision
        };
        await escribirRegistro("put", registroSincronizadoSinRevision);
      }
    }

    return `Sincronización exitosa. Se procesaron ${
      (resultado.summary?.completados_para_borrar + 
        resultado.summary?.guardados_sin_revision)} registros.`

  } catch (error) {
    console.error("Fallo crítico en la sincronización masiva:", error);
    throw error;
  }
};