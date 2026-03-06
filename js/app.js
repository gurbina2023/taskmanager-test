import { getCurrentUser, isAuthenticated, login, logout } from "./auth.js";
import {
  ensureSeedData,
  generateId,
  loadTasks,
  saveTasks,
  getUsers,
  createUser,
  loadAllTasksWithOwners,
} from "./storage.js";
import { renderTaskList } from "./dom.js";

let state = {
  user: null,
  tasks: [],
  filters: {
    status: "all",
    priority: "all",
  },
  users: [],
  selectedUser: "all",
};

const elements = {};

document.addEventListener("DOMContentLoaded", () => {
  ensureSeedData();
  cacheDom();
  state.users = getUsers();
  initAuth();
  initEvents();
  refreshUI();
});

function cacheDom() {
  elements.authSection = document.getElementById("auth-section");
  elements.tasksSection = document.getElementById("tasks-section");
  elements.loginForm = document.getElementById("login-form");
  elements.usernameInput = document.getElementById("username");
  elements.passwordInput = document.getElementById("password");
  elements.logoutBtn = document.getElementById("logout-btn");

  elements.currentUserLabel = document.getElementById("current-user-label");

  elements.taskForm = document.getElementById("task-form");
  elements.titleInput = document.getElementById("title");
  elements.descriptionInput = document.getElementById("description");
  elements.priorityInput = document.getElementById("priority");
  elements.dueDateInput = document.getElementById("dueDate");

  elements.assigneeGroup = document.getElementById("assigneeGroup");
  elements.assigneeSelect = document.getElementById("assignee");

  elements.statusFilter = document.getElementById("statusFilter");
  elements.priorityFilter = document.getElementById("priorityFilter");
  elements.userFilterGroup = document.getElementById("userFilterGroup");
  elements.userFilter = document.getElementById("userFilter");

  elements.taskList = document.getElementById("task-list");
  elements.emptyState = document.getElementById("empty-state");

  elements.usersSection = document.getElementById("users-section");
  elements.userForm = document.getElementById("user-form");
  elements.newUsernameInput = document.getElementById("newUsername");
  elements.newPasswordInput = document.getElementById("newPassword");
  elements.newRoleSelect = document.getElementById("newRole");
}

function initAuth() {
  const current = getCurrentUser();
  if (current && current.username) {
    state.user = current;
  }
}

function initEvents() {
  if (elements.loginForm) {
    elements.loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = elements.usernameInput.value;
       const password = elements.passwordInput ? elements.passwordInput.value : "";
      try {
        const user = login(username, password);
        state.user = user;
        elements.usernameInput.value = "";
        if (elements.passwordInput) {
          elements.passwordInput.value = "";
        }
        state.selectedUser = "all";
        state.users = getUsers();
        refreshUI();
      } catch (error) {
        alert(error.message || "No se pudo iniciar sesión.");
      }
    });
  }

  if (elements.logoutBtn) {
    elements.logoutBtn.addEventListener("click", () => {
      logout();
      state.user = null;
      state.tasks = [];
      state.selectedUser = "all";
      refreshUI();
    });
  }

  if (elements.taskForm) {
    elements.taskForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isAuthenticated()) {
        alert("Primero debes iniciar sesión.");
        return;
      }

      const title = elements.titleInput.value.trim();
      const description = elements.descriptionInput.value.trim();
      const priority = elements.priorityInput.value || "medium";
      const dueDate = elements.dueDateInput.value || null;

      if (!title) {
        alert("La tarea debe tener un título.");
        return;
      }

      if (dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        if (due < today) {
          alert("La fecha de vencimiento no puede ser anterior a hoy.");
          return;
        }
      }

      const currentUser = state.user;
      if (!currentUser || !currentUser.username) {
        alert("No se pudo determinar el usuario actual.");
        return;
      }

      let assignedUsername = currentUser.username;
      if (
        isAdmin() &&
        elements.assigneeSelect &&
        elements.assigneeSelect.value &&
        elements.assigneeSelect.value !== "all"
      ) {
        assignedUsername = elements.assigneeSelect.value;
      }

      const newTask = {
        id: generateId(),
        title,
        description,
        priority,
        dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };

      const existingTasks = loadTasks(assignedUsername);
      const updatedTasks = [newTask, ...existingTasks];
      saveTasks(assignedUsername, updatedTasks);

      document.dispatchEvent(
        new CustomEvent("task:created", {
          detail: { task: newTask, username: assignedUsername },
        })
      );

      elements.taskForm.reset();
      elements.priorityInput.value = "medium";
      refreshUI();
    });
  }

  if (elements.statusFilter) {
    elements.statusFilter.addEventListener("change", () => {
      state.filters.status = elements.statusFilter.value;
      refreshTaskListOnly();
    });
  }

  if (elements.priorityFilter) {
    elements.priorityFilter.addEventListener("change", () => {
      state.filters.priority = elements.priorityFilter.value;
      document.dispatchEvent(
        new CustomEvent("tasks:filtersChanged", {
          detail: { ...state.filters },
        })
      );
      refreshTaskListOnly();
    });
  }

  if (elements.userFilter) {
    elements.userFilter.addEventListener("change", () => {
      state.selectedUser = elements.userFilter.value || "all";
      refreshTaskListOnly();
    });
  }

  if (elements.userForm) {
    elements.userForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!isAdmin()) {
        alert("Solo un administrador puede crear usuarios.");
        return;
      }

      const username = elements.newUsernameInput.value;
      const password = elements.newPasswordInput.value;
      const role = elements.newRoleSelect.value;

      try {
        createUser({ username, password, role });
        elements.userForm.reset();
        state.users = getUsers();
        populateUserSelects();
        alert("Usuario creado correctamente.");
      } catch (error) {
        alert(error.message || "No se pudo crear el usuario.");
      }
    });
  }
}

