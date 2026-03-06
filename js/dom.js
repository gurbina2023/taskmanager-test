// Módulo encargado de manipular el DOM (renderizar tareas, manejar eventos, etc.).

/**
 * Renderiza la lista de tareas en el contenedor dado.
 * @param {HTMLElement} listElement
 * @param {HTMLElement} emptyStateElement
 * @param {Array} tasks
 * @param {{ status?: string, priority?: string }} filters
 * @param {{ onToggle(id: string, username?: string): void, onDelete(id: string, username?: string): void }} handlers
 */
export function renderTaskList(
  listElement,
  emptyStateElement,
  tasks,
  filters,
  handlers
) {
  listElement.innerHTML = "";

  const filtered = tasks.filter((task) => {
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "pending" && !task.completed) ||
      (filters.status === "completed" && task.completed);

    const matchesPriority =
      filters.priority === "all" || task.priority === filters.priority;

    return matchesStatus && matchesPriority;
  });

  if (!filtered.length) {
    emptyStateElement.classList.remove("is-hidden");
    return;
  }

  emptyStateElement.classList.add("is-hidden");

  filtered.forEach((task) => {
    const overdue = isTaskOverdue(task);

    const li = document.createElement("li");
    li.className = "task-item";
    li.dataset.id = task.id;

    if (overdue) {
      li.classList.add("task-overdue");
    }

    // Toggle completado
    const left = document.createElement("div");
    left.className = "task-left";
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "task-toggle" + (task.completed ? " completed" : "");
    toggle.innerHTML = "<span></span>";
    toggle.addEventListener("click", () => handlers.onToggle(task.id, task.username));
    left.appendChild(toggle);

    // Contenido principal
    const content = document.createElement("div");
    content.className = "task-content";

    const title = document.createElement("p");
    title.className =
      "task-title" + (task.completed ? " completed" : "");
    title.textContent = task.title;

    const chips = document.createElement("div");
    chips.className = "task-meta";

    if (task.dueDate) {
      const dueChip = document.createElement("span");
      dueChip.className = "task-chip" + (overdue ? " overdue" : "");
      dueChip.textContent = overdue
        ? `Vencida: ${formatDate(task.dueDate)}`
        : `Vence: ${formatDate(task.dueDate)}`;
      chips.appendChild(dueChip);
    }

    if (task.username) {
      const userChip = document.createElement("span");
      userChip.className = "task-chip";
      userChip.textContent = `Usuario: ${task.username}`;
      chips.appendChild(userChip);
    }

    const priorityChip = document.createElement("span");
    priorityChip.className = `task-chip priority-${task.priority}`;
    priorityChip.textContent =
      task.priority === "high"
        ? "Alta"
        : task.priority === "medium"
        ? "Media"
        : "Baja";
    chips.appendChild(priorityChip);

    const statusChip = document.createElement("span");
    statusChip.className = `task-chip status-${
      task.completed ? "completed" : "pending"
    }`;
    statusChip.textContent = task.completed ? "Completada" : "Pendiente";
    chips.appendChild(statusChip);

    if (task.description) {
      const description = document.createElement("p");
      description.className = "task-description";
      description.textContent = task.description;
      description.style.margin = "2px 0 0";
      description.style.fontSize = "0.8rem";
      description.style.color = "var(--text-muted)";
      content.appendChild(title);
      content.appendChild(chips);
      content.appendChild(description);
    } else {
      content.appendChild(title);
      content.appendChild(chips);
    }

    // Acciones
    const actions = document.createElement("div");
    actions.className = "task-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-icon delete";
    deleteBtn.title = "Eliminar tarea";
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => handlers.onDelete(task.id, task.username));

    actions.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(content);
    li.appendChild(actions);

    listElement.appendChild(li);
  });
}

function formatDate(isoDate) {
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function isTaskOverdue(task) {
  if (!task || !task.dueDate || task.completed) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  } catch {
    return false;
  }
}

