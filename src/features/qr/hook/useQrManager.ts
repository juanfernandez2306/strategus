import { useState } from 'react';
import { servicioCompresion } from '../services/compresionString.ts';
import { serializarRegistrosParaQR, deserializarQRARegistros } from '../services/qrTransform.ts'; 
import { upsertRegistroLuegoDeUnificar } from '../../../services/indexedbd/palmaActions';  
import { type RegistroPosicion } from '../../../types'; 

export const useQrManager = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * GENERACIÓN: 
   * Toma un array de registros (ej. los 36 de la jornada) y devuelve 
   * un array de strings comprimidos listos para convertirse en imágenes QR.
   */
  const generarQrsComprimidos = (registros: RegistroPosicion[], tamanoGrupo: number = 15): string[] => {
    const qrs: string[] = [];
    
    for (let i = 0; i < registros.length; i += tamanoGrupo) {
      const grupo = registros.slice(i, i + tamanoGrupo);
      const rawString = serializarRegistrosParaQR(grupo);
      const comprimido = servicioCompresion.comprimir(rawString);
      qrs.push(comprimido);
    }
    
    return qrs;
  };

  /**
   * PROCESAMIENTO:
   * Toma el texto escaneado por la cámara, lo descomprime, lo transforma 
   * en objetos y los guarda/actualiza en la DB.
   */
  const procesarEscaneo = async (textoEscaneado: string): Promise<{ success: boolean; cantidad: number }> => {
    setIsProcessing(true);
    setError(null);

    try {
      // 1. Descomprimir el string (LZString)
      const stringDescomprimido = servicioCompresion.descomprimir(textoEscaneado);

      // 2. Convertir string a objetos RegistroPosicion[]
      const registros = deserializarQRARegistros(stringDescomprimido);

      // 3. Persistir en IndexedDB
      // Usamos upsertRegistroLuegoDeUnificar para manejar duplicados por UUID
      for (const registro of registros) {
        await upsertRegistroLuegoDeUnificar(registro);
      }

      return { success: true, cantidad: registros.length };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido al procesar QR";
      setError(msg);
      return { success: false, cantidad: 0 };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    generarQrsComprimidos,
    procesarEscaneo,
    isProcessing,
    error
  };
};