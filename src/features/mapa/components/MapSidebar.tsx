import { useState, useEffect } from 'react';
import Compass from './Compass';
import { ConfirmButton } from './BtnRevision';
import { type SidebarData } from '../../../types';
import { useSistemaStore } from '../hooks/useSistemaStore'; 

// Importación modular de estilos usando Alias para evitar colisiones
import mapStyles from '../MapLibreGL.module.css';
import sidebarStyles from './MapSidebar.module.css';
import formStyles from '../../../components/FormLayoutBase.module.css'; // <-- Alias limpio para reciclar animaciones
import IconDeleteDB from '../../../components_svg/IconDeleteDB';


interface MapSidebarProps {
  isOpen: boolean;
  detallePunto: SidebarData | null;
  onClose: () => void;
  onConfirmarVisita: () => Promise<void>;
  onEliminarPunto: (uuid: string) => Promise<string>; // Tipado para recibir respuesta de IndexedDB
  refrescarMapa?: () => void; // Callback para renderizar de inmediato cambios en el mapa
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
  
  // Estados de control de flujo transaccional
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [mensajeFeedback, setMensajeFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);

  // Acciones globales de Zustand para desactivar tracking al borrar
  const { setProximityMode, setPosicionDestino } = useSistemaStore();

  // Reiniciar la máquina de estados local al abrir una nueva palma
  useEffect(() => {
    if (isOpen) {
      setActiveTab('navigation');
      setIsDeleting(false);
      setMensajeFeedback(null);
      setIsError(false);
    }
  }, [isOpen, detallePunto?.uuid]);

  if (!detallePunto) return null;

  const handleCloseClick = () => {
    if (isDeleting) return; // Bloquear cierre accidental a mitad del borrado en IndexedDB
    onClose();
  };

  const handleDeleteClick = async () => {
    const confirmar = window.confirm(
      `¿ESTÁS SEGURO?\nEsta acción eliminará permanentemente la palma y todo su registro local.\n\nUUID: ${detallePunto.uuid}`
    );
    
    if (!confirmar) return;

    setIsDeleting(true);
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
      const msg = error instanceof Error ? error.message : "No se pudo eliminar el punto del almacenamiento local";
      setMensajeFeedback(msg);
      setIsError(true);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <section
      className={`${mapStyles.drawerOverlay} ${isOpen ? mapStyles.overlayActive : ''}`}
      onClick={handleCloseClick}
    >
      <div
        className={`${mapStyles.drawerPaper} ${isOpen ? mapStyles.drawerOpen : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón superior derecho de cierre (Deshabilitado durante procesos críticos) */}
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

        {/* --- Menú de Pestañas (Se oculta durante la carga o feedback) --- */}
        {!mensajeFeedback && !isDeleting && (
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

        {/* --- Cuerpo Dinámico del Panel --- */}
        <div className={sidebarStyles.tabContent}>
          
          {/* CASO A: Spinner de carga reciclado de tus formularios */}
          {isDeleting && (
            <div className={sidebarStyles.spinnerContainer}>
              <div className={formStyles.spinner} />
              <p style={{ fontWeight: '500', color: '#4a5568', marginTop: '0.5rem' }}>Procesando eliminación local...</p>
            </div>
          )}

          {/* CASO B: Renderizado de Mensaje de Éxito / Error Animado sin dependencias */}
          {!isDeleting && mensajeFeedback && (
  <div className={sidebarStyles.feedbackWrapper}>
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
      onClick={() => {
        // Al cerrar el éxito, notificamos al layout principal para que oculte el panel
        onClose(); 
      }}
    >
      Cerrar
    </button>
  </div>
)}

          {/* CASO C: Vistas de Operación Regular */}
          {!isDeleting && !mensajeFeedback && (
            <>
              {activeTab === 'navigation' ? (
                <>
                  <Compass size={240} ref={compassRef} />
                  <div style={{ marginTop: '1rem', width: '100%' }}>
                    <ConfirmButton 
                      onClick={onConfirmarVisita} 
                      detallePunto={detallePunto} 
                    />
                  </div>
                </>
              ) : (
                <div className={sidebarStyles.adminPanel}>
                  <IconDeleteDB size={100} />
                  <h4 className={sidebarStyles.adminTitle}>Gestión del Punto</h4>
                  <p className={sidebarStyles.adminMeta}>
                    <strong>UUID:</strong> {detallePunto.uuid} <br />
                    <strong>Coordenadas:</strong> {detallePunto.lat.toFixed(6)}, {detallePunto.lng.toFixed(6)}
                  </p>

                  <button
                    type="button"
                    className={sidebarStyles.btnDelete}
                    onClick={handleDeleteClick}
                    disabled={isDeleting}
                  >
                    ELIMINAR PUNTO Y REGISTRO
                  </button>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </section>
  );
};