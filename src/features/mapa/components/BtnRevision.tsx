/* --- BtnRevision.tsx CORREGIDO --- */
import { useEffect, useState } from "react";
import { type SidebarData } from "../../../types";
import styles from "./BtnRevision.module.css";

export const ConfirmButton = ({ onClick, detallePunto }: { onClick: () => void, detallePunto: SidebarData | null }) => {
  
  const [isLocked, setIsLocked] = useState(true);

  const colorClass = detallePunto?.revision_planta ? styles.colorPendiente : styles.colorConfirmar;

  const buttonClasses = `
    ${styles.btnBase} 
    ${isLocked ? styles.btnLocked : `${styles.btnActive} ${colorClass}`}
  `.trim();

  useEffect(() => {
    const handleProximity = (e: any) => {

      const { canUpdate } = e.detail;
      setIsLocked(!canUpdate);

    };

    window.addEventListener('proximity-status', handleProximity);
    return () => window.removeEventListener('proximity-status', handleProximity);
  }, []);

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