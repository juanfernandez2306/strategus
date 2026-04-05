import dayjs from "dayjs";
import { obtenerRegistroFiltro } from "./queries.ts";
import { type RegistroPosicion, type SidebarData } from "../../types/index.ts";

export const obtenerRegistrosPosicionPorFecha = async (fecha: string) : Promise<RegistroPosicion[]>=>  
  obtenerRegistroFiltro("fecha_registro_idx", fecha);

export const obtenerConteoRegistrosDelDia = async (): Promise<number> => {

  const fechaHoy = dayjs().format("YYYY-MM-DD");

  try {
    const registros = await obtenerRegistroFiltro(
      "fecha_registro_idx", 
      fechaHoy);
    
    return registros.length;

  } catch (error) {
    throw new Error("No se pudo obtener el conteo de hoy. Intente recargar.");
  }
};

export const obtenerConteoRegistrosRevisadosDelDia = async (): Promise<number> => {

  const fechaHoy = dayjs().format("YYYY-MM-DD");

  try {
    const registros = await obtenerRegistroFiltro(
      "fecha_revision_idx", 
      fechaHoy);
    
    return registros.length;

  } catch (error) {
    throw new Error("No se pudo obtener el conteo de hoy. Intente recargar.");
  }
};

/**
 * Obtiene todos los puntos y los formatea para el Sidebar y el Mapa.
 * Utiliza el motor genérico sin filtros para traer toda la base de datos.
 */
export const obtenerRegistroSidebarData = async (): Promise<SidebarData[]> => {
  try {
    // 1. Pedimos todos los registros al motor (sin filtros)
    const registros: RegistroPosicion[] = await obtenerRegistroFiltro(null, null);
    
    // 2. Mapeamos al formato ligero que necesita la UI del Sidebar/Mapa
    return registros.map((reg) => ({
      uuid: reg.uuid,
      lat: reg.latitud,
      lng: reg.longitud,
      revision_planta: reg.revision_planta
    }));

  } catch (error) {
    console.error("Error al obtener datos para el Sidebar:", error);
    // Retornamos array vacío para que el mapa no rompa la app
    return [];
  }
};

/**
 * Retorna la suma aritmética de los valores del campo 'galeria' 
 * de todos los registros capturados el día de hoy.
 * * @returns {Promise<number>} La suma total (ej. si hay dos registros de Galería 5, retorna 10)
 */
export const obtenerSumaTotalGaleriasHoy = async (): Promise<number> => {
  const fechaHoy = dayjs().format("YYYY-MM-DD");

  try {
    // Reutilizamos tu lógica de filtrado por índice de fecha
    const registros = await obtenerRegistroFiltro(
      "fecha_registro_idx", 
      fechaHoy
    );

    // Sumamos aritméticamente el valor del campo 'galeria'
    const suma = registros.reduce((acumulador, reg) => {
      // Aseguramos la conversión a número por seguridad
      const valor = Number(reg.galeria) || 0;
      return acumulador + valor;
    }, 0);

    return suma;

  } catch (error) {
    console.error("Error al sumar galerías:", error);
    throw new Error("No se pudo calcular la suma de galerías de hoy.");
  }
};