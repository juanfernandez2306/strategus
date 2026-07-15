// src/mapa/components/SidebarAdministration.tsx
import { motion } from 'framer-motion';
import { type SidebarData } from '../../../../types';
import IconDeleteDB from '../../../../components_svg/IconDeleteDB';
import sidebarStyles from '../MapSidebar.module.css';
import formStyles from '../../../../components/FormBaseLayout.module.css';

import { useSidebarAdministration } from './hooks/useSidebarAdministration';

interface SidebarAdministrationProps {
  detallePunto: SidebarData;
  onEliminarPunto: (uuid: string) => Promise<string>;
  onClose: () => void;
  refrescarMapa?: () => void;
  onStartDeleting: (deleting: boolean) => void;
}

export const SidebarAdministration = ({
  detallePunto,
  onEliminarPunto,
  onClose,
  refrescarMapa,
  onStartDeleting,
}: SidebarAdministrationProps) => {
  
  const { isDeleting, mensajeFeedback, isError, handleDeleteClick } =
    useSidebarAdministration({
      detallePunto,
      onEliminarPunto,
      refrescarMapa,
      onStartDeleting,
    });

  // CASO A: Spinner de carga procesando eliminación
  if (isDeleting) {
    return (
      <motion.div
        className={sidebarStyles.spinnerContainer}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className={formStyles.spinner} />
        <p style={{ fontWeight: '500', color: '#4a5568', marginTop: '0.5rem' }}>
          Procesando eliminación local...
        </p>
      </motion.div>
    );
  }

  // CASO B: Renderizado de Mensaje de Éxito / Error
  if (mensajeFeedback) {
    return (
      <motion.div
        className={sidebarStyles.feedbackWrapper}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isError ? (
          <div className={`${formStyles.iconWrapper} ${formStyles.error}`}>
            <div className={formStyles.errorIcon} />
          </div>
        ) : (
          <div className={`${formStyles.iconWrapper} ${formStyles.success}`}>
            <div className={formStyles.checkIcon} />
          </div>
        )}

        <p className={isError ? formStyles.errorText : formStyles.successText}>
          {mensajeFeedback}
        </p>

        <button
          type="button"
          className={formStyles.closeButton}
          onClick={onClose}
        >
          Cerrar
        </button>
      </motion.div>
    );
  }

  // CASO C: Panel de Administración Regular
  return (
    <motion.div
      key="admin-tab-content"
      className={sidebarStyles.adminPanel}
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.15 }}
    >
      <IconDeleteDB size={100} />
      <h4 className={sidebarStyles.adminTitle}>Gestión del Punto</h4>
      <p className={sidebarStyles.adminMeta}>
        <strong>UUID:</strong> {detallePunto.uuid} <br />
        <strong>Coordenadas:</strong> {detallePunto.lat.toFixed(6)},{' '}
        {detallePunto.lng.toFixed(6)}
      </p>

      <button
        type="button"
        className={sidebarStyles.btnDelete}
        onClick={handleDeleteClick}
        disabled={isDeleting}
      >
        ELIMINAR PUNTO Y REGISTRO
      </button>
    </motion.div>
  );
};