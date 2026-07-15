// src/mapa/components/MapSidebar.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { type SidebarData } from '../../../types';

import { SidebarNavigation } from './SidebarMap/SidebarNavigation';
import { SidebarAdministration } from './SidebarMap/SidebarAdministration';

import mapStyles from '../MapLibreGL.module.css';
import sidebarStyles from './MapSidebar.module.css';

interface MapSidebarProps {
  isOpen: boolean; // Ahora controla la animación de posición, no el montaje
  detallePunto: SidebarData | null;
  onClose: () => void;
  onConfirmarVisita: () => Promise<void>;
  onEliminarPunto: (uuid: string) => Promise<string>; 
  refrescarMapa?: () => void; 
  compassRef: React.RefObject<any>;
}

export const MapSidebar = ({
  isOpen,
  detallePunto,
  onClose,
  onConfirmarVisita,
  onEliminarPunto,
  refrescarMapa,
  compassRef,
}: MapSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'navigation' | 'administration'>('navigation');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 💡 CACHÉ LOCAL: Retiene los datos del punto para que el contenido no quede vacío
  // inmediatamente cuando 'detallePunto' pase a ser null al cerrar.
  const [copiaPunto, setCopiaPunto] = useState<SidebarData | null>(detallePunto);

  useEffect(() => {
    if (detallePunto) {
      setCopiaPunto(detallePunto);
    }
  }, [detallePunto]);

  // Restablecer la pestaña activa al abrir el componente
  useEffect(() => {
    if (isOpen) {
      setActiveTab('navigation');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleCloseClick = () => {
    if (isDeleting) return; 
    onClose();
  };

  return (
    <motion.section
      className={mapStyles.drawerOverlay}
      onClick={handleCloseClick}
      // Controlamos la opacidad del fondo oscuro (overlay)
      animate={{ 
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none' // Evita que bloquee clics en el mapa al estar oculto
      }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className={mapStyles.drawerPaper}
        onClick={(e) => e.stopPropagation()}
        // Animación de deslizamiento basada en el estado isOpen
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 250 }}
      >
        {/* Botón superior derecho de cierre */}
        <button 
          className={mapStyles.btnClose} 
          onClick={handleCloseClick}
          disabled={isDeleting}
          style={{ opacity: isDeleting ? 0.3 : 1 }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* --- Menú de Pestañas --- */}
        {!isDeleting && (
          <nav className={sidebarStyles.tabsContainer}>
            <button
              type="button"
              className={`${sidebarStyles.tabButton} ${activeTab === 'navigation' ? sidebarStyles.tabButtonActiveNav : ''}`}
              onClick={() => setActiveTab('navigation')}
            >
              Navegación
            </button>
            <button
              type="button"
              className={`${sidebarStyles.tabButton} ${activeTab === 'administration' ? sidebarStyles.tabButtonActiveAdmin : ''}`}
              onClick={() => setActiveTab('administration')}
            >
              Administración
            </button>
          </nav>
        )}

        {/* --- Contenedor de Contenido Activo --- */}
        <div className={sidebarStyles.tabContent}>
          {/* Renderiza usando la copia cacheada para evitar que los textos desaparezcan durante el cierre */}
          {copiaPunto && (
            activeTab === 'navigation' ? (
              <SidebarNavigation
                detallePunto={copiaPunto}
                onConfirmarVisita={onConfirmarVisita}
                compassRef={compassRef}
              />
            ) : (
              <SidebarAdministration
                detallePunto={copiaPunto}
                onEliminarPunto={onEliminarPunto}
                onClose={onClose}
                refrescarMapa={refrescarMapa}
                onStartDeleting={setIsDeleting}
              />
            )
          )}
        </div>
      </motion.div>
    </motion.section>
  );
};