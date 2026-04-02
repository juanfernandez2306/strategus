import LZString from "lz-string";

export const servicioCompresion = {
  /**
   * Comprime el string del QR para reducir su tamaño físico
   */
  comprimir: (data: string): string => {
    return LZString.compressToEncodedURIComponent(data);
  },

  /**
   * Descomprime el string leído por la cámara
   */
  descomprimir: (data: string): string => {
    const resultado = LZString.decompressFromEncodedURIComponent(data);
    if (!resultado) throw new Error("Error al descomprimir: Datos corruptos o formato inválido");
    return resultado;
  }
};