// useFormValidators.ts
import { useState } from "react";

// El hook ahora recibe un tipo genérico "T" que representa los campos del formulario
export const useFormValidators = <T extends Record<string, string>>(
  valoresIniciales: T,
  validadoresEstrategia: Record<keyof T, (valor: string, todosLosValores: T) => string>
) => {
  const [valores, setValores] = useState<T>(valoresIniciales);
  const [errores, setErrores] = useState<Partial<Record<keyof T, string>>>({});

  const handleChange = (campo: keyof T, valor: string) => {
    
    setValores((prev) => ({ ...prev, [campo]: valor }));
    
    if (errores[campo]) {
      setErrores((prev) => ({ ...prev, [campo]: "" }));
    }
  };

  const validarFormulario = (): boolean => {
    const nuevosErrores = {} as Record<keyof T, string>;
    
    // Ejecutamos dinámicamente el validador correspondiente para cada campo pasándole también "valores"
    // por si un campo depende de otro (como confirmar contraseña)
    for (const campo in valores) {
      if (validadoresEstrategia[campo]) {
        nuevosErrores[campo] = validadoresEstrategia[campo](valores[campo], valores);
      }
    }

    const tieneErrores = Object.values(nuevosErrores).some((msg) => msg !== "");

    if (tieneErrores) {
      const erroresFiltrados = Object.fromEntries(
        Object.entries(nuevosErrores).filter(([_, msg]) => msg !== "")
      ) as Partial<Record<keyof T, string>>;
      
      setErrores(erroresFiltrados);
      return false;
    }

    setErrores({});
    return true;
  };

  return { valores, errores, handleChange, validarFormulario };
};