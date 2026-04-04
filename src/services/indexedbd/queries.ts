import { type RegistroPosicion } from "../../types/index.ts";
import { STORE_NAME } from "./config.ts";
import { abrirDB } from "./setup.ts";

/**
 * MOTOR GENÉRICO DE CONSULTAS
 * Si se pasa un índice y un valor, filtra. 
 * Si se pasan nulos, descarga TODO el contenido (útil para el mapa).
 */
export const obtenerRegistroFiltro = async (
  index_name_filter : string | null,
  value_index_filter: string | boolean | number | null
): Promise<RegistroPosicion[]> => {
  const db = await abrirDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    
    
    let request: IDBRequest<any[]>;

    if (typeof index_name_filter === 'string' 
      && value_index_filter !== null){

      // Si hay índice y valor, filtramos
      const index = store.index(index_name_filter);
      const range = IDBKeyRange.only(value_index_filter);
      request = index.getAll(range);

    }else{

      // Si no hay filtro, bajamos TODO del store directamente
      request = store.getAll();

    }
    

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

}