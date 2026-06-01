
import { useState, useEffect } from "react";
import { 
    obtenerConteoRegistrosDelDia,
    obtenerConteoRegistrosRevisadosDelDia,
  } from "../../services/indexedbd/palmaQueries"; 

export const useResumenJornada = () => {
  const [resumen, setResumen] = useState({
    registrados: 0,
    revisados: 0,
    cargando: true
  });

  const cargarDatos = async () => {
    try {
      const [total, revisados] = await Promise.all([
        obtenerConteoRegistrosDelDia(),
        obtenerConteoRegistrosRevisadosDelDia()
      ]);
      
      setResumen({
        registrados: total,
        revisados: revisados,
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