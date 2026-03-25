import { useEffect, useRef, useState } from 'react';
import { Box, Drawer, Typography, Button, IconButton, Stack, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Snackbar, Alert } from '@mui/material';

// Hooks y Servicios
import { useMapaLibreGLService } from '../hooks/useMapLibreGL'; 
import { actualizarEstadoRevisionDB } from '../services/servicioAlmacenamientoDB';
import { type SidebarData } from '../services/servicioTipos';

// Navegación y Brújula
import Compass, { type CompassHandle } from '../components/Compass';
import { useNavigation } from '../hooks/useNavegation';

import "maplibre-gl/dist/maplibre-gl.css";

export const MapaLibreGL: React.FC = () => {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [detallePunto, setDetallePunto] = useState<SidebarData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Referencia para manipular la Brújula sin re-renders
  const compassRef = useRef<CompassHandle>(null);

  const btnConfirmarRef = useRef<HTMLButtonElement>(null);

  // Inicializamos el Hook de Navegación
  // Se activará automáticamente cuando detallePunto tenga coordenadas
  useNavigation(
    detallePunto?.lat ?? null,
    detallePunto?.lng ?? null,
    compassRef as React.RefObject<CompassHandle>,
    btnConfirmarRef
  );

  const bloqueadoRef = useRef(false);

  const manejarClickMarker = (data: SidebarData) => {

    if (bloqueadoRef.current) {
      console.warn("Acceso al sidebar bloqueado: Acción bloqueada por estado del GPS/Área");
      return; 
    }

    setDetallePunto(data);
    setIsSidebarOpen(true);
  };

  const { inicializarMapa, refrescarPunto, mensajeError, debugAlfa } = useMapaLibreGLService(manejarClickMarker);

  // 2. Efecto separado solo para sincronizar la referencia
  useEffect(() => {
    bloqueadoRef.current = Boolean(mensajeError);
  }, [mensajeError]);

  useEffect(() => {
    if (mapDivRef.current) {
      inicializarMapa(mapDivRef.current);
    }
  }, [inicializarMapa]);

  const handleUpdateStatus = async () => {
    if (!detallePunto) return;

    // 1. Calculamos el nuevo estado
    const nuevoEstado = !detallePunto.revision_planta;

    try {
        // 2. Guardamos en IndexedDB
        await actualizarEstadoRevisionDB(detallePunto.uuid, nuevoEstado);

        // 3. ¡ESTA ES LA CLAVE! 
        // Refrescamos los datos del mapa. Como tu servicio usa 'setData', 
        // los iconos cambiarán de color sin recargar el mapa.
        await refrescarPunto();

        // 4. Actualizamos el estado local para que el botón cambie de texto/color
        setDetallePunto({
        ...detallePunto,
        revision_planta: nuevoEstado
        });

        console.log("Estado actualizado y mapa refrescado");
    } catch (error) {
        console.error("Error al actualizar el punto:", error);
    }
};

  return (
    <Box sx={{ 
      width: '100%', 
      height: 'calc(100dvh - 100px)', 
      position: 'relative', 
      overflow: 'hidden' 
    }}>
      {/* Contenedor del Mapa */}
      <Box ref={mapDivRef} sx={{ width: '100%', height: '100%' }} />

      
      {/* Sidebar de Navegación */}
      <Drawer
        anchor="right"
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        variant="temporary"
        ModalProps={{ disableScrollLock: true }}
        PaperProps={{
          sx: { 
            width: 320, 
            height: 'calc(100dvh - 100px)', 
            top: '100px', 
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column'
          }
        }}
      >
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Navegación</Typography>
            <IconButton onClick={() => setIsSidebarOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          
          <Divider sx={{ my: 1 }} />

          {/* Área de la Brújula: Centrada */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            minHeight: '280px'
          }}>
            <Compass ref={compassRef} size={250} />
          </Box>

          {detallePunto && (
            <Box sx={{ mt: 'auto' }}>
              
              <Button 
                    id="btn-confirmar-visita"
                    ref={btnConfirmarRef}
                    variant="contained" 
                    fullWidth 
                    // Quitamos el 'true' fijo para que React no lo sobreescriba al actualizar el estado
                    // El Hook se encargará de ponerlo en true o false inicialmente
                    onClick={handleUpdateStatus}
                    sx={{ 
                        py: 1.5, 
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        // Aplicamos tu nueva lógica de colores: Rojo si NO está revisado
                        backgroundColor: !detallePunto.revision_planta 
                            ? 'var(--color-primario)' 
                            : 'var(--color-secundario)',
                        color: 'var(--color-fondo)',
                        '&.Mui-disabled': {
                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)',
                        }
                    }}
                >
                    {!detallePunto.revision_planta ? "Confirmar Visita" : "Marcar como Pendiente"}
                </Button>

            </Box>
          )}
        </Box>
      </Drawer>

      <Snackbar 
            open={Boolean(mensajeError)} 
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{ mt: 2 }} // Un poco de margen superior para que no tape todo
        >
            <Alert severity="error" variant="filled" sx={{ 
              width: '100%',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
              }
                }}>
                  {mensajeError}
                <div>
                    🧭 Alfa: {debugAlfa?.toFixed(1)}° | Corr: {((debugAlfa || 0) + 180) % 360}°
                </div>
            </Alert>
        </Snackbar>

    </Box>
  );
};