function refreshUI() {
  const loggedIn = isAuthenticated();

  if (loggedIn) {
    elements.authSection.classList.add("is-hidden");
    elements.tasksSection.classList.remove("is-hidden");
  } else {
    elements.authSection.classList.remove("is-hidden");
    elements.tasksSection.classList.add("is-hidden");
  }

  updateRoleUI();
  refreshTaskListOnly();
}

function refreshTaskListOnly() {
  if (!elements.taskList || !elements.emptyState) return;

  const tasksForView = getTasksForView();
  state.tasks = tasksForView;

  renderTaskList(
    elements.taskList,
    elements.emptyState,
    tasksForView,
    state.filters,
    {
      onToggle: (id, username) => handleToggleTask(id, username),
      onDelete: (id, username) => handleDeleteTask(id, username),
    }
  );
}

function handleToggleTask(id, username) {
  const targetUsername =
    username || (state.user && state.user.username) || null;
  if (!targetUsername) return;

  const tasks = loadTasks(targetUsername);
  const updated = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks(targetUsername, updated);

  document.dispatchEvent(
    new CustomEvent("task:toggled", {
      detail: { id, username: targetUsername },
    })
  );

  refreshTaskListOnly();
}

function handleDeleteTask(id, username) {
  const targetUsername =
    username || (state.user && state.user.username) || null;
  if (!targetUsername) return;

  if (!confirm("¿Eliminar esta tarea?")) return;

  const tasks = loadTasks(targetUsername);
  const updated = tasks.filter((task) => task.id !== id);
  saveTasks(targetUsername, updated);

  document.dispatchEvent(
    new CustomEvent("task:deleted", {
      detail: { id, username: targetUsername },
    })
  );

  refreshTaskListOnly();
}

function isAdmin() {
  return state.user && state.user.role === "ADMIN";
}

function updateRoleUI() {
  if (!elements.currentUserLabel) return;

  if (!state.user) {
    elements.currentUserLabel.textContent = "";
    if (elements.assigneeGroup)
      elements.assigneeGroup.classList.add("is-hidden");
    if (elements.userFilterGroup)
      elements.userFilterGroup.classList.add("is-hidden");
    if (elements.usersSection)
      elements.usersSection.classList.add("is-hidden");
    return;
  }

  const roleLabel = isAdmin() ? "Administrador" : "Usuario normal";
  elements.currentUserLabel.textContent = `Sesión: ${state.user.username} (${roleLabel})`;

  if (isAdmin()) {
    if (elements.assigneeGroup)
      elements.assigneeGroup.classList.remove("is-hidden");
    if (elements.userFilterGroup)
      elements.userFilterGroup.classList.remove("is-hidden");
    if (elements.usersSection)
      elements.usersSection.classList.remove("is-hidden");
    state.users = getUsers();
    populateUserSelects();
  } else {
    if (elements.assigneeGroup)
      elements.assigneeGroup.classList.add("is-hidden");
    if (elements.userFilterGroup)
      elements.userFilterGroup.classList.add("is-hidden");
    if (elements.usersSection)
      elements.usersSection.classList.add("is-hidden");
  }
}

function populateUserSelects() {
  if (!elements.assigneeSelect || !elements.userFilter) return;

  const users = state.users || [];
  const sorted = [...users].sort((a, b) =>
    a.username.localeCompare(b.username)
  );

  elements.assigneeSelect.innerHTML = "";
  sorted.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.username;
    option.textContent = user.username;
    elements.assigneeSelect.appendChild(option);
  });

  elements.userFilter.innerHTML = "";
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "Todos";
  elements.userFilter.appendChild(allOption);

  sorted.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.username;
    option.textContent = user.username;
    elements.userFilter.appendChild(option);
  });

  elements.userFilter.value = state.selectedUser || "all";
}

function getTasksForView() {
  if (!state.user || !state.user.username) {
    return [];
  }

  if (isAdmin()) {
    const all = loadAllTasksWithOwners();
    if (state.selectedUser && state.selectedUser !== "all") {
      return all.filter((task) => task.username === state.selectedUser);
    }
    return all;
  }

  const own = loadTasks(state.user.username);
  return own.map((task) => ({ ...task, username: state.user.username }));
}

