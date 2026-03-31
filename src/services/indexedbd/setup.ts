/**
 * @file setup.ts
 * @description Configuración y apertura de la conexión a IndexedDB.
 * Define la estructura de la tabla 'posiciones' y sus índices de búsqueda.
 */

import { 
    DB_NAME, 
    DB_VERSION, 
    STORE_NAME 
  } from './config.ts';


/**
 * Inicializa y abre la base de datos local.
 * Configura los índices necesarios para el filtrado por fecha, UUID y estado de revisión.
 */

export const abrirDB = (): Promise<IDBDatabase> => {

  return new Promise((resolve, reject) => {

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {

      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
        store.createIndex("fecha_registro_idx", "fecha_registro", { unique: false });
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






