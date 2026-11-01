/* ---------------------------------------------------------
   app.js
   Main logic for the Student Study Planner.
   Features: add, display, complete/uncomplete, delete,
   input validation, empty message, saving after refresh,
   plus two small extras (priority label + status filter).
--------------------------------------------------------- */

// ---------- State ----------
let tasks = loadTasks();
let currentFilter = "all";

// ---------- Element references ----------
const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const subjectInput = document.getElementById("task-subject");
const priorityInput = document.getElementById("task-priority");
const errorBox = document.getElementById("form-error");
const listEl = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const emptyText = document.getElementById("empty-text");
const summaryEl = document.getElementById("summary");
const filterButtons = document.querySelectorAll(".filter-btn");

// ---------- Helpers ----------
function createId() {
  return "task-" + Date.now() + "-" + Math.random().toString(16).slice(2, 8);
}

// Only safe, escaped text is ever placed into the page.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showError(message) {
  errorBox.textContent = message;
  if (message) {
    titleInput.setAttribute("aria-invalid", "true");
  } else {
    titleInput.removeAttribute("aria-invalid");
  }
}

// ---------- Rendering ----------
function getVisibleTasks() {
  if (currentFilter === "active") return tasks.filter((t) => !t.completed);
  if (currentFilter === "completed") return tasks.filter((t) => t.completed);
  return tasks;
}

function render() {
  const visible = getVisibleTasks();
  listEl.innerHTML = "";

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " is-done" : "");
    li.dataset.id = task.id;

    li.innerHTML = `
      <input
        class="task-check"
        type="checkbox"
        ${task.completed ? "checked" : ""}
        aria-label="Mark task complete"
        data-action="toggle"
      />
      <div class="task-body">
        <div class="task-title">${escapeHtml(task.title)}</div>
        <div class="task-meta">
          ${task.subject ? `<span class="subject-chip">${escapeHtml(task.subject)}</span>` : ""}
          <span class="priority-chip ${escapeHtml(task.priority || "Normal")}">${escapeHtml(task.priority || "Normal")}</span>
        </div>
      </div>
      <button class="btn-delete" type="button" data-action="delete">Delete</button>
    `;

    listEl.appendChild(li);
  });

  // Empty message (also covers "no tasks match this filter")
  if (visible.length === 0) {
    emptyState.classList.add("is-visible");
    if (tasks.length === 0) {
      emptyText.textContent = "No tasks yet. Add your first study task above to get started.";
    } else if (currentFilter === "active") {
      emptyText.textContent = "No active tasks. Everything is complete. Well done!";
    } else {
      emptyText.textContent = "No completed tasks yet. Keep going!";
    }
  } else {
    emptyState.classList.remove("is-visible");
  }

  // Summary bar
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  summaryEl.innerHTML = `
    <span><strong>${total}</strong> task${total === 1 ? "" : "s"} total</span>
    <span><strong>${done}</strong> completed &middot; <strong>${total - done}</strong> remaining</span>
  `;
}

// ---------- Actions ----------
function addTask(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const subject = subjectInput.value.trim();
  const priority = priorityInput.value;

  // Required feature: reject a blank title.
  if (!title) {
    showError("Please enter a task title before adding.");
    titleInput.focus();
    return;
  }

  showError("");

  tasks.push({
    id: createId(),
    title: title,
    subject: subject,
    priority: priority,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  saveTasks(tasks);
  render();

  form.reset();
  priorityInput.value = "Normal";
  titleInput.focus();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks(tasks);
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks(tasks);
  render();
}

// ---------- Events ----------
form.addEventListener("submit", addTask);

listEl.addEventListener("click", (event) => {
  const action = event.target.dataset.action;
  if (!action) return;
  const id = event.target.closest(".task-item").dataset.id;
  if (action === "delete") deleteTask(id);
});

listEl.addEventListener("change", (event) => {
  if (event.target.dataset.action === "toggle") {
    const id = event.target.closest(".task-item").dataset.id;
    toggleTask(id);
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentFilter = btn.dataset.filter;
    render();
  });
});

// ---------- Start ----------
render();
