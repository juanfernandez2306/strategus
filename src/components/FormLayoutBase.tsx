import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import style from './FormLayoutBase.module.css';

interface FormBaseProps {
  titulo: string;
  buttonText: string;
  children?: ReactNode;
  iconoCustom?: ReactNode | null;
  onExecute: () => Promise<string>; 
  onSuccess?: () => void;
  disabled?: boolean;
}

const FormBaseLayout = ({ 
    titulo, 
    buttonText, 
    children,
    iconoCustom = null, 
    onExecute, 
    onSuccess,
    disabled = false }: FormBaseProps) => {

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsError(false);
    
    try {
      const mensajeExito = await onExecute();
      setMensaje(mensajeExito);
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMensaje(`Error: ${msg}`);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => setMensaje("");

  return (
    <div className={style.formContainer}>
      <form className={style.form} onSubmit={handleSubmit}>
        
        {iconoCustom && (
          <figure className={style.ContainerSvg}>
            {iconoCustom}
          </figure>
        )}
        
        <h3 className={style.titulo} style={{ color: "var(--color-primario)", fontWeight: 'bold' }}>
          {titulo}
        </h3>
        
        {children}
        
        <button 
          className={style.submit} 
          type="submit" 
          disabled={isSubmitting || disabled}>
          {isSubmitting ? "Procesando..." : buttonText}
        </button>
      </form>

      {/* Modal de Feedback (Sustituye a Dialog) */}
      {(isSubmitting || !!mensaje) && (
        <div className={style.modalOverlay}>
          <div className={style.modalContent}>
            {isSubmitting ? (
              <>
                <div className={style.spinner} />
                <p>Procesando información...</p>
              </>
            ) : (
              <>
                {/* Iconos manuales para evitar dependencias */}
                {isError ? (
                  <span style={{ fontSize: '40px' }}>⚠️</span>
                ) : (
                  <span style={{ fontSize: '40px' }}>✅</span>
                )}
                
                <p className={isError ? style.errorText : style.successText}>
                  {mensaje}
                </p>
                
                <button className={style.closeButton} onClick={closeModal}>
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBaseLayout;