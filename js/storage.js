// Módulo de utilidades para almacenamiento en localStorage

const TASKS_KEY = "taskManager:tasks";
const USERS_KEY = "taskManager:users";
const USER_KEY = "taskManager:user";

/**
 * Genera un id simple basado en fecha + aleatorio.
 */
export function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
}

/**
 * Guarda el usuario actual (para este ejemplo, solo el nombre).
 * @param {string|null} username
 */
export function saveCurrentUser(username) {
  if (!username) {
    localStorage.removeItem(USER_KEY);
    return;
  }
  localStorage.setItem(USER_KEY, JSON.stringify({ username }));
}

/**
 * Devuelve el usuario actual o null.
 * @returns {{username: string}|null}
 */
export function loadCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Guarda el arreglo de tareas del usuario.
 * @param {string} username
 * @param {Array} tasks
 */
export function saveTasks(username, tasks) {
  if (!username) return;
  const allByUser = loadAllUserTasks();
  allByUser[username] = tasks;
  localStorage.setItem(TASKS_KEY, JSON.stringify(allByUser));
}

/**
 * Carga las tareas del usuario.
 * @param {string} username
 * @returns {Array}
 */
export function loadTasks(username) {
  if (!username) return [];
  const allByUser = loadAllUserTasks();
  return Array.isArray(allByUser[username]) ? allByUser[username] : [];
}

function loadAllUserTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function ensureSeedData() {
  const hasUsers = !!localStorage.getItem(USERS_KEY);
  if (hasUsers) return;

  const users = [
    { id: generateId(), username: "admin", password: "admin123", role: "ADMIN" },
    { id: generateId(), username: "juan", password: "juan123", role: "USER" },
    { id: generateId(), username: "ana", password: "ana123", role: "USER" },
  ];

  const now = new Date();
  const iso = (date) => date.toISOString().slice(0, 10);

  const tasksByUser = {
    admin: [
      {
        id: generateId(),
        title: "Revisar tablero de tareas",
        description: "Verificar el avance general del equipo.",
        priority: "high",
        dueDate: iso(new Date(now.getTime() + 24 * 60 * 60 * 1000)),
        completed: false,
        createdAt: now.toISOString(),
      },
    ],
    juan: [
      {
        id: generateId(),
        title: "Preparar informe semanal",
        description: "",
        priority: "medium",
        dueDate: iso(new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)),
        completed: false,
        createdAt: now.toISOString(),
      },
      {
        id: generateId(),
        title: "Actualizar documentación",
        description: "",
        priority: "low",
        dueDate: iso(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
        completed: false,
        createdAt: now.toISOString(),
      },
    ],
    ana: [
      {
        id: generateId(),
        title: "Llamar a cliente X",
        description: "",
        priority: "high",
        dueDate: iso(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
        completed: false,
        createdAt: now.toISOString(),
      },
      {
        id: generateId(),
        title: "Organizar archivos",
        description: "",
        priority: "medium",
        dueDate: iso(new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)),
        completed: true,
        createdAt: now.toISOString(),
      },
    ],
  };

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(TASKS_KEY, JSON.stringify(tasksByUser));
}

export function getUsers() {
  return loadUsers();
}

export function createUser({ username, password, role }) {
  const trimmedUsername = String(username || "").trim();
  const trimmedPassword = String(password || "").trim();
  const normalizedRole = role === "ADMIN" ? "ADMIN" : "USER";

  if (!trimmedUsername) {
    throw new Error("El nombre de usuario es obligatorio.");
  }
  if (!trimmedPassword || trimmedPassword.length < 4) {
    throw new Error("La contraseña debe tener al menos 4 caracteres.");
  }

  const users = loadUsers();
  const exists = users.some(
    (u) => u.username.toLowerCase() === trimmedUsername.toLowerCase()
  );
  if (exists) {
    throw new Error("Ya existe un usuario con ese nombre.");
  }

  const user = {
    id: generateId(),
    username: trimmedUsername,
    password: trimmedPassword,
    role: normalizedRole,
  };

  const updated = [...users, user];
  saveUsers(updated);
  return user;
}

export function findUserByCredentials(username, password) {
  const users = loadUsers();
  const trimmedUsername = String(username || "").trim().toLowerCase();
  const trimmedPassword = String(password || "").trim();

  return (
    users.find(
      (u) =>
        u.username.toLowerCase() === trimmedUsername &&
        u.password === trimmedPassword
    ) || null
  );
}

export function loadAllTasksWithOwners() {
  const allByUser = loadAllUserTasks();
  const entries = Object.entries(allByUser);
  return entries.flatMap(([username, tasks]) =>
    Array.isArray(tasks)
      ? tasks.map((task) => ({ ...task, username }))
      : []
  );
}

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
