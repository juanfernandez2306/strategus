import { useEffect, useRef, useCallback } from "react";
import { type Map as MapLibreMap } from 'maplibre-gl';
import { type SidebarData } from "../../../types";


import { useSistemaStore } from "../hooks/useSistemaStore";
import { useMapa } from "../hooks/useMap";


export const useMapManager = () => {

    const sistemaListo = useSistemaStore((s) => s.sistemaListo);

    /**actualizacion y asignacion de la bandera de sistemaListo */
    const sistemaListoRef = useRef(sistemaListo);

    useEffect(() => { 
        sistemaListoRef.current = sistemaListo; 
    }, [sistemaListo]);

    /** creacion de la referencia del mapa */
    const mapDivRef = useRef<HTMLDivElement>(null);

    /** */
    const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const handlePointClick = useCallback((datos: SidebarData) => {
        
        if (!sistemaListoRef.current) {
          console.warn("Interacción bloqueada: Sensores no listos");
          return; 
        }
        
        setDetallePunto(datos);
        setIsSidebarOpen(true);
    
      }, []);

    const { inicializarMapa, refrescarPunto, mapInstance } = useMapa(handlePointClick);

    useEffect(() => {

        let instanciaMapaLocal: MapLibreMap | null = null;

        let componenteMontado = true;

        const montarSistema = async () => {

        if (!mapDivRef.current) return;

        const mapa = await inicializarMapa(mapDivRef.current);

        if (!componenteMontado) {
            console.log("Abortando: El componente se desmontó antes de que el mapa terminara de cargar");
            mapa?.remove();
            return;
        }

        if (mapa) instanciaMapaLocal = mapa;

    };

    montarSistema();

    return () => {
      componenteMontado = false;
      if (instanciaMapaLocal) {
        console.log("Limpiando instancia de mapa...");
        instanciaMapaLocal.remove();
      };
    };
    
  }, [inicializarMapa]);

}