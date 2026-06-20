

import { useMapLibreGLmanager } from './hooks/useMapLibreGLmanager';
import styles from './MapLibreGL.module.css';

import { MapSidebar } from './components/MapSidebar';



export const MapLibreGL = () => {

    const { 
        mapDivRef, 
        mensajeError,
        isSidebarOpen,
        handleCerrarSidebar,
        detallePunto,
        handleConfirmarVisita,
        handleEliminarPunto,
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

            <MapSidebar 
                isOpen={isSidebarOpen}
                detallePunto={detallePunto}
                onClose={handleCerrarSidebar}
                onConfirmarVisita={handleConfirmarVisita}
                onEliminarPunto={handleEliminarPunto} // <-- TS comprobará que las firmas coinciden perfectamente
                compassRef={compassRef}
            />

        </main>
    );
}