

import { useMapLibreGLmanager } from './map_manager/useMapLibreGLmanager';
import styles from './MapLibre.module.css';



export const MapLibreGL = () => {

    const { mapDivRef, mensajeError } = useMapLibreGLmanager();

    return(
        <main className={styles.screenContainer}>
            <div ref={mapDivRef} className={styles.mapCanvas} />
            <section className={`${styles.snackbarError} ${mensajeError ? styles.visible : styles.hidden}`}>
                {mensajeError}
            </section>
        </main>
    );
}