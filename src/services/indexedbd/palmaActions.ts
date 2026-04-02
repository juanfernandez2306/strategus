import { escribirRegistro, limpiarAlmacenDatos } from "./actions.ts";
import { obtenerRegistroFiltro } from "./queries.ts";
import { type RegistroPosicion } from "../../types/index.ts";
import dayjs from "dayjs";

/**
 * Lógica de negocio para UNIFICAR registros con control de actualización selectiva.
 * Solo actualiza los campos de revisión si el registro local aún no ha sido procesado.
 */
export const upsertRegistroLuegoDeUnificar = async (registro: RegistroPosicion): Promise<void> => {
  try {
    // 1. Buscamos el registro existente por UUID
    const resultados = await obtenerRegistroFiltro("uuid_idx", registro.uuid);
    const registroLocal = resultados[0];

    if (registroLocal) {
      // 2. LÓGICA "UPDATE WHERE": 
      // Solo procedemos si el registro local existe y NO ha sido revisado aún.
      if (registroLocal.revision_planta === false) {
        
        // Creamos el objeto de actualización manteniendo la estructura pero
        // inyectando los nuevos datos de revisión del 'registro' entrante.
        const registroActualizado = { 
          ...registroLocal, // Conservamos los datos originales (lat, lng, uuid, etc.)
          revision_planta: registro.revision_planta,
          fecha_revision: registro.fecha_revision,
          hora_revision: registro.hora_revision,
          // El ID debe ser el numérico de IndexedDB para que 'put' reconozca qué fila actualizar
          id: registroLocal.id 
        };
        
        await escribirRegistro("put", registroActualizado);
        console.log(`Update exitoso para UUID: ${registro.uuid}`);
      } else {
        // Si revision_planta ya es true, ignoramos el cambio para proteger el dato original
        console.log(`Registro ${registro.uuid} ya está revisado. Se ignora la actualización.`);
      }

    } else {
      // 3. Si el registro no existe en absoluto (INSERT)
      const { id, ...nuevoSinId } = registro;
      await escribirRegistro("add", nuevoSinId);
      console.log(`Nuevo registro insertado para UUID: ${registro.uuid}`);
    }
  } catch (error) {
    console.error("Error en la actualización selectiva:", error);
    throw new Error("No se pudo procesar la unificación del registro.");
  }
};

/**
 * ACTUALIZA el estado de revisión de una planta.
 * Esta versión utiliza los motores genéricos para simplificar la lógica.
 */
export const actualizarEstadoRevisionDB = async (
  uuid: string,
  revisado: boolean
): Promise<string> => {
  const fechaHoy = dayjs().format("YYYY-MM-DD");
  const horaHoy = dayjs().format("HH:mm:ss");

  try {
    // 1. Buscamos el registro usando el motor de lectura y el índice UUID
    const resultados = await obtenerRegistroFiltro("uuid_idx", uuid);
    const data: RegistroPosicion = resultados[0];

    if (!data) {
      throw new Error("Registro no encontrado");
    }

    // 2. Actualizamos los campos en el objeto de memoria
    const registroActualizado = {
      ...data,
      revision_planta: revisado,
      fecha_revision: revisado ? fechaHoy : null,
      hora_revision: revisado ? horaHoy : null,
    };

    // 3. Guardamos los cambios usando el motor de escritura (operación 'put')
    await escribirRegistro("put", registroActualizado);

    return "Se actualizó satisfactoriamente";

  } catch (error) {
    console.error("Error al actualizar revisión:", error);
    throw new Error("No se pudo actualizar la información localmente");
  }
};

/**
 * Guarda un nuevo registro de palma en la base de datos local.
 * Utiliza el motor genérico de escritura con la operación 'add'.
 */
export const guardarRegistroPosicionEnIndexedDB = async (
  registro: RegistroPosicion
): Promise<string> => {
  try {
    // Usamos el motor genérico para insertar un nuevo registro
    await escribirRegistro("add", registro);

    // Retorno simple para que la UI confirme el éxito al usuario
    return "Registro satisfactorio";

  } catch (error) {
    // Capturamos cualquier fallo del motor y lanzamos un error amigable
    console.error("Error al guardar registro de palma:", error);
    throw new Error("No se pudo guardar la información localmente");
  }
};

/**
 * Lógica de negocio para vaciar la base de datos de palmas.
 * Incluye la confirmación de seguridad para el usuario de campo.
 */
export const limpiarRegistrosPosiciones = async (): Promise<string> => {
  // 1. Confirmación de seguridad (Lógica de UI/Negocio)
  const confirmar = window.confirm(
    "¿ESTÁS SEGURO? Esta acción borrará TODAS las palmas y registros del teléfono de forma permanente."
  );

  if (!confirmar) {
    throw new Error("Limpieza cancelada por el usuario.");
  }

  try {
    // 2. Ejecución técnica usando el motor genérico
    await limpiarAlmacenDatos();
    
    return "Base de datos limpiada con éxito.";
  } catch (error) {
    console.error("Error al purgar la base de datos:", error);
    throw new Error("Fallo al limpiar la base de datos local.");
  }
};