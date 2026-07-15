// src/mapa/hooks/useSidebarAdministration.ts
import { useState } from 'react';
import { useSistemaStore } from '../../../hooks/useSistemaStore';
import { type SidebarData } from '../../../../../types';

interface UseSidebarAdministrationProps {
  detallePunto: SidebarData;
  onEliminarPunto: (uuid: string) => Promise<string>;
  refrescarMapa?: () => void;
  onStartDeleting: (deleting: boolean) => void;
}

export const useSidebarAdministration = ({
  detallePunto,
  onEliminarPunto,
  refrescarMapa,
  onStartDeleting,
}: UseSidebarAdministrationProps) => {
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  // Acciones globales de Zustand
  const { setProximityMode, setPosicionDestino } = useSistemaStore();

  const handleDeleteClick = async () => {
    const confirmar = window.confirm(
      `¿ESTÁS SEGURO?\nEsta acción eliminará permanentemente la palma y todo su registro local.\n\nUUID: ${detallePunto.uuid}`
    );

    if (!confirmar) return;

    setIsDeleting(true);
    onStartDeleting(true);
    setIsError(false);

    // Apagar sensores de navegación inmediatamente
    setPosicionDestino(null);
    setProximityMode(false);

    try {
      const respuesta = await onEliminarPunto(detallePunto.uuid);
      setMensajeFeedback(respuesta);

      // Actualizar en caliente las capas GeoJSON del mapa
      refrescarMapa?.();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'No se pudo eliminar el punto del almacenamiento local';
      setMensajeFeedback(msg);
      setIsError(true);
    } finally {
      setIsDeleting(false);
      onStartDeleting(false);
    }
  };

  return {
    isDeleting,
    mensajeFeedback,
    isError,
    handleDeleteClick,
  };
};