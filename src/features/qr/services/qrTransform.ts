import { type RegistroPosicion } from "../../../types";

const LAT_BASE = "9";
const LNG_BASE = "-72";

/**
 * Función 1: Generar la cadena de string optimizada
 * Estructura: fecha|body1|body2...
 */
export const serializarRegistrosParaQR = (registros: RegistroPosicion[]): string => {
  if (registros.length === 0) return "";

  // Header: Fecha del registro (YYMMDD) tomando el primero como referencia
  const header = registros[0].fecha_registro.replace(/-/g, "").substring(2);
  
  const bodies = registros.map(reg => {
    // Coordenadas: tomamos 5 decimales
    const latDec = reg.latitud.toString().split(".")[1]?.padEnd(5, "0").substring(0, 5) || "00000";
    const lngDec = Math.abs(reg.longitud).toString().split(".")[1]?.padEnd(5, "0").substring(0, 5) || "00000";
    
    const hora = reg.hora_registro.replace(/:/g, "");
    const galeria = reg.galeria.toString().padStart(2, "0");
    const precision = reg.precision.toString().replace(".", "").padEnd(5, "0").substring(0, 5);

    // Body base (59 caracteres)
    let body = `${latDec}${lngDec}${hora}${reg.uuid}${galeria}${precision}`;

    // Solo si tiene revisión completa, se anexan los 12 caracteres (YYMMDDHHmmss)
    if (reg.revision_planta && reg.fecha_revision && reg.hora_revision) {
      const fRev = reg.fecha_revision.replace(/-/g, "").substring(2);
      const hRev = reg.hora_revision.replace(/:/g, "");
      body += `${fRev}${hRev}`;
    }

    return body;
  });

  return `${header}|${bodies.join("|")}`;
};

/**
 * Función 2: Convertir la cadena string en el objeto RegistroPosicion[]
 */
export const deserializarQRARegistros = (qrTexto: string): RegistroPosicion[] => {
  const [header, ...bodies] = qrTexto.split("|");
  if (!header || bodies.length === 0) throw new Error("Contenido de QR inválido");

  const fechaBase = `20${header.substring(0, 2)}-${header.substring(2, 4)}-${header.substring(4, 6)}`;

  return bodies.map(body => {
    // Extraer campos fijos
    const latDec = body.substring(0, 5);
    const lngDec = body.substring(5, 10);
    const horaRaw = body.substring(10, 16);
    const uuid = body.substring(16, 52);
    const galeria = parseInt(body.substring(52, 54), 10);
    const precision = parseFloat(body.substring(54, 59)) / 1000;

    // Detectar si el body incluye datos de revisión (longitud > 59)
    const tieneRevision = body.length > 59;
    let fecha_revision = null;
    let hora_revision = null;

    if (tieneRevision) {
      fecha_revision = `20${body.substring(59, 61)}-${body.substring(61, 63)}-${body.substring(63, 65)}`;
      hora_revision = `${body.substring(65, 67)}:${body.substring(67, 69)}:${body.substring(69, 71)}`;
    }

    return {
      uuid,
      latitud: parseFloat(`${LAT_BASE}.${latDec}`),
      longitud: parseFloat(`${LNG_BASE}.${lngDec}`),
      fecha_registro: fechaBase,
      hora_registro: `${horaRaw.substring(0, 2)}:${horaRaw.substring(2, 4)}:${horaRaw.substring(4, 6)}`,
      galeria,
      precision,
      sincronizacion: false,
      revision_planta: tieneRevision,
      fecha_revision,
      hora_revision
    };
  });
};