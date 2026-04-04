

'use strict';

const Utils = (() => {

  /**
   * Genera un ID único basado en timestamp + random
   * @returns {string}
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /**
   * Formatea una fecha ISO (YYYY-MM-DD) a formato legible en español
   * HOTFIX: se corrigió el desfase de zona horaria que causaba mostrar
   * un día anterior al esperado al usar new Date() directamente.
   * @param {string} isoDate - Fecha en formato YYYY-MM-DD
   * @returns {string} - Fecha formateada, ej: "15 de julio de 2025"
   */
  function formatDate(isoDate) {
    if (!isoDate) return 'Sin fecha';
    // CORRECCIÓN: parsear partes por separado para evitar conversión UTC→Local
    const [year, month, day] = isoDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);   // mes base 0, sin UTC
    return date.toLocaleDateString('es-DO', {
      day:   'numeric',
      month: 'long',
      year:  'numeric',
    });
  }

  /**
   * Devuelve cuántos días faltan (o pasaron) para una fecha límite
   * @param {string} isoDate
   * @returns {string}
   */
  function dueDays(isoDate) {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-').map(Number);
    const due   = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff  = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (diff < 0)  return `Venció hace ${Math.abs(diff)} día(s)`;
    if (diff === 0) return 'Vence hoy';
    return `Vence en ${diff} día(s)`;
  }

  /**
   * Escapa HTML para evitar XSS al insertar texto de usuario en el DOM
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(str).replace(/[&<>"']/g, c => map[c]);
  }

  /**
   * Debounce: retarda la ejecución de una función
   * @param {Function} fn
   * @param {number} delay ms
   * @returns {Function}
   */
  function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  /**
   * Hoy en formato YYYY-MM-DD (para valor mínimo en inputs de fecha)
   * @returns {string}
   */
  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  return { generateId, formatDate, dueDays, escapeHtml, debounce, todayISO };
})();
