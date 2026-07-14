import styles from './TarjetaRegistro.module.css';

import { useSistemaStore } from '../mapa/hooks/useSistemaStore'; 

// 1. Definimos la estructura de las propiedades
interface TarjetaRegistroProps {
  estadoRevision: boolean;
  distanciaMetros?: number;
  onNavegar?: () => void;
}


export const TarjetaRegistro = ({
  estadoRevision,
  distanciaMetros = 0,
  onNavegar
}: TarjetaRegistroProps) => {

    const sistemaListo = useSistemaStore((state) => state.sistemaListo);
  
  const handleNavegar = (e: React.MouseEvent) => {

    e.stopPropagation();

    console.log("¿Sistema listo?:", sistemaListo);

    if (!sistemaListo) {
      return;
    }

    if (onNavegar) {
      onNavegar();
    }
    
  };

  return (
    <article className={styles.tarjeta}>
      {/* Encabezado con el número consecutivo de registro */}
      <div className={styles.encabezado}>
        <span className={`${styles.statusBadge} ${estadoRevision ? styles.sincronizado : styles.pendiente}`}>
          Almacenamiento {estadoRevision ? 'Sincronizado' : 'Local'}
        </span>
      </div>

      
      <div className={styles.cuerpo}>
        <div className={styles.datoGrupo}>
          <p className={styles.etiqueta}>DISTANCIA ESTIMADA</p>
          <p className={styles.valorDestacado}>
            {sistemaListo && (distanciaMetros > 0)
              ? `${distanciaMetros.toFixed(1)} metros` 
              : 'Calculando...'}
          </p>
        </div>
      </div>

      {/* Botón de acción masivo para móviles */}
      <footer className={styles.pieCard}>
        <button 
          type="button" 
          className={`${styles.botonNavegar} 
            ${!sistemaListo ? styles.botonDeshabilitado : ''}`}
          onClick={handleNavegar}
          disabled={!sistemaListo}
        >
          <span>Navegar al punto</span>
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </button>
      </footer>
    </article>
  );
};

export default TarjetaRegistro;