export const getOrCreateDeviceId = (): string => {
  let deviceId = localStorage.getItem("device_id");
  
  if (!deviceId) {
    // Genera un ID aleatorio simple (UUID v4 aproximado)
    deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11);
    localStorage.setItem("device_id", deviceId);
  }
  
  return deviceId;
};

export const getDeviceModel = (): string => {
  const ua = navigator.userAgent;

  // 1. Detectar Windows (Tu caso actual)
  if (ua.includes("Windows NT")) return "Windows_PC";
  
  // 2. Detectar Mac (Escritorio)
  if (ua.includes("Macintosh") && !("ontouchend" in document)) return "Mac_PC";

  // 3. Detectar Android (Móvil/Tablet)
  if (ua.includes("Android")) return "Android_Device";

  // 4. Detectar iPhone/iPad
  // El iPad moderno a veces se identifica como Mac, por eso chequeamos el touch
  if (ua.includes("iPhone") || (ua.includes("Macintosh") && "ontouchend" in document)) {
    return "iOS_Device";
  }

  return "Unknown_Device";
};