

import { useMapLibreGLmanager } from './hooks/useMapLibreGLmanager';
import styles from './MapLibreGL.module.css';

import { MapSidebar } from './components/MapSidebar';

import LegendMap from './components/LegendMap';

import SnackBarError from './components/SnackBarError';


export const MapLibreGL = () => {

    const { 
        mapDivRef, 
        mensajeError,
        sistemaListo,
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

            <LegendMap />

            <SnackBarError 
                mensajeError={mensajeError} 
                sistemaListo={sistemaListo} 
            />

            <MapSidebar 
                onConfirmarVisita={handleConfirmarVisita}
                onEliminarPunto={handleEliminarPunto}
                compassRef={compassRef}
            />

        </main>
    );
}