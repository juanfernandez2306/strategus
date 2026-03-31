import { escribirRegistro, limpiarAlmacenDatos } from "./actions.ts";
import { obtenerRegistroFiltro } from "./queries.ts";
import { type RegistroPosicion } from "../../types/index.ts";
import dayjs from "dayjs";

/**
 * Lógica de negocio para UNIFICAR registros.
 * Si el UUID ya existe, actualiza; si no, crea uno nuevo.
 */
export const upsertRegistroLuegoDeUnificar = async (registro: RegistroPosicion): Promise<void> => {
  try {
    // 1. Buscamos si el UUID ya existe usando el especialista de lectura
    const resultados = await obtenerRegistroFiltro("uuid_idx", registro.uuid);
    const registroExistente = resultados[0];

    if (registroExistente) {
      // 2. Si existe, actualizamos manteniendo el ID numérico interno de IndexedDB
      const registroActualizado = { 
        ...registro, 
        id: registroExistente.id 
      };
      
      // Usamos el motor genérico con "put" (actualizar)
      await escribirRegistro("put", registroActualizado);
    } else {
      // 3. Si no existe, lo agregamos como nuevo
      // Eliminamos el ID para que IndexedDB genere uno nuevo autoincremental
      const { id, ...nuevoSinId } = registro;
      
      // Usamos el motor genérico con "add" (insertar)
      await escribirRegistro("add", nuevoSinId);
    }
  } catch (error) {
    console.error("Error al unificar el registro:", error);
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