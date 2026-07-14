import { TarjetaRegistro } from "./TarjetaRegistro";
import { MapSidebar } from "../mapa/components/MapSidebar"; 
import { useListaDestino } from "./useListaDestino";

import { IconClipBoard } from "../../components_svg/IconClipBoard";

// Importación de tus estilos modulares
import styles from "./ListaDestino.module.css";
import styleBase from "../../components/FormBaseLayout.module.css";
import styleRegisterFormGPS from "../registroPosicion/RegistroPosicionLayout.module.css";

import SnackBarError from "../mapa/components/SnackBarError";

export const ListaDestino = () => {
  
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

  // 1. Ordenamos por distancia (menor a mayor) para asegurar que el primero sea siempre el más cercano
  

  // 2. Extraemos únicamente el primer registro (el más cercano)
  const primerRegistroMasCercano = registrosConDistancia[0];

  return (
    <>
        <div className={`${styleBase.form} ${styles.container}`}>

            <section className={styleRegisterFormGPS.contenedorLogo}>
               <IconClipBoard 
                width={100}
                height={120}
                className={styles.svg}
               />

               <aside className={styleRegisterFormGPS.contadorContenedor}>
                    <p className={styleRegisterFormGPS.contadorEtiqueta}>
                        Lista de registros pendientes
                    </p>
                    {/* CONTADOR REAL: Muestra la cantidad total de registros pendientes en la cola */}
                    <h2 className={`${styleRegisterFormGPS.contadorNumero} ${styles.contadorNumero}`}>
                        {registrosConDistancia.length}
                    </h2>
                </aside>
            </section>

            <div className={styles.listaContainer}>
                {registrosConDistancia.length !== 0 && (
                    
                    
                            
                                <TarjetaRegistro 
                                    sincronizacion={primerRegistroMasCercano.sincronizacion}
                                    onNavegar={() => {handleAbrirNavegacion(primerRegistroMasCercano)} }
                                    distanciaMetros={primerRegistroMasCercano.distanciaCalculada} 
                                />
                            
                        
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