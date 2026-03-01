
import { featureCollection } from "@turf/helpers";
import { getOrCreateDeviceId, getDeviceModel } from "../services/deviceID";
import dayjs from "dayjs";

export const useUnificarGeoJSON = () => {
    const unificarYDescargar = async (fileList: FileList | null): Promise<string> => {
        if (!fileList || fileList.length === 0) {
            throw new Error("No se seleccionó ningún archivo para unificar.");
        }

        let allFeatures: any[] = [];

        // Procesamos cada archivo
        const promises = Array.from(fileList).map(
            (file) =>
                new Promise<void>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const content = e.target?.result as string;
                            const geojson = JSON.parse(content);

                            // Extraemos las features (puntos)
                            if (geojson.type === "FeatureCollection" && Array.isArray(geojson.features)) {
                                allFeatures = allFeatures.concat(geojson.features);
                            } else if (geojson.type === "Feature") {
                                allFeatures.push(geojson);
                            }
                            resolve();
                        } catch (err) {
                            reject(new Error(`Error en ${file.name}: Formato inválido.`));
                        }
                    };
                    reader.onerror = () => reject(reader.error);
                    reader.readAsText(file);
                })
        );

        await Promise.all(promises);

        // Creamos la colección unificada
        const unifiedGeoJSON = featureCollection(allFeatures);
        const blob = new Blob([JSON.stringify(unifiedGeoJSON, null, 2)], { 
            type: "application/geo+json;charset=utf-8;" 
        });

        // Generamos el nombre con tu lógica de dispositivo
        const hoy = dayjs().format("YYYY-MM-DD");
        const deviceId = getOrCreateDeviceId().substring(0, 8);
        const model = getDeviceModel();
        const nombreFinal = `unificado_${model}_${deviceId}_${hoy}.geojson`;

        // Descargamos
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = nombreFinal;
        link.click();
        URL.revokeObjectURL(url);
        

        return "¡Capas unificadas y descargadas con éxito!";
    };

    return { unificarYDescargar };
};