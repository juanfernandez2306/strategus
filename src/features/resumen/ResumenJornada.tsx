// src/layouts/ResumenJornadaLayout.tsx
import FormBaseLayout from "../../components/FormLayoutBase";
import { useResumenJornada } from "./useResumenJornada";
import styleLayoutBase from "../../components/FormLayoutBase.module.css";
import styleLocal from "./ResumenJornadaLayout.module.css"; // 1. Importamos el nuevo módulo CSS
import IconStrategusAloeus from "../../components_svg/IconStrategusAloeus"; 

const ResumenJornadaLayout = () => {
  const { registrados, revisados, sumaGalerias, refrescar } = useResumenJornada();

  const handleRefrescar = async () => {
    return await refrescar();
  };

  return (
    <FormBaseLayout
      titulo="Resumen de Operación"
      buttonText="Actualizar Indicadores"
      iconoCustom={<IconStrategusAloeus size={100} />}
      onExecute={handleRefrescar}
    >
      {/* 2. Reemplazamos todos los Box y Typography de MUI por etiquetas HTML semánticas */}
      <div className={styleLocal.contenedorPrincipal}>
        
        {/* Fila de Conteos Principales */}
        <div className={styleLocal.filaConteos}>
          <div className={styleLocal.columnaConteo}>
            <p className={styleLocal.etiquetaCorta}>MARCADOS</p>
            <h3 className={styleLocal.numeroGrande}>{registrados}</h3>
          </div>
          
          <div className={styleLocal.columnaConteo}>
            <p className={styleLocal.etiquetaCorta}>REVISADOS</p>
            <h3 className={`${styleLocal.numeroGrande} ${styleLocal.numeroRevisados}`}>
              {revisados}
            </h3>
          </div>
        </div>

        {/* Separador nativo */}
        <hr className={styleLocal.divisor} />

        {/* El "Corazón" del requerimiento: Sum(Galería) */}
        {/* Combinamos la clase externa con la local */}
        <div className={`${styleLayoutBase.groupInput} ${styleLocal.tarjetaAcumulado}`}>
          <p className={styleLocal.etiquetaAcumulado}>
            VALOR ACUMULADO GALERÍAS
          </p>
          <h4 className={styleLocal.numeroAcumulado}>
            {sumaGalerias}
          </h4>
        </div>

      </div>
    </FormBaseLayout>
  );
};

export default ResumenJornadaLayout;