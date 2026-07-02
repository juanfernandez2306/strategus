import styles from './TarjetaRegistro.module.css';
import { type SidebarData } from '../../types/index';

// 1. Definimos la estructura de las propiedades
interface TarjetaRegistroProps {
  registro: SidebarData;
  consecutivo: number;
  distanciaMetros?: number;
}

// 2. Desestructuramos las props directamente en los parámetros asignando el tipo y valores por defecto
export const TarjetaRegistro = ({
  registro,
  consecutivo,
  distanciaMetros = 0,
}: TarjetaRegistroProps) => {
  
  const handleNavegar = () => {
    if (registro.lat && registro.lng) {

        console.log(registro.uuid);
      
      const url = `https://www.google.com/maps/search/?api=1&query=${registro.lat},${registro.lng}`;
      window.open(url, '_blank', 'noopener,noreferrer');

    } else {
      alert("Coordenadas no disponibles para la navegación.");
    }
  };

  return (
    <article className={styles.tarjeta}>
      {/* Encabezado con el número consecutivo de registro */}
      <div className={styles.encabezado}>
        <span className={styles.badgeConsecutivo}>
          # {consecutivo}
        </span>
        <span className={`${styles.statusBadge} ${registro.revision_planta ? styles.sincronizado : styles.pendiente}`}>
          {registro.revision_planta ? 'Sincronizado' : 'Local'}
        </span>
      </div>

      {/* Cuerpo con la información clave */}
      <div className={styles.cuerpo}>
        <div className={styles.datoGrupo}>
          <p className={styles.etiqueta}>DISTANCIA ESTIMADA</p>
          <p className={styles.valorDestacado}>
            {distanciaMetros > 0 ? `${distanciaMetros.toFixed(1)} metros` : 'Calculando...'}
          </p>
        </div>

        <div className={styles.detallesGrid}>
          <div className={styles.miniDato}>
            <span className={styles.miniEtiqueta}>Revisión:</span>
            <span className={styles.miniValor}>
              {registro.revision_planta ? 'Revisada' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>

      {/* Botón de acción masivo para móviles */}
      <footer className={styles.pieCard}>
        <button 
          type="button" 
          className={styles.botonNavegar} 
          onClick={handleNavegar}
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