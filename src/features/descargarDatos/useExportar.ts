import { transformarRegistrosAGeoJSON, compartirArchivoBlob } from './services/utils';
import { obtenerRegistroFiltro } from '../../services/indexedbd/queries.ts';
import { deviceService } from "./services/device.ts"; // Tu nuevo servicio

export const useExportarTodo = () => {
  
  const ejecutarExportacionTotal = async (): Promise<string> => {
    // 1. Obtener todos los registros sin filtro
    const registrosRaw = await obtenerRegistroFiltro(null, null);

    if (registrosRaw.length === 0) {
      throw new Error("No hay datos almacenados para exportar.");
    }

    // 2. Transformar a GeoJSON usando tu utilidad
    const coleccion = transformarRegistrosAGeoJSON(registrosRaw);
    
    // 3. Preparar el archivo usando deviceService
    const contenido = JSON.stringify(coleccion, null, 2);
    const deviceId = deviceService.getOrCreateId().substring(0, 8);
    const model = deviceService.getModel();
    const fecha = new Date().toISOString().split('T')[0];
    
    const nombreArchivo = `strategus_aloeus_${model}_${deviceId}_${fecha}.geojson`;

    // 4. Compartir o Descargar
    return await compartirArchivoBlob(contenido, nombreArchivo, "application/geo+json");
  };

  return { ejecutarExportacionTotal };
};