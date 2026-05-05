import { getTodos, saveTodos } from './storage.js';
import { renderTodos } from './render.js';
import { openEditModal, closeEditModal, getEditData } from './modal.js';
import { showToast } from './toast.js';

const todoRegex = /^[A-Za-z0-9][A-Za-z0-9 ,.!?'"-]{2,99}$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 100;
const UNDO_DURATION = 5000;

let todos = getTodos();
let state = {
  filter: 'all',
  search: ''
};

let editTodoId = null;
let lastDeletedTodo = null;
let lastDeletedTimer = null;

// DOM Elements
const todoInput = document.getElementById('todoInput');
const todoDate = document.getElementById('todoDate');
const todoPriority = document.getElementById('todoPriority');
const addTodoBtn = document.getElementById('addTodoBtn');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterButtons = document.querySelectorAll('.filter-btns button');
const editModal = document.getElementById('editModal');

function updateUI() {
  renderTodos(todos, state, {
    onToggleComplete: toggleComplete,
    onPriorityChange: changePriority,
    onEdit: handleOpenEdit,
    onDelete: deleteTodo
  });
}

// Features
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  themeToggle.innerHTML = newTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  themeToggle.innerHTML = savedTheme === 'light' ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
}

function addTodo() {
  const text = todoInput.value.trim();
  if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
    showToast(`Task must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`);
    return;
  }
  if (!todoRegex.test(text)) {
    showToast('Invalid characters in task description.');
    return;
  }

  const newTodo = {
    id: Date.now(),
    text,
    dueDate: todoDate.value,
    priority: todoPriority.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  todos.push(newTodo);
  saveTodos(todos);
  updateUI();
  
  // Reset
  todoInput.value = '';
  todoDate.value = '';
  todoPriority.value = 'medium';
  showToast('Task added successfully!');
}

function deleteTodo(id) {
  const todoToDelete = todos.find(t => t.id === id);
  if (!todoToDelete) return;

  todos = todos.filter(t => t.id !== id);
  saveTodos(todos);
  updateUI();

  lastDeletedTodo = todoToDelete;
  if (lastDeletedTimer) clearTimeout(lastDeletedTimer);
  showToast('Task deleted. ', undoDeletion);
  lastDeletedTimer = setTimeout(() => { lastDeletedTodo = null; }, UNDO_DURATION);
}

function undoDeletion() {
  if (lastDeletedTodo) {
    todos.push(lastDeletedTodo);
    saveTodos(todos);
    updateUI();
    lastDeletedTodo = null;
    showToast('Task restored.');
  }
}

function toggleComplete(id) {
  todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
  saveTodos(todos);
  updateUI();
}

function changePriority(id, newPriority) {
  todos = todos.map(t => t.id === id ? { ...t, priority: newPriority } : t);
  saveTodos(todos);
  updateUI();
}

function handleOpenEdit(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    editTodoId = openEditModal(todo);
  }
}

function saveEditedTodo() {
  const data = getEditData();
  if (data.text.length < MIN_LENGTH || data.text.length > MAX_LENGTH) {
    showToast('Invalid task length.');
    return;
  }

  todos = todos.map(t => t.id === editTodoId ? { ...t, ...data } : t);
  saveTodos(todos);
  updateUI();
  closeEditModal();
  showToast('Task updated.');
}

// Listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => e.key === 'Enter' && addTodo());

searchInput.addEventListener('input', e => {
  state.search = e.target.value;
  updateUI();
});

themeToggle.addEventListener('click', toggleTheme);

saveEditBtn.addEventListener('click', saveEditedTodo);
cancelEditBtn.addEventListener('click', closeEditModal);

clearCompletedBtn.addEventListener('click', () => {
  const initialCount = todos.length;
  todos = todos.filter(t => !t.completed);
  if (todos.length < initialCount) {
    saveTodos(todos);
    updateUI();
    showToast('Cleared completed tasks.');
  } else {
    showToast('No completed tasks to clear.');
  }
});

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    state.filter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle('active', b === btn));
    updateUI();
  });
});

// Start
initTheme();
updateUI();
