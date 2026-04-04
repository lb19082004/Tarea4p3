'use strict';

const TaskStore = (() => {
  const KEY = 'todo_tasks';

  function getAll() {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  }
  function save(tasks) {
    localStorage.setItem(KEY, JSON.stringify(tasks));
  }
  function getById(id) {
    return getAll().find(t => t.id === id) || null;
  }
  function create(data) {
    const tasks = getAll();
    const task = {
      id:          Utils.generateId(),
      title:       data.title.trim(),
      description: data.description.trim(),
      priority:    data.priority,
      dueDate:     data.dueDate || null,
      done:        false,
      createdAt:   new Date().toISOString(),
    };
    tasks.unshift(task);
    save(tasks);
    return task;
  }
  function update(id, data) {
    const tasks = getAll();
    const idx   = tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    tasks[idx] = { ...tasks[idx], ...data, updatedAt: new Date().toISOString() };
    save(tasks);
    return tasks[idx];
  }
  function remove(id) {
    const tasks = getAll().filter(t => t.id !== id);
    save(tasks);
  }
  function toggle(id) {
    const task = getById(id);
    if (!task) return null;
    return update(id, { done: !task.done });
  }
  function stats() {
    const all   = getAll();
    const done  = all.filter(t => t.done).length;
    const high  = all.filter(t => t.priority === 'alta' && !t.done).length;
    return { total: all.length, done, pending: all.length - done, highPriority: high };
  }
  return { getAll, getById, create, update, remove, toggle, stats };
})();

function showToast(message, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${Utils.escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}


const Modal = (() => {
  const overlay = () => document.getElementById('task-modal');
  function open()  { overlay().classList.add('open'); }
  function close() {
    overlay().classList.remove('open');
    document.getElementById('task-form').reset();
    Validator.clearErrors();
    document.getElementById('editing-id').value = '';
    document.getElementById('modal-title').textContent = 'Nueva Tarea';
  }
  return { open, close };
})();


function renderStats() {
  const s = TaskStore.stats();
  document.getElementById('stat-total').textContent    = s.total;
  document.getElementById('stat-done').textContent     = s.done;
  document.getElementById('stat-pending').textContent  = s.pending;
  document.getElementById('stat-high').textContent     = s.highPriority;


  const badge = document.getElementById('sidebar-count');
  if (badge) badge.textContent = s.pending;
}

let currentFilter = 'all';

function renderTasks() {
  let tasks = TaskStore.getAll();

  if (currentFilter === 'pending')  tasks = tasks.filter(t => !t.done);
  if (currentFilter === 'done')     tasks = tasks.filter(t => t.done);
  if (currentFilter === 'alta')     tasks = tasks.filter(t => t.priority === 'alta');
  if (currentFilter === 'media')    tasks = tasks.filter(t => t.priority === 'media');
  if (currentFilter === 'baja')     tasks = tasks.filter(t => t.priority === 'baja');

  const list = document.getElementById('task-list');

  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="icon">📭</div>
        <p>No hay tareas en esta vista.<br>¡Crea una nueva!</p>
      </div>`;
    return;
  }

  list.innerHTML = tasks.map(t => `
    <div class="task-card ${t.done ? 'done' : ''}" data-id="${t.id}">
      <div class="task-check ${t.done ? 'checked' : ''}" data-check="${t.id}"></div>
      <div class="task-body">
        <div class="task-title">${Utils.escapeHtml(t.title)}</div>
        ${t.description ? `<div class="task-desc">${Utils.escapeHtml(t.description)}</div>` : ''}
        <div class="task-meta">
          <span class="tag tag-${t.priority}">${t.priority.toUpperCase()}</span>
          ${t.dueDate ? `<span class="tag tag-date">📅 ${Utils.formatDate(t.dueDate)}</span>` : ''}
          ${t.dueDate ? `<span class="tag tag-date" style="opacity:.7;font-size:.68rem">${Utils.dueDays(t.dueDate)}</span>` : ''}
          <span class="tag ${t.done ? 'tag-done' : 'tag-pending'}">${t.done ? 'Completada' : 'Pendiente'}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-ghost btn-sm" data-edit="${t.id}" title="Editar">✏️</button>
        <button class="btn btn-danger btn-sm" data-delete="${t.id}" title="Eliminar">🗑️</button>
      </div>
    </div>
  `).join('');


  list.querySelectorAll('[data-check]').forEach(el => {
    el.addEventListener('click', () => {
      TaskStore.toggle(el.dataset.check);
      renderAll();
      showToast('Tarea actualizada', 'success');
    });
  });
  list.querySelectorAll('[data-edit]').forEach(el => {
    el.addEventListener('click', () => openEdit(el.dataset.edit));
  });
  list.querySelectorAll('[data-delete]').forEach(el => {
    el.addEventListener('click', () => deleteTask(el.dataset.delete));
  });
}

function renderAll() {
  renderStats();
  renderTasks();
  Payment.renderPlanBadge();
}


function openCreate() {
  const s = TaskStore.stats();
  if (!Payment.canAddTask(s.total)) {
    showToast('Límite de tareas alcanzado. Actualiza a Pro para más.', 'error');
    return;
  }
  Modal.open();
}

function openEdit(id) {
  const task = TaskStore.getById(id);
  if (!task) return;
  document.getElementById('editing-id').value     = id;
  document.getElementById('task-title').value      = task.title;
  document.getElementById('task-description').value = task.description;
  document.getElementById('task-priority').value   = task.priority;
  document.getElementById('task-dueDate').value    = task.dueDate || '';
  document.getElementById('modal-title').textContent = 'Editar Tarea';
  Modal.open();
}

function deleteTask(id) {
  if (!confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')) return;
  TaskStore.remove(id);
  renderAll();
  showToast('Tarea eliminada', 'error');
}

function handleFormSubmit(e) {
  e.preventDefault();
  const data = {
    title:       document.getElementById('task-title').value,
    description: document.getElementById('task-description').value,
    priority:    document.getElementById('task-priority').value,
    dueDate:     document.getElementById('task-dueDate').value,
  };

  const { valid, errors } = Validator.validateTask(data);
  if (!valid) { Validator.showErrors(errors); return; }
  Validator.clearErrors();

  const editingId = document.getElementById('editing-id').value;
  if (editingId) {
    TaskStore.update(editingId, data);
    showToast('Tarea actualizada correctamente', 'success');
  } else {
    TaskStore.create(data);
    showToast('Tarea creada correctamente', 'success');
  }

  Modal.close();
  renderAll();
}


document.addEventListener('DOMContentLoaded', () => {

  Auth.requireAuth();


  const session = Auth.getSession();
  if (session) {
    document.getElementById('user-name').textContent  = session.name;
    document.getElementById('user-initial').textContent = session.name.charAt(0).toUpperCase();
  }

  renderAll();

 
  document.getElementById('btn-new-task').addEventListener('click', openCreate);
  document.getElementById('btn-new-task-2').addEventListener('click', openCreate);


  document.getElementById('task-form').addEventListener('submit', handleFormSubmit);

  document.getElementById('modal-close').addEventListener('click', Modal.close);
  document.getElementById('btn-cancel').addEventListener('click', Modal.close);
  document.getElementById('task-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) Modal.close();
  });


  document.getElementById('btn-logout').addEventListener('click', Auth.logout);


  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });


  document.getElementById('task-dueDate').min = Utils.todayISO();
});
