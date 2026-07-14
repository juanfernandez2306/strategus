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

  // 1. Ordenamos por distancia (menor a mayor) para asegurar que el primero sea siempre el más cercano
  const registrosOrdenados = [...registrosConDistancia].sort(
    (a, b) => (a.distanciaCalculada || 0) - (b.distanciaCalculada || 0)
  );

  // 2. Extraemos únicamente el primer registro (el más cercano)
  const primerRegistroMasCercano = registrosOrdenados[0];

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
                {registrosConDistancia.length === 0 ? (
                    <p className={styles.mensajeInformativo}>
                        No hay plantas pendientes por revisar.
                    </p>
                ) : (
                    /* RENDERIZADO EXCLUSIVO DEL PRIMERO (MÁS CERCANO) */
                    (() => {
                        const registroAdaptado = {
                            ...primerRegistroMasCercano,
                            latitud: primerRegistroMasCercano.lat,
                            longitud: primerRegistroMasCercano.lng,
                            galeria: 0
                        };

                        return (
                            <div 
                                className={styles.tarjetaWrapper} // Aplica el feedback táctil en móviles (:active)
                                onClick={() => handleAbrirNavegacion(primerRegistroMasCercano)} 
                            >
                                <TarjetaRegistro 
                                    registro={registroAdaptado as any} 
                                    consecutivo={1} // Es el primero y único visible
                                    distanciaMetros={primerRegistroMasCercano.distanciaCalculada} 
                                />
                            </div>
                        );
                    })()
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