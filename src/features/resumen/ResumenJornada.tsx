// src/layouts/ResumenJornadaLayout.tsx
import FormBaseLayout from "../../components/FormLayoutBase";
import { useResumenJornada } from "./useResumenJornada";

import styleLocal from "./ResumenJornadaLayout.module.css";


import styleRegistro from "../registroPosicion/RegistroPosicionLayout.module.css";

import IconFumigadora from "../../components_svg/IconFumigadora";

import { useAuthStore } from "../../hooks/useAuthStore";

const ResumenJornadaLayout = () => {
  const { registrados, revisados, refrescar } = useResumenJornada();

  const handleRefrescar = async () => {
    return await refrescar();
  };



  const nombreUsuarioStore = useAuthStore((state) => state.nombreUsuario);
  const tokenStore = useAuthStore((state) => state.token);
  const logoutStore = useAuthStore((state) => state.logout);

  const nombreUsuario = (nombreUsuarioStore || "USUARIO").toUpperCase();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost/api-gepad/usuarios/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${tokenStore}`,
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error al revocar sesión en servidor:", error);
    } finally {
      // Independientemente de si el servidor responde o no, limpiamos 
      // el Store localmente. Al hacerlo, la vista cambiará al Login de inmediato.
      logoutStore();
    }
  };

  return (
    <FormBaseLayout
      buttonText="Actualizar Indicadores"
      onExecute={handleRefrescar}>

      <div className={styleLocal.headerUsuario}>
        <p className={styleLocal.textoBienvenida}>
          👤 HOLA {nombreUsuario}
        </p>
        <button 
          type="button" 
          className={styleLocal.botonLogout} 
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </div>

      
      <section className={styleRegistro.contenedorLogo}>
                <figure>
                    <IconFumigadora width={80} height={80} />
                </figure>
                
                <h3 className={styleLocal.titulo}>
                    RESUMEN DE REGISTROS HOY
                </h3>
                
            </section>

      {/* 2. Reemplazamos todos los Box y Typography de MUI por etiquetas HTML semánticas */}
      <aside className={styleRegistro.contenedorLogo}>
        
        
        
          <div className={styleLocal.columnaConteo}>

            <div className={styleLocal.ContenedorEtiquetaCorta}>
              <p className={styleLocal.etiquetaCorta}>PALMAS</p>
              <p className={styleLocal.etiquetaCorta}>MARCADAS</p>
            </div>

            <h3 className={styleLocal.numeroGrande}>{registrados}</h3>
          </div>
          
          <div className={styleLocal.columnaConteo}>

            <div className={styleLocal.ContenedorEtiquetaCorta}>
              <p className={styleLocal.etiquetaCorta}>PALMAS</p>
              <p className={styleLocal.etiquetaCorta}>REVISADAS</p>
            </div>

            <h3 className={`${styleLocal.numeroGrande} ${styleLocal.numeroRevisados}`}>
              {revisados}
            </h3>
          </div>
        

      </aside>
    </FormBaseLayout>
  );
};

export default ResumenJornadaLayout;