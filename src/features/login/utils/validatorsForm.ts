

interface ValidationParams {
  value_field: string;
  name_field: string;
  regex_field?: RegExp;
  message_field_regex?: string;
}


const validationInputString = ({
  value_field,
  name_field,
  regex_field,
  message_field_regex
}: ValidationParams): string => {

  // Validación de Presencia
  if (!value_field) return `${name_field} es obligatorio.`;

  // Validación de Espacios en blanco
  if (/\s/.test(value_field)) {
    return `${name_field} no puede contener espacios en blanco.`;
  }

  // Validación de Formato (Solo si se proporcionó una Regex para evitar falsos positivos)
  if (regex_field && !regex_field.test(value_field)) {
    return message_field_regex || `El formato de ${name_field} no es válido.`;
  }

  return "";
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const msgErrorPattern = "La contraseña debe tener al menos 6 caracteres e incluir letras, números y un carácter especial (ej. @, #, $, !).";

const nameRegex = /^[A-Za-z]{3,}$/;

const msgErrorText = "Por favor, introduce solo letras y tener al menos 3 caracteres."


export const validadoresLogin = {
  email: (valor: string): string => {
    return validationInputString({
      value_field: valor,
      name_field: "El correo electrónico",
      regex_field: emailRegex,
      message_field_regex: "Por favor, introduce un correo válido."
    });
  }
  ,
  password: (valor: string): string => {
    return validationInputString({
      value_field: valor,
      name_field: "La contraseña",
      regex_field: passwordRegex,
      message_field_regex: msgErrorPattern
    });
  }
};


export const validadoresRegister = {
  nombre: (valor: string): string => {
    return validationInputString({
      value_field: valor,
      name_field: "El nombre",
      regex_field: nameRegex,
      message_field_regex: msgErrorText
    });
  },
  apellido: (valor: string): string => {

    return validationInputString({
      value_field: valor,
      name_field: "El apellido",
      regex_field: nameRegex,
      message_field_regex: msgErrorText
    });

  },
  email: validadoresLogin.email,
  password: validadoresLogin.password,
  confirmPassword: (valor: string, todosLosValores: any): string => {
    if (!valor) return "Por favor, confirma tu contraseña.";
    if (valor !== todosLosValores.password) {
      return "Las contraseñas ingresadas no coinciden.";
    }
    return "";
  }
};