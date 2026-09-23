// ---------- js/dataManager.js ----------
import { APP_SETTINGS } from './config.js';

export class DataManager {
  constructor() {
    this.storageKey = APP_SETTINGS.storageKey;
    this.datosAspirante = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      this.datosAspirante = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn('Datos locales corruptos, se reiniciarán.', e);
      localStorage.removeItem(this.storageKey);
      this.datosAspirante = null;
    }
    return this.datosAspirante;
  }

  requireDataOrRedirect(redirectUrl = 'index.html') {
    const data = this.load();
    if (!data || !data.nombre || !data.rol) {
      window.location.href = redirectUrl;
      return null;
    }
    return data;
  }

  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn('No se pudo guardar en el navegador.', e);
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}