# ✅ CRUD To-Do List

Proyecto CRUD funcional desarrollado con HTML, CSS y JavaScript puro (sin backend).  
Gestiona tareas con las operaciones: **Crear, Leer, Actualizar y Eliminar**.

## 📋 Características

- Agregar nuevas tareas con título, descripción, prioridad y fecha límite
- Listar todas las tareas con filtros por estado y prioridad
- Editar tareas existentes
- Eliminar tareas con confirmación
- Marcar tareas como completadas
- Validación de formularios
- Dashboard con estadísticas
- Persistencia con localStorage
- Diseño responsivo

## 🗂️ Estructura del proyecto

```
crud-tareas/
├── index.html              # Página principal (feature/user-dashboard)
├── css/
│   └── styles.css          # Estilos globales
├── js/
│   ├── app.js              # Lógica principal
│   ├── login.js            # Módulo de autenticación (feature/login-form)
│   ├── validation.js       # Validaciones (feature/validate-user-input)
│   ├── payment.js          # Módulo de pagos/suscripción (feature/payment-api-integration)
│   └── utils.js            # Utilidades y fechas (hotfix/fix-date-format)
├── login.html              # Página de login
└── README.md
```



## 🌿 Flujo Git Flow

| Rama | Descripción |
|------|-------------|
| `main` | Código en producción |
| `developer` | Integración de features |
| `qa` | Control de calidad |
| `feature/login-form` | Formulario de autenticación |
| `feature/validate-user-input` | Validación de entradas |
| `feature/payment-api-integration` | Módulo de suscripción |
| `feature/user-dashboard` | Panel principal |
| `hotfix/fix-date-format` | Corrección de formato de fechas |

## 👨‍💻 Tecnologías

- HTML5
- CSS3 (variables, flexbox, grid)
- JavaScript ES6+ (localStorage, módulos)




