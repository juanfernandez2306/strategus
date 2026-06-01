// src/layouts/ResumenJornadaLayout.tsx
import FormBaseLayout from "../../components/FormLayoutBase";
import { useResumenJornada } from "./useResumenJornada";

import styleLayoutBase from "../../components/FormLayoutBase.module.css";
import styleLocal from "./ResumenJornadaLayout.module.css";


import styleRegistro from "../registroPosicion/RegistroPosicionLayout.module.css";

import IconFumigadora from "../../components_svg/IconFumigadora";

const ResumenJornadaLayout = () => {
  const { registrados, revisados, sumaGalerias, refrescar } = useResumenJornada();

  const handleRefrescar = async () => {
    return await refrescar();
  };

  return (
    <FormBaseLayout
      buttonText="Actualizar Indicadores"
      onExecute={handleRefrescar}>

      
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