// src/hooks/useDescargarGeoJSON.ts
import { point, featureCollection } from '@turf/turf'; 
import { obtenerRegistrosPosicionPorFecha } from '../services/indexedbd/palmaQueries';
import { getOrCreateDeviceId, getDeviceModel } from "../services/deviceID";

export const useDescargarGeoJSON = () => {
  
  const generarYDescargar = async (fecha: string): Promise<string> => {
    // 1. Buscamos en IndexedDB con tu servicio
    const registrosRaw = await obtenerRegistrosPosicionPorFecha(fecha);

    if (registrosRaw.length === 0) {
      throw new Error(`No hay datos para el día ${fecha}`);
    }

    // 2. Convertimos a Formato GeoJSON usando Turf
    // IMPORTANTE: Turf usa [longitud, latitud] (Igual que QGIS/GeoJSON estándar)
    const features = registrosRaw.map(r => {

      const { longitud, latitud, ...propiedadesRestantes } = r;

      return point([Number(r.longitud), Number(r.latitud)], {
        ...propiedadesRestantes
      });
    });

    const coleccion = featureCollection(features);
    
    // 3. Crear el archivo (Blob)
    const contenido = JSON.stringify(coleccion, null, 2);
    const blob = new Blob([contenido], { type: "application/geo+json" });

    // 4. Lógica de nombre de archivo (Device ID + Modelo)
    const deviceId = getOrCreateDeviceId().substring(0, 8);
    const model = getDeviceModel();
    const nombreArchivo = `puntos_${model}_${deviceId}_${fecha}.geojson`;

    // 5. Disparar descarga
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);

    return "Capa GeoJSON lista para QFIELD";
  };

  return { generarYDescargar };
};