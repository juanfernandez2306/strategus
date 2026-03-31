import { upsertRegistroLuegoDeUnificar } from "../services/indexedbd/palmaActions"; 
import { type RegistroPosicion } from "../types";

export const useImportarGeoJSON = () => {
    
    const importarABaseDeDatos = async (fileList: FileList | null): Promise<string> => {
        if (!fileList || fileList.length === 0) throw new Error("No se seleccionó ningún archivo.");

        const registrosValidados: RegistroPosicion[] = [];

        for (const file of Array.from(fileList)) {
            const contenido = await file.text();
            let geojson;
            
            try {
                geojson = JSON.parse(contenido);
            } catch {
                throw new Error("formato de archivos incompatible: JSON mal formado");
            }

            const features = geojson.type === "FeatureCollection" ? geojson.features : [geojson];

            for (const feat of features) {
                const coords = feat?.geometry?.coordinates;
                const props = feat?.properties || {};

                // --- VALIDACIÓN DE GEOMETRÍA (Indispensable) ---
                if (!coords || !Array.isArray(coords) || coords.length < 2) {
                    throw new Error("formato de archivos incompatible: Falta geometría en los puntos");
                }

                // --- CONSTRUCCIÓN Y NORMALIZACIÓN ---
                // Si no hay precisión, ponemos -1 como marca de "no disponible"
                const precisionValor = props.precision !== undefined ? Number(props.precision) : -1;

                const registroMapeado: any = {
                    uuid: props.uuid,
                    latitud: Number(coords[1]),
                    longitud: Number(coords[0]),
                    precision: precisionValor,
                    fecha_registro: props.fecha_registro || props.fecha,
                    hora_registro: props.hora_registro || props.hora,
                    galeria: Number(props.galeria),
                    revision_planta: props.revision_planta === true,
                    sincronizacion: props.sincronizacion,
                    fecha_revision: props.fecha_revision || null,
                    hora_revision: props.hora_revision || null
                };

                // --- COMPROBACIÓN DE TIPOS ESTRICTA ---
                const esValido = 
                    typeof registroMapeado.uuid === 'string' &&
                    !isNaN(registroMapeado.latitud) &&
                    !isNaN(registroMapeado.longitud) &&
                    typeof registroMapeado.revision_planta === 'boolean';

                if (!esValido) {
                    throw new Error("formato de archivos incompatible: Tipos de datos inválidos para RegistroPosicion");
                }

                registrosValidados.push(registroMapeado as RegistroPosicion);
            }
        }

        // Si el código llega aquí, es que TODO el archivo es válido. Grabamos.
        for (const registro of registrosValidados) {
            await upsertRegistroLuegoDeUnificar(registro);
        }

        return `Sincronización exitosa: ${registrosValidados.length} registros actualizados en BD.`;
    };

    return { importarABaseDeDatos };
};