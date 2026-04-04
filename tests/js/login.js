'use strict';

const Auth = (() => {
  const SESSION_KEY = 'todo_session';
  const USERS_KEY   = 'todo_users';

  const DEFAULT_USERS = [
    { id: '1', username: 'admin',   password: '1234',    name: 'Administrador' },
    { id: '2', username: 'lbrand', password: 'test19', name: 'Leury Brand' },
  ];

  function _initUsers() {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }
  }

  /**
   * Intenta iniciar sesión con las credenciales dadas
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, user?: Object, message?: string }}
   */
  function login(username, password) {
    _initUsers();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    const user = users.find(
      u => u.username === username.trim() && u.password === password.trim()
    );

    if (!user) {
      return { success: false, message: 'Usuario o contraseña incorrectos.' };
    }

    const session = {
      userId: user.id,
      name: user.name,
      username: user.username,
      loginAt: Date.now()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return { success: true, user: session };
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
  }

  /**
   * @returns {Object|null}
   */
  function getSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function requireAuth() {
    if (!getSession()) {
      window.location.href = 'login.html';
    }
  }

  function initLoginForm() {
    _initUsers();

    if (getSession()) {
      window.location.href = 'index.html';
      return;
    }

    const form  = document.getElementById('login-form');
    const errEl = document.getElementById('login-error');
    const btnEl = document.getElementById('btn-login');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;

      const { valid, message } = Validator.validateLogin(username, password);

      if (!valid) {
        errEl.textContent = message;
        errEl.style.display = 'block';
        return;
      }

      btnEl.disabled = true;
      btnEl.textContent = 'Entrando…';

      setTimeout(() => {
        const result = login(username, password);

        if (result.success) {
          window.location.href = 'index.html';
        } else {
          errEl.textContent = result.message;
          errEl.style.display = 'block';
          btnEl.disabled = false;
          btnEl.textContent = 'Iniciar sesión';
        }
      }, 500);
    });

    form.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('input', () => {
        errEl.style.display = 'none';
      });
    });
  }

  return { login, logout, getSession, requireAuth, initLoginForm };

})();