import { useState } from "react";
import type { ReactNode, FormEvent } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import style from '../components/FormLayoutBase.module.css';

interface FormBaseProps {
  titulo: string;
  buttonText: string;
  children?: ReactNode;
  iconoCustom: ReactNode;
  onExecute: () => Promise<string>; 
  onSuccess?: () => void;
  // PROPIEDAD OPCIONAL (El signo '?' es la clave)
  disabled?: boolean;
}

const FormBaseLayout = ({ 
    titulo, 
    buttonText, 
    children,
    iconoCustom, 
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

  const showModal = isSubmitting || !!mensaje;

  return (
    <div className={style.formContainer}>
      <form className={style.form} onSubmit={handleSubmit}>
        <figure className={style.ContainerSvg}>
          {iconoCustom}
        </figure>
        <Typography 
          variant="h3" 
          align="center"
          sx={{ 
            fontSize: "1.3rem", 
            margin: 0,
            fontWeight: 'bold',
            color: "var(--color-primario)"
          }}
        >
          {titulo}
        </Typography>  
        {children}
        <button 
          className={style.submit} 
          type="submit" 
          disabled={isSubmitting || disabled}>
          {isSubmitting ? "Procesando..." : buttonText}
        </button>
      </form>

      <Dialog open={showModal} onClose={() => setMensaje("")}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          {isSubmitting ? (
            <>
              <CircularProgress />
              <Typography>Procesando información...</Typography>
            </>
          ) : (
            <>
              {isError ? <ErrorIcon color="error" sx={{ fontSize: 40 }} /> : <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />}
              <Typography sx={{ color: isError ? "red" : "green" }}>{mensaje}</Typography>
              <Button 
                variant="contained" 
                onClick={() => setMensaje("")} 
                sx={{ mt: 2 }}>Cerrar</Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FormBaseLayout;