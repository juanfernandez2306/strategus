// src/services/geojsonTransform.ts
import { type RegistroPosicion } from "../../types";

export const transformarGeoJSONaRegistros = (contenido: string): RegistroPosicion[] => {
    const geojson = JSON.parse(contenido);
    const features = geojson.type === "FeatureCollection" ? geojson.features : [geojson];

    return features.map((feat: any) => {
        const coords = feat?.geometry?.coordinates;
        const props = feat?.properties || {};

        if (!coords || !Array.isArray(coords) || coords.length < 2) {
            throw new Error("Geometría inválida detectada en el archivo");
        }

        // Normalización estricta (como haces con el QR)
        return {
            uuid: props.uuid || crypto.randomUUID(),
            latitud: Number(coords[1]),
            longitud: Number(coords[0]),
            precision: Number(props.precision ?? -1),
            fecha_registro: props.fecha_registro || props.fecha || new Date().toISOString().split('T')[0],
            hora_registro: props.hora_registro || props.hora || "00:00:00",
            galeria: Number(props.galeria || 0),
            revision_planta: props.revision_planta === true || props.revision_planta === "true",
            sincronizacion: props.sincronizacion || false,
            fecha_revision: props.fecha_revision || null,
            hora_revision: props.hora_revision || null
        };
    });
};