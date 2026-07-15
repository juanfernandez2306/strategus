

import FormBaseLayout from "../../components/FormBaseLayout";
import { useLogin } from "./hooks/useLogin";

import styleLocal from "./LoginLayout.module.css";

import { useAuthStore } from "./hooks/useAuthStore";

import PasswordInput from "./PasswordInput";

import { useFormValidators } from "./utils/useFormValidators";
import { validadoresLogin } from "./utils/validatorsForm";

import { IconUsers } from "../../components_svg/IconUsers";

const LoginLayout = () => {

  const { valores, errores, handleChange, validarFormulario } = useFormValidators(
    {
      email: "",
      password: ""
    }
    , validadoresLogin
  );

  const { autenticar } = useLogin();

  const loginGlobal = useAuthStore((state) => state.login);

  const handleExecuteLogin = async (): Promise<string> => {

    if (!validarFormulario()) {
      throw new Error("Por favor, corrige los errores en el formulario.");
    }

    const mensajeExito = await autenticar(valores.email, valores.password);
    

    return mensajeExito;
  };

  return (
      <FormBaseLayout
          buttonText="Ingresar al Sistema"
          onExecute={handleExecuteLogin}
          redirectOnSubmit={true}

          onSuccess={ () => {
              const token = localStorage.getItem("token") || "";
              const nombre = localStorage.getItem("nombre_usuario") || "";
              loginGlobal(token, nombre);
            }
          }
          

        >
          <IconUsers width={100} height={100} className={styleLocal.svg} />
          
          <div className={styleLocal.groupInput}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              value={valores.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="ejemplo@correo.com"
              required
            />

            {errores.email && <span className={styleLocal.notasError}>{errores.email}</span>}

          </div>

          
          <PasswordInput
            id="clave"
            label="Contraseña"
            value={valores.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="***********"
            error={errores.password}
            required
          />
          
          
        </FormBaseLayout>
  );
};

export default LoginLayout;