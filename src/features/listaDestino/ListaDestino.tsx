import { TarjetaRegistro } from "./TarjetaRegistro";
import { MapSidebar } from "../mapa/components/MapSidebar"; 
import { useListaDestino } from "./useListaDestino"; 

// Importación de tus estilos modulares
import styles from "./ListaDestino.module.css";
import styleBase from "../../components/FormBaseLayout.module.css";

import SnackBarError from "../mapa/components/SnackBarError";

export const ListaDestino = () => {
  // Consumimos toda la lógica encapsulada en el hook
  const {
    mensajeError,
    sistemaListo,
    registrosConDistancia,
    sidebarOpen,
    puntoSeleccionado,
    compassRef,
    setSidebarOpen,
    handleAbrirNavegacion,
    handleConfirmarVisita,
    handleEliminarPunto
  } = useListaDestino();

 
  return (
    <>
        <div className={`${styleBase.form} ${styles.container}`}>
        <h3 className={styleBase.titulo} style={
            { color: "var(--color-negro)", 
            fontWeight: 'bold' }}>
                Lista de registros pendientes
            </h3>

            <div className={styles.listaContainer}>
                {registrosConDistancia.length === 0 ? (
                    <p className={styles.mensajeInformativo}>
                        No hay plantas pendientes por revisar.
                    </p>
                ) : (
                registrosConDistancia.map((item, indice) => {
                const registroAdaptado = {
                    ...item,
                    latitud: item.lat,
                    longitud: item.lng,
                    galeria: 0
                };

                    return (
                        <div 
                        key={item.uuid} 
                        className={styles.tarjetaWrapper} // Aplica el feedback táctil en móviles (:active)
                        onClick={() => handleAbrirNavegacion(item)} 
                        >
                        <TarjetaRegistro 
                            registro={registroAdaptado as any} 
                            consecutivo={indice + 1} 
                            distanciaMetros={item.distanciaCalculada} 
                        />
                        </div>
                    );
                })
            )}
            </div>

        </div>

        <MapSidebar
            isOpen={sidebarOpen}
            detallePunto={puntoSeleccionado}
            onClose={() => setSidebarOpen(false)}
            onConfirmarVisita={handleConfirmarVisita}
            onEliminarPunto={handleEliminarPunto}
            compassRef={compassRef} 
        />

        <SnackBarError
            mensajeError={mensajeError}
            sistemaListo={sistemaListo}
        />

    </>
  );
};

export default ListaDestino;