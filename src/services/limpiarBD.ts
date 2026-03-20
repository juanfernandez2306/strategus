import { STORE_NAME } from "./servicioTipos";
import { abrirDB } from "./servicioAlmacenamientoDB";

/**
 * Vacía la tabla de posiciones en IndexedDB después de confirmar con el usuario.
 */
const limpiarRegistrosPosiciones = async (): Promise<string> => {
  // 1. Confirmación de seguridad
  const confirmar = window.confirm(
    "¿ESTÁS SEGURO? Esta acción borrará TODAS las palmas y registros del teléfono de forma permanente."
  );

  if (!confirmar) {
    throw new Error("Limpieza cancelada por el usuario.");
  }

  // 2. Apertura con la versión correcta (usando tu servicio abrirDB)
  const db = await abrirDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);

      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        resolve("Base de datos limpiada con éxito.");
      };

      clearRequest.onerror = () => {
        reject(new Error("Fallo al limpiar la base de datos: " + clearRequest.error));
      };

      transaction.oncomplete = () => {
        db.close();
      };
    } catch (error) {
      db.close();
      reject(error);
    }
  });
};

export default limpiarRegistrosPosiciones;