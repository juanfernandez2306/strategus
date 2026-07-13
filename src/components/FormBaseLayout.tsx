import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import style from './FormBaseLayout.module.css';

interface FormBaseProps {
  titulo?: string | null;
  buttonText: string;
  children?: ReactNode;
  onExecute: () => Promise<string>; 
  onSuccess?: () => void;
  disabled?: boolean;
  redirectOnSubmit?: boolean;
}

const FormBaseLayout = ({ 
    titulo = null, 
    buttonText, 
    children,
    onExecute, 
    onSuccess,
    disabled = false,
    redirectOnSubmit = false
  }: FormBaseProps) => {

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

      if (onSuccess && !redirectOnSubmit) onSuccess();
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      setMensaje(`Error: ${msg}`);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setMensaje("");

    if (!isError && redirectOnSubmit && onSuccess) {
      onSuccess();
    }

  };

  return (
    <div className={style.formContainer}>
      <form className={style.form} onSubmit={handleSubmit}>
        
        {titulo && (
          /* Removido el estilo inline manual para evitar dependencias rotas */
          <h3 className={style.titulo}>
            {titulo}
          </h3>
        )}
        
        {children}
        
        <button 
          className={style.submit} 
          type="submit" 
          disabled={isSubmitting || disabled}>
          {isSubmitting ? "Procesando..." : buttonText}
        </button>
      </form>

      {/* Modal de Feedback */}
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
                {isError ? (
                  <div className={`${style.iconWrapper} ${style.error}`}>
                    <div className={style.errorIcon} />
                  </div>
                ) : (
                  <div className={`${style.iconWrapper} ${style.success}`}>
                    <div className={style.checkIcon} />
                  </div>
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