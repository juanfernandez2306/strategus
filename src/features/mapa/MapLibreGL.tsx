

import { useMapLibreGLmanager } from './map_manager/useMapLibreGLmanager';
import Compass  from './components/Compass';
import { ConfirmButton } from './components/BtnRevision';
import styles from './MapLibre.module.css';



export const MapLibreGL = () => {

    const { 
        mapDivRef, 
        mensajeError,
        isSidebarOpen,
        handleCerrarSidebar,
        detallePunto,
        handleConfirmarVisita,
        compassRef
     } = useMapLibreGLmanager();

    return(
        <main className={styles.screenContainer}>
            <div 
                ref={mapDivRef} 
                className={styles.mapCanvas} 
            />

            <section className={`${styles.snackbarError} ${mensajeError ? styles.visible : styles.hidden}`}>
                {mensajeError}
            </section>

            {/* --- ESTRATEGIA DEL DRAWER / SIDEBAR ACOPLADA --- */}
            <section 
                className={`${styles.drawerOverlay} ${isSidebarOpen ? styles.overlayActive : ''}`} 
                onClick={handleCerrarSidebar} // Al hacer click afuera, limpia el destino en Zustand
            >
                <div 
                    className={`${styles.drawerPaper} ${isSidebarOpen ? styles.drawerOpen : ''}`}
                    onClick={(e) => e.stopPropagation()} // Evita que se cierre al tocar dentro del panel
                >
                    {/* Botón de cierre superior derecha */}
                    <button className={styles.btnClose} onClick={handleCerrarSidebar}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    {/* El contenido se monta de forma condicional solo si hay un punto seleccionado */}
                    {detallePunto && (
                        <>
                            {/* Acoplamiento de la Ref: Permite la tubería directa desde useSensorManager al DOM */}
                            <Compass size={260} ref={compassRef} />
                            
                            {/* Botón de acción contextual para el operario en campo */}
                            <ConfirmButton 
                                onClick={handleConfirmarVisita} 
                                detallePunto={detallePunto} 
                            />
                        </>
                    )}
                </div>
            </section>

        </main>
    );
}