
import { useState, useEffect } from "react";
import { 
    obtenerConteoRegistrosDelDia,
    obtenerConteoRegistrosRevisadosDelDia,
    obtenerSumaTotalGaleriasHoy
  } from "../../services/indexedbd/palmaQueries"; 

export const useResumenJornada = () => {
  const [resumen, setResumen] = useState({
    registrados: 0,
    revisados: 0,
    sumaGalerias: 0,
    cargando: true
  });

  const cargarDatos = async () => {
    try {
      const [total, revisados, suma] = await Promise.all([
        obtenerConteoRegistrosDelDia(),
        obtenerConteoRegistrosRevisadosDelDia(),
        obtenerSumaTotalGaleriasHoy()
      ]);
      
      setResumen({
        registrados: total,
        revisados: revisados,
        sumaGalerias: suma,
        cargando: false
      });
      
      return "Datos actualizados";
    } catch (error) {
      console.error(error);
      throw new Error("Error al cargar el resumen");
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return { ...resumen, refrescar: cargarDatos };
};