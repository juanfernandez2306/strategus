
import { type SidebarData } from "../../../types";
import styles from "./BtnRevision.module.css";

export const ConfirmButton = ({ onClick, detallePunto }: { onClick: () => void, detallePunto: SidebarData | null }) => {
  
  const isLocked = false;

  const colorClass = detallePunto?.revision_planta ? styles.colorPendiente : styles.colorConfirmar;

  const buttonClasses = `
    ${styles.btnBase} 
    ${isLocked ? styles.btnLocked : `${styles.btnActive} ${colorClass}`}
  `.trim();

  

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={isLocked}
    >
      {detallePunto?.revision_planta ? "MARCAR COMO PENDIENTE" : "CONFIRMAR VISITA"}
    </button>
  );
};