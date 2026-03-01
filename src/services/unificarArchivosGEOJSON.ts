import { featureCollection } from "@turf/helpers";

/**
 * Unifica varios archivos GeoJSON en una sola FeatureCollection.
 */
const unificarArchivosGeoJSON = async (fileList: FileList | null): Promise<Blob> => {
  if (!fileList || fileList.length === 0) {
    throw new Error("No se seleccionó ningún archivo para unificar.");
  }

  let allFeatures: any[] = [];

  const promises = Array.from(fileList).map(
    (file) =>
      new Promise<void>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const geojson = JSON.parse(content);

            // Validamos que el archivo tenga el formato correcto y extraemos sus features
            if (geojson.type === "FeatureCollection" && Array.isArray(geojson.features)) {
              allFeatures = allFeatures.concat(geojson.features);
            } else if (geojson.type === "Feature") {
              allFeatures.push(geojson);
            }

            resolve();
          } catch (err) {
            reject(new Error(`Error al procesar ${file.name}: Formato GeoJSON inválido.`));
          }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      })
  );

  await Promise.all(promises);

  // Creamos la nueva FeatureCollection unificada usando Turf
  const unifiedGeoJSON = featureCollection(allFeatures);
  const contenido = JSON.stringify(unifiedGeoJSON, null, 2);

  return new Blob([contenido], { type: "application/geo+json;charset=utf-8;" });
};

export default unificarArchivosGeoJSON;