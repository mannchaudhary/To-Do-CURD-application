// ===== Selectors =====
const todoInput = document.querySelector(".todo-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const filterOption = document.querySelector(".filter-todo");
const clearButton = document.querySelector(".clear-button");
const searchInput = document.getElementById("searchInput");
const stats = {
  total: document.getElementById("total-count"),
  completed: document.getElementById("completed-count"),
  pending: document.getElementById("pending-count"),
};
const emptyState = document.getElementById("empty-state");
const exportButton = document.querySelector(".export-button");
const themeToggle = document.querySelector(".theme-toggle");
const timeDisplay = document.getElementById("timeDisplay");
const icon = document.querySelector(".header-icon");

// ===== Events =====
document.addEventListener("DOMContentLoaded", () => {
  loadTodos();
  setFunIcon();
});
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", handleTodoAction);
filterOption.addEventListener("change", filterTodo);
clearButton.addEventListener("click", clearAll);
searchInput.addEventListener("input", searchTodos);
exportButton.addEventListener("click", exportTodos);
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  setFunIcon();
});

setInterval(() => {
  const now = new Date();
  timeDisplay.textContent = now.toLocaleTimeString();
}, 1000);

function setFunIcon() {
  const isDark = document.body.classList.contains("dark-mode");
  icon.src = isDark
    ? "https://cdn-icons-png.flaticon.com/512/742/742751.png" // Fun moon icon
    : "https://cdn-icons-png.flaticon.com/512/3159/3159066.png"; // Cheerful sun icon
  icon.alt = "Fun header icon";
}

function updateStats() {
  const todos = document.querySelectorAll(".todo");
  const completed = document.querySelectorAll(".todo.completed");
  stats.total.textContent = todos.length;
  stats.completed.textContent = completed.length;
  stats.pending.textContent = todos.length - completed.length;
  emptyState.style.display = todos.length === 0 ? "block" : "none";
}

function getTodosFromStorage() {
  return JSON.parse(localStorage.getItem("todos") || "[]");
}
function saveTodosToStorage(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function createTodoElement(todo) {
  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");
  if (todo.completed) todoDiv.classList.add("completed");

  const li = document.createElement("li");
  li.className = "todo-item";
  li.innerHTML = `<input type="text" value="${todo.text}" readonly />`;
  todoDiv.appendChild(li);

  const completeBtn = document.createElement("button");
  completeBtn.innerHTML = "✔️";
  completeBtn.classList.add("complete-btn");
  todoDiv.appendChild(completeBtn);

  const trashBtn = document.createElement("button");
  trashBtn.innerHTML = "🗑️";
  trashBtn.classList.add("trash-btn");
  todoDiv.appendChild(trashBtn);

  todoList.appendChild(todoDiv);
}

function loadTodos() {
  const todos = getTodosFromStorage();
  todos.forEach(createTodoElement);
  updateStats();
}

function addTodo(e) {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  const newTodo = { text, completed: false };
  const todos = getTodosFromStorage();
  todos.push(newTodo);
  saveTodosToStorage(todos);
  createTodoElement(newTodo);
  todoInput.value = "";
  updateStats();
}

function handleTodoAction(e) {
  const item = e.target;
  const todoDiv = item.closest(".todo");
  const input = todoDiv.querySelector("input[type='text']");
  const text = input.value;

  if (item.classList.contains("complete-btn")) {
    todoDiv.classList.toggle("completed");
    updateTodoInStorage(text, { completed: todoDiv.classList.contains("completed") });
  } else if (item.classList.contains("trash-btn")) {
    todoDiv.classList.add("fall");
    todoDiv.addEventListener("transitionend", () => {
      deleteTodoFromStorage(text);
      todoDiv.remove();
      updateStats();
    });
  } else if (item.tagName === "INPUT") {
    input.removeAttribute("readonly");
    input.focus();
    input.addEventListener("blur", () => saveEditedTodo(text, input));
    input.addEventListener("keypress", e => {
      if (e.key === "Enter") input.blur();
    });
  }
}

function updateTodoInStorage(originalText, changes) {
  let todos = getTodosFromStorage();
  todos = todos.map(todo =>
    todo.text === originalText ? { ...todo, ...changes } : todo
  );
  saveTodosToStorage(todos);
  updateStats();
}

function deleteTodoFromStorage(text) {
  let todos = getTodosFromStorage();
  todos = todos.filter(todo => todo.text !== text);
  saveTodosToStorage(todos);
}

function saveEditedTodo(originalText, input) {
  const newText = input.value.trim();
  input.setAttribute("readonly", true);
  if (!newText) return;
  updateTodoInStorage(originalText, { text: newText });
  const todos = Array.from(document.querySelectorAll(".todo"));
  todos.forEach(todo => {
    const taskInput = todo.querySelector("input[type='text']");
    if (taskInput.value === originalText) {
      taskInput.value = newText;
    }
  });
}

function filterTodo(e) {
  const todos = document.querySelectorAll(".todo");
  todos.forEach(todo => {
    switch (e.target.value) {
      case "all":
        todo.style.display = "flex";
        break;
      case "completed":
        todo.style.display = todo.classList.contains("completed") ? "flex" : "none";
        break;
      case "uncompleted":
        todo.style.display = !todo.classList.contains("completed") ? "flex" : "none";
        break;
    }
  });
}

function clearAll() {
  localStorage.removeItem("todos");
  todoList.innerHTML = "";
  updateStats();
}

function searchTodos() {
  const value = searchInput.value.toLowerCase();
  document.querySelectorAll(".todo").forEach(todo => {
    const text = todo.querySelector("input").value.toLowerCase();
    todo.style.display = text.includes(value) ? "flex" : "none";
  });
}

function exportTodos() {
  const todos = getTodosFromStorage();
  const blob = new Blob([JSON.stringify(todos, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos.json";
  a.click();
  URL.revokeObjectURL(url);
}
