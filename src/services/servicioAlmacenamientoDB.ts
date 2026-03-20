import { 
    type RegistroPosicion, 
    type SidebarData,
    DB_NAME, 
    DB_VERSION, 
    STORE_NAME } from "./servicioTipos";
import dayjs from "dayjs";

export const abrirDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("fecha_idx", "fecha", { unique: false });
        store.createIndex("sincronizacion_idx", "sincronizacion", { unique: false });
        store.createIndex("uuid_idx", "uuid", { unique: true });
        store.createIndex("revision_planta_idx", "revision_planta", { unique: false });
        store.createIndex("fecha_revision_idx", "fecha_revision", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const guardarRegistroPosicionEnIndexedDB = async (
  registro: RegistroPosicion
): Promise<string> => {

  const db = await abrirDB();
  
  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      
      const addRequest = store.add(registro);
      addRequest.onsuccess = () => resolve(true);
      addRequest.onerror = () => reject(addRequest.error);
    });

    // Retorno simple para la UI
    return "Registro satisfactorio";

  } catch (error) {
    // Si algo falla, lanzamos el error para que el componente lo capture en su propio try/catch
    throw new Error("No se pudo guardar la información localmente");

  } finally {

    db.close();

  }

}

export const obtenerRegistroFiltro = async (
  index_name_filter : string,
  value_index_filter: string | boolean | number
): Promise<RegistroPosicion[]> => {
  const db = await abrirDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index(index_name_filter);
    
    // Usamos un rango para contar solo los de hoy
    const range = IDBKeyRange.only(value_index_filter);
    const request = index.getAll(range);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });

}


export const actualizarEstadoRevisionDB = async (
  uuid: string,
  revisado: boolean
): Promise<string> => {
  const db = await abrirDB();
  const fechaHoy = dayjs().format("YYYY-MM-DD");
  const horaHoy = dayjs().format("HH:mm:ss");

  try {
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index("uuid_idx");
      const request = index.get(uuid);

      request.onsuccess = () => {
        const data: RegistroPosicion = request.result;
        if (data) {
          // Actualizamos los campos basados en el tipo RegistroPosicion
          data.revision_planta = revisado;
          data.fecha_revision = revisado ? fechaHoy : null;
          data.hora_revision = revisado ? horaHoy : null;

          // Guardamos el registro actualizado
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve(true);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error("Registro no encontrado"));
        }
      };

      request.onerror = () => reject(request.error);
    });

    return "Se actualizó satisfactoriamente";

  } catch (error) {
    throw new Error("No se pudo actualizar la información localmente");
  } finally {
    db.close();
  }
};


export const obtenerConteoRegistrosDelDia = async (): Promise<number> => {

  const fechaHoy = dayjs().format("YYYY-MM-DD");

  try {
    const registros = await obtenerRegistroFiltro(
      "fecha_idx", 
      fechaHoy);
    
    return registros.length;

  } catch (error) {
    throw new Error("No se pudo obtener el conteo de hoy. Intente recargar.");
  }
};

export const obtenerRegistroSidebarData = async (): Promise<SidebarData[]> => {
  try {
    const db = await abrirDB();
    
    return new Promise((resolve, reject) => {
      // Abrimos transacción de solo lectura
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      
      // getAll() trae TODOS los registros sin importar filtros o índices
      const request = store.getAll();

      request.onsuccess = () => {
        const registros: RegistroPosicion[] = request.result;
        
        // Mapeamos al formato que necesita el Sidebar/Mapa
        const resultado = registros.map((reg) => ({
          uuid: reg.uuid,
          lat: reg.latitud,
          lng: reg.longitud,
          revision_planta: reg.revision_planta
        }));
        
        resolve(resultado);
      };

      request.onerror = () => {
        console.error("Error en la solicitud getAll de IndexedDB:", request.error);
        reject(new Error("Error al leer los registros de la base de datos"));
      };

      // Cerramos la conexión al terminar la transacción
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("No se pudo abrir la DB en obtenerRegistroSidebarData:", error);
    // Devolvemos un array vacío en lugar de lanzar un error 
    // para que el mapa al menos cargue aunque no haya puntos.
    return [];
  }
};

export const obtenerConteoRegistrosRevisadosDelDia = async (): Promise<number> => {

  const fechaHoy = dayjs().format("YYYY-MM-DD");

  try {
    const registros = await obtenerRegistroFiltro(
      "fecha_revision_idx", 
      fechaHoy);
    
    return registros.length;

  } catch (error) {
    throw new Error("No se pudo obtener el conteo de hoy. Intente recargar.");
  }
};


export const upsertRegistroLuegoDeUnificar = async (registro: RegistroPosicion): Promise<void> => {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("uuid_idx"); // Usamos el índice de UUID que ya tienes creado

    // 1. Buscamos si ya existe ese UUID
    const requestBusqueda = index.get(registro.uuid);

    requestBusqueda.onsuccess = () => {
      const registroExistente = requestBusqueda.result;

      if (registroExistente) {
        // 2. Si existe, actualizamos manteniendo el ID original de IndexedDB
        const registroActualizado = { ...registro, id: registroExistente.id };
        store.put(registroActualizado);
      } else {
        // 3. Si no existe, lo agregamos como nuevo
        // Borramos el 'id' por si el GeoJSON trae uno, para que IndexedDB genere el suyo
        const { id, ...nuevoSinId } = registro as any;
        store.add(nuevoSinId);
      }
    };

    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
};
