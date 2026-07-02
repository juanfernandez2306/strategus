import { useRegistroSidebar } from "./useRegistroSidebar";
import TarjetaRegistro from "./TarjetaRegistro";

export const ListaDestino = () => {
  // 1. Invocamos el hook correctamente con ()
  // El hook ya maneja internamente el useState, el useEffect y el filtro de pendientes
  const { data: listaRegistros, cargando, error } = useRegistroSidebar();

  // 2. Control de estado de carga
  if (cargando) {
    return <div className="main-content">Cargando registros pendientes...</div>;
  }

  // 3. Control de posibles errores de IndexedDB
  if (error) {
    return <div className="main-content" style={{ color: "var(--color-error)" }}>{error}</div>;
  }

  return (
    <div className="main-content">
      {listaRegistros.length === 0 ? (
        <p style={{ color: "var(--color-texto-secundario)", marginTop: "20px" }}>
          No hay plantas pendientes por revisar.
        </p>
      ) : (
        listaRegistros.map((item, indice) => {
          // Adaptamos las propiedades de SidebarData (lat, lng) al objeto completo 
          // que espera la TarjetaRegistro (latitud, longitud) usando un cast seguro (as any)
          const registroAdaptado = {
            ...item,
            latitud: item.lat,
            longitud: item.lng,
            galeria: 0 // Valor por defecto
          };

          return (
            <TarjetaRegistro 
              key={item.uuid} 
              registro={registroAdaptado as any} 
              consecutivo={indice + 1} 
              distanciaMetros={0} // Aquí puedes inyectar cálculos de distancia más adelante
            />
          );
        })
      )}
    </div>
  );
};

export default ListaDestino;