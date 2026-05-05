import { getTodos, saveTodos } from './storage.js';
import { renderTodos } from './render.js';
import { openEditModal, closeEditModal } from './modal.js';
import { showToast } from './toast.js';

const todoRegex = /^[A-Za-z0-9][A-Za-z0-9 ,.!?'"-]{2,99}$/;
const MIN_LENGTH = 3;
const MAX_LENGTH = 100;
const UNDO_DURATION = 5000;

let todos = getTodos();
let currentFilter = 'all';
let editTodoId = null;
let lastDeletedTodo = null;
let lastDeletedTimer = null;

const todoInput = document.getElementById('todoInput');
const todoPriority = document.getElementById('todoPriority');
const addTodoBtn = document.getElementById('addTodoBtn');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const filterButtons = document.querySelectorAll('.filter-btns button');
const editTodoInput = document.getElementById('editTodoInput');
const editModal = document.getElementById('editModal');

function isValidTodo(text) {
  return todoRegex.test(text);
}

function updateUI() {
  renderTodos(todos, currentFilter, {
    onToggleComplete: toggleComplete,
    onPriorityChange: changePriority,
    onEdit: handleOpenEdit,
    onDelete: deleteTodo
  });
}

function addTodo() {
  const text = todoInput.value.trim();
  if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
    showToast(`Todo must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`);
    return;
  }
  if (!isValidTodo(text)) {
    showToast('Invalid characters or todo cannot start with punctuation.');
    return;
  }
  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    priority: todoPriority.value
  };
  todos.push(newTodo);
  saveTodos(todos);
  updateUI();
  todoInput.value = '';
  todoPriority.value = 'medium';
  showToast('Todo added successfully!');
}

function deleteTodo(id) {
  const todoToDelete = todos.find(todo => todo.id === id);
  if (!todoToDelete) return;
  todos = todos.filter(todo => todo.id !== id);
  saveTodos(todos);
  updateUI();
  lastDeletedTodo = todoToDelete;
  if (lastDeletedTimer) clearTimeout(lastDeletedTimer);
  showToast('Todo deleted. ', undoDeletion);
  lastDeletedTimer = setTimeout(() => {
    lastDeletedTodo = null;
  }, UNDO_DURATION);
}

function undoDeletion() {
  if (lastDeletedTodo) {
    todos.push(lastDeletedTodo);
    saveTodos(todos);
    updateUI();
    lastDeletedTodo = null;
    if (lastDeletedTimer) clearTimeout(lastDeletedTimer);
    showToast('Deletion undone.');
  }
}

function toggleComplete(id) {
  todos = todos.map(todo => {
    if (todo.id === id) todo.completed = !todo.completed;
    return todo;
  });
  saveTodos(todos);
  updateUI();
}

function changePriority(id, newPriority) {
  todos = todos.map(todo => {
    if (todo.id === id) todo.priority = newPriority;
    return todo;
  });
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
  const newText = editTodoInput.value.trim();
  if (newText.length < MIN_LENGTH || newText.length > MAX_LENGTH) {
    showToast(`Todo must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters.`);
    return;
  }
  if (!isValidTodo(newText)) {
    showToast('Invalid characters or todo cannot start with punctuation.');
    return;
  }
  todos = todos.map(todo => {
    if (todo.id === editTodoId) todo.text = newText;
    return todo;
  });
  saveTodos(todos);
  updateUI();
  closeEditModal();
  showToast('Todo updated.');
}

function clearCompletedTodos() {
  const hasCompleted = todos.some(todo => todo.completed);
  if (!hasCompleted) {
    showToast('No completed todos to clear.');
    return;
  }
  todos = todos.filter(todo => !todo.completed);
  saveTodos(todos);
  updateUI();
  showToast('Completed todos cleared.');
}

function setFilter(filter) {
  currentFilter = filter;
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  updateUI();
}

// Event Listeners
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') addTodo();
});
saveEditBtn.addEventListener('click', saveEditedTodo);
cancelEditBtn.addEventListener('click', closeEditModal);
clearCompletedBtn.addEventListener('click', clearCompletedTodos);
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});
editModal.addEventListener('click', e => {
  if (e.target === editModal) closeEditModal();
});

// Init
updateUI();
