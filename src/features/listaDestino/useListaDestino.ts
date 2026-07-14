// src/hooks/useListaDestino.ts
import { useState, useRef, useEffect, useMemo } from "react";
import { useRegistroSidebar } from "./useRegistroSidebar"; 
import { useSensorManager } from "../mapa/sensor/useSensorManager";
import { useSistemaStore } from "../mapa/hooks/useSistemaStore"; 
import { type SidebarData } from "../../types"; 
import { ServicioNavegacion } from "../mapa/sensor/navegacion/ServicioNavegacion";
import { actualizarEstadoRevisionDB, eliminarPalmaYRegistroDB } from "../../services/indexedbd/palmaActions";




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

      if (instanciasMontadasGlobal === 0) {
        console.log("🧹 Reseteando filtros y distancias residuales de las tarjetas...");
        
        // 1. Recorremos cada motor individual y llamamos a su método nativo de limpieza
        motoresNavegacionRef.current.forEach((motor) => {
          motor.resetearNavegacion();
        });

        // 2. Vaciamos por completo el Map para liberar memoria RAM del dispositivo
        motoresNavegacionRef.current.clear();
      }

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

    const registrosPendientes = listaRegistros.filter(item => !item.revision_planta);

    const mapeados = registrosPendientes.map((item) => {
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

    if (posicionUsuario.lng !== 0 && posicionUsuario.lat !== 0) {
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
  // 1. Si no hay una palma seleccionada en el estado del hook, abortamos
  if (!puntoSeleccionado) return;

  try {
    console.log("Marcar Palma: Modificando estado en IndexedDB...");

    // 2. Calculamos el nuevo estado de revisión invertido (igual que tu función original)
    const nuevoEstado = !puntoSeleccionado.revision_planta;

    // 3. Ejecutamos la transacción asíncrona en tu base de datos local
    // Nota: Asegúrate de que 'actualizarEstadoRevisionDB' esté importado en este archivo de hooks
    const exito = await actualizarEstadoRevisionDB(puntoSeleccionado.uuid, nuevoEstado);

    if (exito) {
      console.log(`Palma ${puntoSeleccionado.uuid} actualizada con éxito a: ${nuevoEstado}`);

      // 4. Sincronizamos el estado local del Sidebar por si sigue abierto visualmente
      setPuntoSeleccionado({ 
        ...puntoSeleccionado, 
        revision_planta: nuevoEstado 
      });

      // 5. Apagamos inmediatamente el destino en Zustand para detener las ráfagas del GPS/Brújula
      setPosicionDestino(null);

      // 6. Cerramos el Sidebar
      setSidebarOpen(false);

      // 7. Refrescamos la consulta de IndexedDB para que la lista lineal se actualice y ordene sola
      await refrescarSidebar(); 
    } else {
      console.warn("La base de datos rechazó la actualización del punto.");
    }
  } catch (err) {
    console.error("Error crítico al confirmar la visita en IndexedDB:", err);
  }
};

 const handleEliminarPunto = async (uuid: string): Promise<string> => {
    try {
      console.log(`Eliminar Punto: Solicitando borrado de UUID: ${uuid} en IndexedDB...`);
      
      // Ejecutamos el borrado real en IndexedDB utilizando tu servicio
      const respuesta = await eliminarPalmaYRegistroDB(uuid);
      
      // Limpiamos los rumbos en Zustand y cerramos el Sidebar de inmediato
      setPosicionDestino(null);
      setSidebarOpen(false);
      
      // Forzamos la actualización de la lista en pantalla para remover la tarjeta
      await refrescarSidebar();
      
      console.log("Eliminar Punto: Sincronización de listado posterior al borrado exitosa.");
      return respuesta;
    } catch (err) {
      console.error("Error crítico en el proceso de eliminación desde useListaDestino:", err);
      return "Error al eliminar";
    }
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