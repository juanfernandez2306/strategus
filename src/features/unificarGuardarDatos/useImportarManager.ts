
import { useState } from "react";
import { transformarGeoJSONaRegistros } from "./geojsonTransform.ts";
import { upsertRegistroLuegoDeUnificar } from "../../services/indexedbd/palmaActions";

export const useImportarManager = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const procesarArchivos = async (fileList: FileList | null): Promise<string> => {
        if (!fileList) throw new Error("No se seleccionaron archivos");
        
        setIsProcessing(true);
        let total = 0;

        try {
            for (const file of Array.from(fileList)) {
                const texto = await file.text();
                const registros = transformarGeoJSONaRegistros(texto);

                // Guardado secuencial para evitar colisiones en IndexedDB
                for (const reg of registros) {
                    await upsertRegistroLuegoDeUnificar(reg);
                    total++;
                }
            }
            return `Sincronización exitosa: ${total} puntos procesados.`;
        } finally {
            setIsProcessing(false);
        }
    };

    return { procesarArchivos, isProcessing };
};