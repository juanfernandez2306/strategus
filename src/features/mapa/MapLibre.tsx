import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Drawer, Typography, Button, IconButton, Stack, Divider, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// --- NUEVOS HOOKS REFACTORIZADOS ---
import { useMapa } from './hooks/useMap'; 
import { useNavigation } from './hooks/useNavegation';

// --- SERVICIOS Y TIPOS ---
import { actualizarEstadoRevisionDB } from '../../services/indexedbd/palmaActions'; 
import { type SidebarData } from '../../types';
import Compass, { type CompassHandle }  from '../../components/Compass';

import "maplibre-gl/dist/maplibre-gl.css";

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
    if (mapDivRef.current) {
      inicializarMapa(mapDivRef.current);
    }
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
      <Box ref={mapDivRef} sx={{ width: '100%', height: '100%', zIndex: 1 }} />

      <Drawer
        anchor="bottom"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="temporary" 
        PaperProps={{
          sx: { 
            borderTopLeftRadius: 24, 
            borderTopRightRadius: 24, 
            overflow: 'visible', // PERMITE QUE LA BRÚJULA FLOTE FUERA
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0px -5px 20px rgba(0,0,0,0.15)'
          }
        }}
      >

        <Box sx={{ p: 3, pt: 5, position: 'relative' }}>

          {/* CONTENEDOR DE LA BRÚJULA: Posicionado para flotar en el borde */}
          {detallePunto && (
            <Box sx={{ 
              position: 'absolute',
              top: -45, // La eleva sobre el borde del drawer
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
              bgcolor: 'white',
              borderRadius: '50%',
              p: 0.5,
              boxShadow: '0px 4px 12px rgba(0,0,0,0.15)'
            }}>
              <Compass ref={compassRef} />
            </Box>
          )}

          <IconButton 
            onClick={() => setIsSidebarOpen(false)}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {detallePunto && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Typography variant="h6" fontWeight="800" textAlign="center">
                Detalle de Navegación
              </Typography>
              
              <Divider />
              
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleConfirmarVisita}
                sx={{ 
                  py: 1.8, 
                  borderRadius: 3,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  backgroundColor: !detallePunto.revision_planta ? '#2e7d32' : '#ed6c02',
                  '&:hover': { backgroundColor: !detallePunto.revision_planta ? '#1b5e20' : '#e65100' }
                }}
              >
                {!detallePunto.revision_planta ? "Finalizar Visita" : "Marcar como Pendiente"}
              </Button>
            </Stack>
          )}



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