import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Drawer, Typography, Button, IconButton, Stack, Divider, Snackbar, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Hooks y Servicios
import { useMapa } from '../features/mapa/hooks/useMap'; 
import { useNavigation } from '../features/mapa/hooks/useNavegation';
import { actualizarEstadoRevisionDB } from '../services/indexedbd/palmaActions'; 
import { type SidebarData } from '../types';
import Compass, { type CompassHandle }  from '../features/mapa/components/Compass';

import "maplibre-gl/dist/maplibre-gl.css";

export const MapLibre: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const compassRef = useRef<CompassHandle>(null);
  const ultimoMensajeRef = useRef<string | null>(null);

  const handlePointClick = useCallback((datos: SidebarData) => {
    if (ultimoMensajeRef.current) return; 
    setDetallePunto(datos);
    setIsSidebarOpen(true);
  }, []);

  const { inicializarMapa, refrescarPunto, mensajeError } = useMapa(handlePointClick);

  useEffect(() => {
    ultimoMensajeRef.current = mensajeError;
  }, [mensajeError]);
  
  useNavigation(
    detallePunto?.lat ?? null,
    detallePunto?.lng ?? null,
    compassRef
  );

  useEffect(() => {
    if (mapDivRef.current) inicializarMapa(mapDivRef.current);
  }, [inicializarMapa]);

  const handleConfirmarVisita = async () => {
    if (!detallePunto) return;
    const nuevoEstado = !detallePunto.revision_planta;
    const exito = await actualizarEstadoRevisionDB(detallePunto.uuid, nuevoEstado);
    if (exito) {
      setDetallePunto({ ...detallePunto, revision_planta: nuevoEstado });
      refrescarPunto();
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* MAPA */}
      <Box ref={mapDivRef} sx={{ width: '100%', height: '100%', zIndex: 1 }} />

      {/* DRAWER CON LAS PROPIEDADES RESTAURADAS */}
      <Drawer
        anchor="bottom"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="temporary" 
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              overflow: 'visible', // Permite que la brújula flote
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              // AJUSTE DE TAMAÑO SOLUCIONADO:
              minHeight: '300px', // Altura mínima para que no se vea "aplastado"
              maxHeight: '50vh',  // Altura máxima para que no tape todo el mapa
              boxShadow: '0px -10px 30px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: 'column'
            }
          }
        }}
      >
        <Box sx={{ p: 3, pt: 5, position: 'relative' }}>
          
          
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

              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">ID Palma:</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                  {detallePunto.uuid.substring(0, 12).toUpperCase()}
                </Typography>
              </Box>
              
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

      {/* SNACKBAR DE ERRORES */}
      <Snackbar open={Boolean(mensajeError)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" sx={{ width: '90vw', fontWeight: 'bold', borderRadius: 2 }}>
          {mensajeError}
        </Alert>
      </Snackbar>

    </Box>
  );
};