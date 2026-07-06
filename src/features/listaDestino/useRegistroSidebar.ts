import { useState, useEffect, useCallback } from "react";
import { obtenerRegistroSidebarData } from "../../services/indexedbd/palmaQueries";
import { type SidebarData } from "../../types/index";

interface UseRegistroSidebarReturn {
  data: SidebarData[];
  cargando: boolean;
  error: string | null;
  refrescarSidebar: () => Promise<void>;
}


export const useRegistroSidebar = (): UseRegistroSidebarReturn => {
  const [data, setData] = useState<SidebarData[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Memorizamos la función de carga para evitar re-renders innecesarios
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);
      
      
      const registros = await obtenerRegistroSidebarData();

      const registrosPendientes = registros.filter((reg) => reg.revision_planta === false);

      setData(registrosPendientes);

    } catch (err) {

      console.error("Error en useRegistroSidebar:", err);

      setError("No se pudieron cargar los datos del almacenamiento local.");

    } finally {
      setCargando(false);
    }
  }, []);

  // Efecto que dispara la carga inicial o cuando cambia el filtro de pendientes
  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  return {
    data,
    cargando,
    error,
    refrescarSidebar: cargarDatos
  };
  
};

export default useRegistroSidebar;