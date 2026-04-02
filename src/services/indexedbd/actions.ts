import { abrirDB } from "./setup.ts";
import { STORE_NAME } from "./config.ts";

/**
 * MOTOR GENÉRICO DE ESCRITURA
 * @param operation "add" (para nuevos) o "put" (para actualizar/upsert)
 * @param data El objeto a guardar
 */
export const escribirRegistro = async <T>(
  operation: "add" | "put",
  data: T
): Promise<void> => {
  const db = await abrirDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const request = operation === "add" ? store.add(data) : store.put(data);

    
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
  });
};

export const borrarRegistroPorUUID = async (uuid: string): Promise<void> => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("uuid_idx"); //

    // Obtenemos la ID interna a partir del UUID
    const getRequest = index.getKey(uuid);

    getRequest.onsuccess = () => {
      const idInterna = getRequest.result;
      if (idInterna) {
        store.delete(idInterna);
      }
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
};

/**
 * BORRADO TOTAL
 */
export const limpiarAlmacenDatos = async (): Promise<void> => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => { // Ahora sí usaremos reject
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    
    // Agregamos el uso de reject para limpiar el error de TS
    request.onerror = () => {
      db.close();
      reject(request.error); //
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };

    // También es buena práctica manejar el error a nivel de transacción
    transaction.onerror = () => {
      db.close();
      reject(transaction.error); //
    };
  });
};