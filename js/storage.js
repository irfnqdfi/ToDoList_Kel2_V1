const STORAGE_KEY = 'todos';

export function getTodos() {
  const storedTodos = localStorage.getItem(STORAGE_KEY);
  return storedTodos ? JSON.parse(storedTodos) : [];
}

export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}
