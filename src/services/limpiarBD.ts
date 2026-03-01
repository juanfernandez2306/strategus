
const limpiarRegistrosPosiciones = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("GeoDB", 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("posiciones", "readwrite");
      const store = transaction.objectStore("posiciones");

      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        const mensaje = "Todos los registros de 'Posiciones' fueron eliminados.";
        resolve(mensaje);
      };

      clearRequest.onerror = () => {
        console.error("Error al limpiar registros:", clearRequest.error);
        reject(clearRequest.error);
      };
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export default limpiarRegistrosPosiciones;