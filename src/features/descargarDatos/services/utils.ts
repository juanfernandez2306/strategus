
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


export const compartirArchivoBlob = async (
    contenido: string, 
    nombreArchivo: string, 
    tipo: string
): Promise<string> => {
  
  const file = new File([contenido], nombreArchivo, { type: tipo });
  const canShare = navigator.canShare && navigator.canShare({ files: [file] });

  // Si el navegador dice que "podría" compartir...
  if (canShare) {
    try {
      await navigator.share({
        files: [file],
        title: nombreArchivo,
        text: `Exportación: ${nombreArchivo}`,
      });
      return "Archivo compartido correctamente";
    } catch (error: any) {
      // Si el error es por falta de permisos (como en tu caso) o cancelación
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        console.warn("Permiso denegado o cancelado. Aplicando descarga de respaldo...");
        descargarArchivoBlob(file, nombreArchivo);
        return "El sistema bloqueó el compartir. El archivo se descargó automáticamente.";
      }
      throw new Error(`Error al compartir: ${error.message}`);
    }
  } else {
    // Si de entrada el navegador no soporta la API (PC o navegadores viejos)
    descargarArchivoBlob(file, nombreArchivo);
    return "Navegador no compatible. El archivo se descargó automáticamente.";
  }
};