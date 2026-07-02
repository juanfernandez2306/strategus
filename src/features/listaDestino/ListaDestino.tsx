import { useState } from "react";
import useRegistroSidebar from "./useRegistroSidebar";
import type { SidebarData } from "../../types";
import TarjetaRegistro from "./TarjetaRegistro";

export const ListaDestino = () => {

    const [listaRegistros, setListaRegistros] = useState<SidebarData[]>([]);

    const { data } = useRegistroSidebar();

    setListaRegistros(data);

    return (
    <div className="main-content">
        {listaRegistros.map((registro, indice) => (
        <TarjetaRegistro 
            key={registro.uuid} 
            registro={registro} 
            consecutivo={indice + 1} 
            distanciaMetros={120.5} // Aquí pasarías la distancia calculada si la tienes
        />
        ))}
    </div>
    );

}


