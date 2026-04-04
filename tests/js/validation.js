'use strict';

const Validator = (() => {

  /**
   * Reglas de validación para el formulario de tareas
   */
  const RULES = {
    title: {
      required: true,
      minLength: 3,
      maxLength: 80,
    },
    description: {
      required: false,
      maxLength: 300,
    },
    priority: {
      required: true,
      enum: ['alta', 'media', 'baja'],
    },
    dueDate: {
      required: false,
    },
  };

  /**
   * Valida un campo individual
   * @param {string} field - nombre del campo
   * @param {string} value - valor del campo
   * @returns {{ valid: boolean, message: string }}
   */
  function validateField(field, value) {
    const rule = RULES[field];
    if (!rule) return { valid: true, message: '' };

    const v = String(value).trim();

    if (rule.required && v === '') {
      return { valid: false, message: 'Este campo es obligatorio.' };
    }

    if (rule.minLength && v.length < rule.minLength && v !== '') {
      return { valid: false, message: `Mínimo ${rule.minLength} caracteres.` };
    }

    if (rule.maxLength && v.length > rule.maxLength) {
      return { valid: false, message: `Máximo ${rule.maxLength} caracteres.` };
    }

    if (rule.enum && v !== '' && !rule.enum.includes(v)) {
      return { valid: false, message: `Valor no permitido.` };
    }

    if (field === 'dueDate' && v !== '') {
      const today = Utils.todayISO();
      if (v < today) {
        return { valid: false, message: 'La fecha no puede ser anterior a hoy.' };
      }
    }

    return { valid: true, message: '' };
  }

  /**
   * Valida todo el formulario de tarea
   * @param {{ title, description, priority, dueDate }} data
   * @returns {{ valid: boolean, errors: Object }}
   */
  function validateTask(data) {
    const errors = {};
    let valid = true;

    for (const field of Object.keys(RULES)) {
      const result = validateField(field, data[field] ?? '');
      if (!result.valid) {
        errors[field] = result.message;
        valid = false;
      }
    }

    return { valid, errors };
  }

  /**
   * Muestra errores de validación en el DOM
   * @param {Object} errors - { campo: mensaje }
   */
  function showErrors(errors) {
    // limpiar errores previos
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(el => {
      el.classList.remove('show');
      el.textContent = '';
    });

    for (const [field, msg] of Object.entries(errors)) {
      const input = document.getElementById(`task-${field}`);
      const errEl = document.getElementById(`err-${field}`);
      if (input) input.classList.add('error');
      if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
    }
  }

  /**
   * Limpia todos los errores del formulario
   */
  function clearErrors() {
    document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.form-error').forEach(el => {
      el.classList.remove('show');
      el.textContent = '';
    });
  }

  /**
   * Valida credenciales de login
   * @param {string} username
   * @param {string} password
   * @returns {{ valid: boolean, message: string }}
   */
  function validateLogin(username, password) {
    if (!username.trim()) return { valid: false, message: 'El usuario es obligatorio.' };
    if (!password.trim()) return { valid: false, message: 'La contraseña es obligatoria.' };
    if (username.trim().length < 3) return { valid: false, message: 'Usuario muy corto.' };
    if (password.trim().length < 4) return { valid: false, message: 'Contraseña muy corta.' };
    return { valid: true, message: '' };
  }

  return { validateField, validateTask, showErrors, clearErrors, validateLogin };
})();
