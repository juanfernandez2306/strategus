// src/stores/useAuthStore.ts
import { create } from "zustand";

interface AuthState {
  token: string | null;
  nombreUsuario: string | null;
  isLogged: boolean;
  login: (token: string, nombre: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Comprobación inicial estricta (evaluando string válido) para persistencia al refrescar (F5)
  const tokenInicial = localStorage.getItem("token");
  const nombreInicial = localStorage.getItem("nombre_usuario");
  const esValido = typeof tokenInicial === "string" && tokenInicial.trim() !== "";

  return {
    token: esValido ? tokenInicial : null,
    nombreUsuario: esValido ? nombreInicial : null,
    isLogged: esValido,

    login: (token, nombre) => {
      localStorage.setItem("token", token);
      localStorage.setItem("nombre_usuario", nombre);
      set({ token, nombreUsuario: nombre, isLogged: true });
    },

    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("nombre_usuario");
      set({ token: null, nombreUsuario: null, isLogged: false });
    },
  };
});