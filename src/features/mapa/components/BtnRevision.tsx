/* --- BtnRevision.tsx CORREGIDO --- */
import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import { type SidebarData } from "../../../types";

export const ConfirmButton = ({ onClick, detallePunto }: { onClick: () => void, detallePunto: SidebarData | null }) => {
  // 1. Eliminamos el useRef para el color, dejaremos que React/MUI lo gestionen
  const [isLocked, setIsLocked] = useState(true);

  const colorActivo = detallePunto?.revision_planta ? '#ed6c02' : '#2e7d32';
  const colorBloqueado = '#b0bec5'; 

  useEffect(() => {
    const handleProximity = (e: any) => {
      const { canUpdate } = e.detail;
      // Solo actualizamos el estado. MUI se encargará del resto.
      setIsLocked(!canUpdate);
    };

    window.addEventListener('proximity-status', handleProximity);
    return () => window.removeEventListener('proximity-status', handleProximity);
  }, []);

  return (
    <Button
      variant="contained"
      fullWidth
      size="large"
      onClick={onClick}
      disabled={isLocked}
      sx={{ 
        maxWidth: '350px',
        py: 2, 
        borderRadius: 4,
        fontWeight: 'bold',
        fontSize: '1.1rem',
        textTransform: 'none',
        boxShadow: isLocked ? 'none' : '0 8px 20px rgba(0,0,0,0.1)',
        transition: 'all 0.4s ease',
        
        // --- LÓGICA DE COLOR CORREGIDA ---
        // Si está bloqueado, usa gris. Si está activo, usa su color correspondiente.
        backgroundColor: isLocked ? colorBloqueado : colorActivo,
        color: '#ffffff',

        '&:disabled': {
          backgroundColor: colorBloqueado,
          color: '#eceff1',
          opacity: 0.7
        },
        '&:hover': {
          // Aseguramos que el hover solo brille si no está bloqueado
          backgroundColor: detallePunto?.revision_planta ? '#e65100' : '#1b5e20',
        }
      }}
    >
      {detallePunto?.revision_planta ? "MARCAR COMO PENDIENTE" : "CONFIRMAR VISITA"}
    </Button>
  );
};