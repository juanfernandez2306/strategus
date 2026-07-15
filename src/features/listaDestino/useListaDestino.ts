// src/hooks/useListaDestino.ts
import { useRef, useEffect, useMemo } from "react";
import { useRegistroSidebar } from "./useRegistroSidebar"; 
import { useSensorManager } from "../mapa/sensor/useSensorManager";
import { useSistemaStore } from "../mapa/hooks/useSistemaStore"; // 🌟 Consumo unificado
import { type SidebarData } from "../../types"; 
import { ServicioNavegacion } from "../mapa/sensor/navegacion/ServicioNavegacion";
import { actualizarEstadoRevisionDB, eliminarPalmaYRegistroDB } from "../../services/indexedbd/palmaActions";

let instanciasMontadasGlobal = 0;

export const useListaDestino = () => {
  const { data: listaRegistros, cargando, error, refrescarSidebar } = useRegistroSidebar();

  const motoresNavegacionRef = useRef<Map<string, ServicioNavegacion>>(new Map());

  // 🌟 ESTADOS Y ACCIONES GLOBALES DE ZUSTAND (Nuestra única fuente de verdad)
  const posicionUsuario = useSistemaStore((state) => state.posicionGPS); 
  const mensajeError = useSistemaStore((state) => state.mensajeError);
  const sistemaListo = useSistemaStore((state) => state.sistemaListo);
  
  const detallePunto = useSistemaStore((state) => state.detallePunto);
  const setDetallePunto = useSistemaStore((state) => state.setDetallePunto);

  const compassRef = useRef<any>(null);
  const { encenderSensores } = useSensorManager(compassRef);
  const apagarSensoresRef = useRef<(() => void) | null>(null);

  // ─── CONTROL DE HARDWARE EVITANDO MICRO-REINICIOS ───
  useEffect(() => {
    instanciasMontadasGlobal++;

    if (instanciasMontadasGlobal === 1 && !apagarSensoresRef.current) {
      console.log("Montando ListaDestino: Encendiendo hardware unificado por primera vez.");
      apagarSensoresRef.current = encenderSensores();
    }

    return () => {
      instanciasMontadasGlobal--;

      if (instanciasMontadasGlobal === 0) {
        console.log("🧹 Reseteando filtros y distancias residuales...");
        motoresNavegacionRef.current.forEach((motor) => {
          motor.resetearNavegacion();
        });
        motoresNavegacionRef.current.clear();
      }

      setTimeout(() => {
        if (instanciasMontadasGlobal === 0 && apagarSensoresRef.current) {
          console.log("Desmontando ListaDestino: Apagando sensores de raíz.");
          apagarSensoresRef.current();
          apagarSensoresRef.current = null;
          
          // Limpiamos el almacén global al apagar por completo
          useSistemaStore.getState().setDetallePunto(null);
        }
      }, 50);
    };
  }, [encenderSensores]);

  // ─── MOTOR DE CÁLCULO Y ORDENAMIENTO EN TIEMPO REAL ───
  const registrosConDistancia = useMemo(() => {
    if (!listaRegistros) return [];

    const registrosPendientes = listaRegistros.filter(item => !item.revision_planta);
    const gpsEstaInicializando = !posicionUsuario || (posicionUsuario.lng === 0 && posicionUsuario.lat === 0);

    if (gpsEstaInicializando) {
      return registrosPendientes.map((item) => ({
        ...item,
        distanciaCalculada: undefined 
      }));
    }

    const mapeados = registrosPendientes.map((item) => {
      if (!motoresNavegacionRef.current.has(item.uuid)) {
        motoresNavegacionRef.current.set(item.uuid, new ServicioNavegacion());
      }

      const motor = motoresNavegacionRef.current.get(item.uuid)!;
      const resultado = motor.calcularNavegacion(
        { lat: posicionUsuario.lat, lng: posicionUsuario.lng },
        { lat: item.lat, lng: item.lng },
        0
      );

      return {
        ...item,
        distanciaCalculada: resultado.distanciaFiltrada
      };
    });

    mapeados.sort((a, b) => {
      const distA = a.distanciaCalculada ?? Infinity;
      const distB = b.distanciaCalculada ?? Infinity;
      return distA - distB;
    });

    return mapeados;
  }, [listaRegistros, posicionUsuario]);

  
  const handleAbrirNavegacion = (item: SidebarData) => {
    // Solo asignando el punto en Zustand se activa el destino GPS, 
    // se calculan los rumbos y el Sidebar detecta que debe abrirse. ¡Todo en una sola línea!
    setDetallePunto(item); 
  };

  
  const handleConfirmarVisita = async () => {
    if (!detallePunto) return;

    try {
      console.log("Marcar Palma: Modificando estado en IndexedDB...");
      const nuevoEstado = !detallePunto.revision_planta;
      const exito = await actualizarEstadoRevisionDB(detallePunto.uuid, nuevoEstado);

      if (exito) {
        console.log(`Palma ${detallePunto.uuid} actualizada con éxito.`);
        
        
        setDetallePunto(null); 
        
        
        await refrescarSidebar(); 
      }
    } catch (err) {
      console.error("Error crítico al confirmar la visita en IndexedDB:", err);
    }
  };

  
  const handleEliminarPunto = async (uuid: string): Promise<string> => {
    try {
      console.log(`Eliminar Punto: Solicitando borrado de UUID: ${uuid}...`);
      const respuesta = await eliminarPalmaYRegistroDB(uuid);
      
     
      setDetallePunto(null);
      
      // Forzamos actualización de la lista
      await refrescarSidebar();
      
      return respuesta;
    } catch (err) {
      console.error("Error crítico en eliminación:", err);
      return "Error al eliminar";
    }
  };

  return {
    cargando,
    error,
    mensajeError,
    sistemaListo,
    registrosConDistancia,
    compassRef,
    handleAbrirNavegacion,
    handleConfirmarVisita,
    handleEliminarPunto
  };
};