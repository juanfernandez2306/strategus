import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Drawer, IconButton, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// --- NUEVOS HOOKS REFACTORIZADOS ---
import { useMapa } from './hooks/useMap'; 
import { useNavigation } from './hooks/useNavegation';

// --- SERVICIOS Y TIPOS ---
import { actualizarEstadoRevisionDB } from '../../services/indexedbd/palmaActions'; 
import { type SidebarData } from '../../types';
import Compass, { type CompassHandle }  from '../../components/Compass';

import "maplibre-gl/dist/maplibre-gl.css";

import { ConfirmButton } from './components/BtnRevision';

export const MapLibre: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Referencia para la brújula (actualizada por el navOrchestrator a 60fps)
  const compassRef = useRef<CompassHandle>(null);
  
  // Ref para sincronizar el estado de error de los sensores con la UI
  const ultimoMensajeRef = useRef<string | null>(null);

  // 1. Callback de click en punto (se pasa al orquestador a través del hook)
  const handlePointClick = useCallback((datos: SidebarData) => {
    // Si hay un error crítico de GPS (fuera de área), bloqueamos la interacción
    if (ultimoMensajeRef.current) return; 
    
    setDetallePunto(datos);
    setIsSidebarOpen(true);
  }, []);

  // 2. Inicialización del nuevo Hook de Mapa
  const { inicializarMapa, refrescarPunto, mensajeError } = useMapa(handlePointClick);

  // Sincronizamos el ref de mensaje para el callback de click
  useEffect(() => {
    ultimoMensajeRef.current = mensajeError;
  }, [mensajeError]);
  
  // 3. Activación del Hook de Navegación
  // Se encarga de encender/apagar el navOrchestrator automáticamente
  useNavigation(
    detallePunto?.lat ?? null,
    detallePunto?.lng ?? null,
    compassRef
  );

  // 4. Montaje del mapa al inicio
  useEffect(() => {
    let objetoMapa: any = null;

    if (mapDivRef.current) {
      // Capturamos la instancia del mapa que devuelve la función
      inicializarMapa(mapDivRef.current).then(map => {
        objetoMapa = map;
      });
    }

    return () => {
    if (objetoMapa) {
        console.log("Destruyendo instancia de mapa para liberar WebGL");
        objetoMapa.remove(); 
      }
    };

  }, [inicializarMapa]);

  // 5. Lógica de negocio (Actualización de DB y Refresco de Capas)
  const handleConfirmarVisita = async () => {
    if (!detallePunto) return;

    const nuevoEstado = !detallePunto.revision_planta;
    const exito = await actualizarEstadoRevisionDB(detallePunto.uuid, nuevoEstado);

    if (exito) {
      setDetallePunto({ ...detallePunto, revision_planta: nuevoEstado });
      // Refrescamos solo la capa de puntos/clústeres sin recargar el mapa
      refrescarPunto();
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* CONTENEDOR DEL MAPA (Mantiene la estética original) */}
      <Box ref={mapDivRef} sx={{ width: '100%', height: 'calc(100vh - 100px)', zIndex: 1 }} />

      <Drawer
        anchor="bottom"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '100%', sm: '450px' },
              margin: '0 auto',
              // Mantenemos tus bordes estéticos
              borderRadius: '28px 28px 0 0', 
              height: 'auto',
              minHeight: '400px', // Espacio suficiente para el Compass (260px) + Botón
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
            }
          }
        }}
>
  {/* Botón de cerrar independiente para no mover el centro */}
  <IconButton 
    onClick={() => setIsSidebarOpen(false)}
    sx={{ position: 'absolute', right: 15, top: 15, zIndex: 20 }}
  >
    <CloseIcon />
  </IconButton>

  {/* CONTENEDOR JERÁRQUICO CENTRAL */}
  <Box sx={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', // Justificado vertical
    alignItems: 'center',     // Alineado horizontal (centro)
    p: 4,
    pt: 6, // Espacio para que respire arriba
    gap: 4  // Espacio consistente entre Compass y Botón
  }}>
    
    {/* 1. COMPASS (Primero que se ve) */}
    {detallePunto && (
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Compass ref={compassRef} size={260} />
      </Box>
    )}

    {/* 3. BOTÓN DE ACTUALIZAR (Seguidamente) */}
    <ConfirmButton 
      onClick={handleConfirmarVisita} 
      detallePunto={detallePunto} 
    />

  </Box>
</Drawer>

      {/* SNACKBAR DE ERRORES (Mantiene la lógica de visibilidad de los nuevos servicios) */}
      <Snackbar 
        open={Boolean(mensajeError)} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" sx={{ width: '100%', fontWeight: 'bold' }}>
          {mensajeError}
        </Alert>
      </Snackbar>

    </Box>
  );
};