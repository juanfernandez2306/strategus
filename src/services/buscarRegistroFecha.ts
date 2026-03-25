import { STORE_NAME, type RegistroPosicion } from "./servicioTipos";
import { abrirDB } from "./servicioAlmacenamientoDB";

const obtenerRegistrosPosicionPorFecha = async (fecha: string): Promise<RegistroPosicion[]> => {
  const db = await abrirDB();

  return new Promise((resolve, reject) => {
    try {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("fecha_registro_idx");

      const range = IDBKeyRange.only(fecha);
      const resultados: RegistroPosicion[] = [];

      const cursorRequest = index.openCursor(range);

      cursorRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          resultados.push(cursor.value as RegistroPosicion);
          cursor.continue();
        } else {
          resolve(resultados);
        }
      };

      cursorRequest.onerror = () => reject(cursorRequest.error);

      // Cerramos la conexión al terminar la transacción para liberar recursos
      transaction.oncomplete = () => db.close();

    } catch (error) {
      db.close();
      reject(error);
    }
  });
};

export default obtenerRegistrosPosicionPorFecha;