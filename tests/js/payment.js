
'use strict';

const Payment = (() => {

  const SUB_KEY = 'todo_subscription';

  const PLANS = {
    free: {
      id:       'free',
      name:     'Free',
      price:    0,
      maxTasks: 10,
      features: ['Hasta 10 tareas', 'Prioridades básicas', 'Exportar a texto'],
    },
    pro: {
      id:       'pro',
      name:     'Pro',
      price:    4.99,
      maxTasks: Infinity,
      features: ['Tareas ilimitadas', 'Prioridades avanzadas', 'Exportar a CSV', 'Estadísticas'],
    },
  };

  /**
   * Devuelve el plan actual del usuario
   * @returns {Object}
   */
  function getCurrentPlan() {
    const raw = localStorage.getItem(SUB_KEY);
    const sub  = raw ? JSON.parse(raw) : null;
    if (!sub || !PLANS[sub.planId]) return { ...PLANS.free, expiresAt: null };
    if (sub.expiresAt && Date.now() > sub.expiresAt) {
      localStorage.removeItem(SUB_KEY);
      return { ...PLANS.free, expiresAt: null };
    }
    return { ...PLANS[sub.planId], expiresAt: sub.expiresAt };
  }

  /**
   * Verifica si el usuario puede crear más tareas
   * @param {number} currentCount - cantidad actual de tareas
   * @returns {boolean}
   */
  function canAddTask(currentCount) {
    const plan = getCurrentPlan();
    return currentCount < plan.maxTasks;
  }

  /**
   * Simula el proceso de pago y activación del plan Pro
   * @param {{ cardNumber, expiry, cvv, name }} cardData
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  function processPayment(cardData) {
    return new Promise((resolve) => {
      // Validar datos de tarjeta (simulado)
      const { cardNumber, expiry, cvv, name } = cardData;

      if (!name || name.trim().length < 3) {
        return resolve({ success: false, message: 'Nombre del titular inválido.' });
      }
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (!/^\d{16}$/.test(cleanCard)) {
        return resolve({ success: false, message: 'Número de tarjeta inválido (debe tener 16 dígitos).' });
      }
      if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return resolve({ success: false, message: 'Fecha de expiración inválida (MM/AA).' });
      }
      if (!/^\d{3,4}$/.test(cvv)) {
        return resolve({ success: false, message: 'CVV inválido.' });
      }

      // Simular latencia de API de pago
      setTimeout(() => {
        // 90% éxito, 10% rechazo (simulado)
        if (Math.random() < 0.9) {
          const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 días
          localStorage.setItem(SUB_KEY, JSON.stringify({ planId: 'pro', expiresAt }));
          resolve({ success: true, message: '¡Suscripción Pro activada por 30 días!' });
        } else {
          resolve({ success: false, message: 'Tarjeta rechazada. Verifica los datos.' });
        }
      }, 1200);
    });
  }

  /**
   * Cancela la suscripción actual
   */
  function cancelSubscription() {
    localStorage.removeItem(SUB_KEY);
  }

  /**
   * Renderiza el badge del plan en el sidebar
   */
  function renderPlanBadge() {
    const plan   = getCurrentPlan();
    const target = document.getElementById('plan-badge');
    if (!target) return;
    target.textContent = plan.name.toUpperCase();
    target.style.background = plan.id === 'pro'
      ? 'linear-gradient(135deg, #a78bfa, #4f8cff)'
      : 'rgba(123,130,158,0.2)';
    target.style.color = plan.id === 'pro' ? '#fff' : '#7b829e';
  }

  return { PLANS, getCurrentPlan, canAddTask, processPayment, cancelSubscription, renderPlanBadge };
})();
