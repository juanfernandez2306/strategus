export const useLogin = () => {
  const autenticar = async (email: string, password: string): Promise<string> => {
    // URL de tu API basada en Slim Framework
    const respuesta = await fetch("http://localhost/api-gepad/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, password: password }),
    });

    const datos = await respuesta.json();

    if (datos.success) {
      // Guardamos estrictamente el token y el nombre en el localStorage
      localStorage.setItem("token", datos.token);
      localStorage.setItem("nombre_usuario", datos.usuario.nombre);
      
      return datos.message || "Autenticación exitosa.";
    } else {
      // El lanzamiento de error activa automáticamente el bloque catch y modal de fallo en FormBaseLayout
      throw new Error(datos.message || "Credenciales incorrectas.");
    }
  };

  return { autenticar };
};