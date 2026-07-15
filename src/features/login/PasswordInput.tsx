// PasswordInput.tsx
import { useState } from "react";
import style from "./LoginLayout.module.css";

import IconEyes from "../../components_svg/IconEyes";
import IconEyesOff from "../../components_svg/IconEyesOff";

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = "***********",
  required = false,
  error
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className={style.groupInput}>
      <label htmlFor={id}>{label}</label>

      <div className={style.passwordWrapper}>
        <input
          id={id}
          type={passwordVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={style.inputWithIcon}
        />
        <button
          type="button"
          onClick={() => setPasswordVisible(!passwordVisible)}
          className={style.iconButton}
          aria-label={passwordVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {passwordVisible ? (
            /* Icono: Ojo Tachado (IoEyeOffOutline) */
           <IconEyesOff
            width={40}
            height={30}
            className={style.icon}
            /> 
          ) : (
            /* Icono: Ojo Abierto (IoEyeOutline) */
            <IconEyes 
              width={40} 
              height={30}
              className={style.icon}
            />
          )}
        </button>
      </div>

      {error && (
        <span className={style.notasError}>
          {error}
        </span>
      )}

    </div>
  );
};

export default PasswordInput;