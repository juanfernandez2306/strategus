// src/hooks/useListaDestino.ts
import { useState, useRef, useEffect, useMemo } from "react";
import { useRegistroSidebar } from "./useRegistroSidebar"; 
import { useSensorManager } from "../mapa/sensor/useSensorManager";
import { useSistemaStore } from "../mapa/hooks/useSistemaStore"; 
import { type SidebarData } from "../../types"; 
import { ServicioNavegacion } from "../mapa/sensor/navegacion/ServicioNavegacion";

// Variable global al archivo para contar cuántas instancias de la pantalla están pidiendo hardware
let instanciasMontadasGlobal = 0;

export const useListaDestino = () => {
  const { data: listaRegistros, cargando, error, refrescarSidebar } = useRegistroSidebar();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<SidebarData | null>(null);

  const motoresNavegacionRef = useRef<Map<string, ServicioNavegacion>>(new Map());

  const posicionUsuario = useSistemaStore((state) => state.posicionGPS); 
  const setPosicionDestino = useSistemaStore((state) => state.setPosicionDestino);
  const mensajeError = useSistemaStore((state) => state.mensajeError);
  const sistemaListo = useSistemaStore((state) => state.sistemaListo);

  const compassRef = useRef<any>(null);
  const { encenderSensores } = useSensorManager(compassRef);

  // Referencia estática compartida para guardar la función de apagado única
  const apagarSensoresRef = useRef<(() => void) | null>(null);

  // ─── CONTROL DE HARDWARE EVITANDO MICRO-REINICIOS (PATRÓN DE CONTEO) ───
  useEffect(() => {
    // Incrementamos el contador de pantallas activas
    instanciasMontadasGlobal++;

    // Si es la primera pantalla que se monta, encendemos el hardware real
    if (instanciasMontadasGlobal === 1 && !apagarSensoresRef.current) {
      console.log("Montando ListaDestino: Encendiendo hardware unificado por primera vez.");
      apagarSensoresRef.current = encenderSensores();
    } else {
      console.log("ListaDestino remachada: Evitando reinicio innecesario de sensores.");
    }

    return () => {
      // Decrementamos el contador al desmontar
      instanciasMontadasGlobal--;

      // Usamos un pequeño timeout de 50ms para verificar si React va a volver a montar el componente de inmediato (StrictMode)
      setTimeout(() => {
        // Si el contador llegó a 0 y nadie más reclamó el hardware, apagamos de verdad
        if (instanciasMontadasGlobal === 0 && apagarSensoresRef.current) {
          console.log("Desmontando ListaDestino: No quedan pantallas activas. Apagando sensores de raíz.");
          apagarSensoresRef.current();
          apagarSensoresRef.current = null;
          
          // Limpiamos el almacén global al apagar por completo
          useSistemaStore.getState().setPosicionDestino(null);
        }
      }, 50);
    };
  }, [encenderSensores]);

  // ─── MOTOR DE CÁLCULO Y ORDENAMIENTO EN TIEMPO REAL ───
  const registrosConDistancia = useMemo(() => {
    if (!listaRegistros) return [];

    const mapeados = listaRegistros.map((item) => {
      let distanciaFiltrada = 0;

      if (posicionUsuario) {
        if (!motoresNavegacionRef.current.has(item.uuid)) {
          motoresNavegacionRef.current.set(item.uuid, new ServicioNavegacion());
        }

        const motor = motoresNavegacionRef.current.get(item.uuid)!;
        const resultado = motor.calcularNavegacion(
          { lat: posicionUsuario.lat, lng: posicionUsuario.lng },
          { lat: item.lat, lng: item.lng },
          0
        );

        distanciaFiltrada = resultado.distanciaFiltrada;
      }

      return {
        ...item,
        distanciaCalculada: distanciaFiltrada
      };
    });

    if (posicionUsuario) {
      mapeados.sort((a, b) => a.distanciaCalculada - b.distanciaCalculada);
    }

    return mapeados;
  }, [listaRegistros, posicionUsuario]);

  const handleAbrirNavegacion = (item: SidebarData) => {
    setPuntoSeleccionado(item);
    setPosicionDestino({ lng: item.lng, lat: item.lat });
    setSidebarOpen(true);
  };

  const handleConfirmarVisita = async () => {
    setSidebarOpen(false);
    refrescarSidebar(); 
  };

  const handleEliminarPunto = async (uuid: string): Promise<string> => {
    setSidebarOpen(false);
    refrescarSidebar();
    return `Punto eliminado ${uuid}`;
  };

  return {
    cargando,
    error,
    mensajeError,
    sistemaListo,
    registrosConDistancia,
    sidebarOpen,
    puntoSeleccionado,
    compassRef,
    setSidebarOpen,
    handleAbrirNavegacion,
    handleConfirmarVisita,
    handleEliminarPunto
  };
};