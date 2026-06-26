
import { useState } from "react";
import FormBaseLayout from "../components/FormLayoutBase";
import { useLogin } from "../hooks/useLogin";

import styleLocal from "./LoginLayout.module.css";
import styleRegistro from "../features/registroPosicion/RegistroPosicionLayout.module.css";
import { useAuthStore } from "../hooks/useAuthStore";

const LoginLayout = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { autenticar } = useLogin();

  const loginGlobal = useAuthStore((state) => state.login);

  // Envolvemos la función para que coincida con la firma () => Promise<string> requerida por el layout
  const handleExecuteLogin = async () => {
    return await autenticar(email, password);
  };

  // Acción que se ejecuta al cerrar exitosamente el modal de feedback
  const handleSuccessRedirect = () => {

    const token = localStorage.getItem("token") || "";
    const nombre = localStorage.getItem("nombre_usuario") || "";

    setTimeout(() => {

        loginGlobal(token, nombre);
        
    }, 600); 
    
  };

  return (
    <div className={styleLocal.contenedorCentrado}>
      <FormBaseLayout
        titulo="Iniciar Sesión"
        buttonText="Ingresar"
        onExecute={handleExecuteLogin}
        onSuccess={handleSuccessRedirect}
      >
        {/* Los inputs adoptan tus clases semánticas y el contenedor base de RegistroPosicionLayout */}
        <div className={styleRegistro.groupInput}>
          <label htmlFor="email">Correo Electrónico</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div className={styleRegistro.groupInput}>
          <label htmlFor="clave">Contraseña</label>
          <input
            id="clave"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="***********"
            required
          />
        </div>
      </FormBaseLayout>
    </div>
  );
};

export default LoginLayout;