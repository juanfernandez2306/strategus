// src/mapa/components/MapSidebar.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSistemaStore } from '../hooks/useSistemaStore';

import { SidebarNavigation } from './SidebarMap/SidebarNavigation';
import { SidebarAdministration } from './SidebarMap/SidebarAdministration';

import mapStyles from '../MapLibreGL.module.css';
import sidebarStyles from './MapSidebar.module.css';

interface MapSidebarProps {
  onConfirmarVisita: () => Promise<void>;
  onEliminarPunto: (uuid: string) => Promise<string>; 
  refrescarMapa?: () => void; 
  compassRef: React.RefObject<any>;
}

export const MapSidebar = ({
  onConfirmarVisita,
  onEliminarPunto,
  refrescarMapa,
  compassRef,
}: MapSidebarProps) => {
  const [activeTab, setActiveTab] = useState<'navigation' | 'administration'>('navigation');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

   
  const detallePunto = useSistemaStore((s) => s.detallePunto);
  const setDetallePunto = useSistemaStore((s) => s.setDetallePunto);

  const isOpen = detallePunto !== null;

  
  const [copiaPunto, setCopiaPunto] = useState(detallePunto);

  useEffect(() => {
    if (detallePunto) {
      setCopiaPunto(detallePunto);
    }
  }, [detallePunto]);

  // Restablecer la pestaña activa al abrir
  useEffect(() => {
    if (isOpen) {
      setActiveTab('navigation');
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleCloseClick = () => {
    if (isDeleting) return; 
    setDetallePunto(null);
  };

  return (
    <motion.section
      className={mapStyles.drawerOverlay}
      onClick={handleCloseClick}
      animate={{ 
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none' 
      }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={mapStyles.drawerPaper}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: isOpen ? 0 : '100%' }}
        // 🌟 TRANSICIÓN MÁS SUAVE Y PAUSADA (600ms en salida, resorte ágil en entrada)
        transition={
          isOpen
            ? { type: 'spring', stiffness: 220, damping: 26 } 
            : { type: 'tween', duration: 0.55, ease: 'easeOut' }
        }
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
                onClose={handleCloseClick}
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