// src/services/deviceService.ts

export const deviceService = {
  getOrCreateId(): string {
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = crypto.randomUUID?.() || Math.random().toString(36).substring(2, 11);
      localStorage.setItem("device_id", deviceId);
    }
    return deviceId;
  },

  getModel(): string {
    const ua = navigator.userAgent;
    if (ua.includes("Windows NT")) return "Windows_PC";
    if (ua.includes("Android")) return "Android_Device";
    if (ua.includes("iPhone") || (ua.includes("Macintosh") && "ontouchend" in document)) {
      return "iOS_Device";
    }
    if (ua.includes("Macintosh")) return "Mac_PC";
    return "Unknown_Device";
  }
};