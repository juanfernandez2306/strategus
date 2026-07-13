import styles from './SnackbarError.module.css';

interface SnackbarProps {
  mensajeError: string | null;
  sistemaListo: boolean;
}

const SnackBarError = ({mensajeError, sistemaListo}:SnackbarProps) => {

    return(
        <section 
            className={`${styles.snackbarError} ${(mensajeError && !sistemaListo) ? styles.visible : styles.hidden}`}>
            {mensajeError}
        </section>
    );
}

export default SnackBarError;