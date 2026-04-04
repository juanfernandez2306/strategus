
import { point, featureCollection } from '@turf/turf';
import { type RegistroPosicion } from '../../../types';

export const transformarRegistrosAGeoJSON = (registros: RegistroPosicion[]) => {
  const features = registros.map(r => {
    const { longitud, latitud, ...propiedades } = r;
    return point([Number(longitud), Number(latitud)], { ...propiedades });
  });

  return featureCollection(features);
};


// Ahora recibe el objeto ya creado, no el string
export const descargarArchivoBlob = (
    archivo: Blob | File, 
    nombreArchivo: string
) => {
  const url = URL.createObjectURL(archivo);
  const link = document.createElement("a");
  
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  
  // Limpieza
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};


/**
 * Intenta compartir un archivo usando Web Share API.
 * Si no es compatible, recurre a la descarga automática.
 * * @returns Promise<string> Mensaje de éxito para el modal de FormBaseLayout
 */
export const compartirArchivoBlob = async (
    contenido: string, 
    nombreArchivo: string, 
    tipo: string
): Promise<string> => {
  
  // 1. Creamos el objeto File (requerido por navigator.share para archivos)
  const file = new File([contenido], nombreArchivo, { type: tipo });

  // 2. Verificamos si el navegador puede compartir este archivo específico
  const canShare = navigator.canShare && navigator.canShare({ files: [file] });

  if (canShare) {
    try {
      await navigator.share({
        files: [file],
        title: nombreArchivo,
        text: `Exportación de datos: ${nombreArchivo}`,
      });
      return "Archivo compartido correctamente";
    } catch (error: any) {
      // Si el usuario cancela (AbortError), no lo tratamos como un error crítico de lógica
      if (error.name === 'AbortError') {
        return "Compartir cancelado por el usuario";
      }
      // Otros errores de sistema
      throw new Error(`Error al intentar compartir: ${error.message}`);
      console.log(error);
    }
  } else {
    /* FALLBACK: Si el navegador no soporta compartir archivos (ej. Chrome en PC),
       procedemos a la descarga tradicional para no dejar al usuario sin sus datos.
    */
    try {
        descargarArchivoBlob(file, nombreArchivo);
        return "Tu navegador no soporta compartir. El archivo se ha descargado automáticamente.";
    } catch (err) {
        throw new Error("No se pudo compartir ni descargar el archivo.");
    }
  }
};