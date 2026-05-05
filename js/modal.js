const editModal = document.getElementById('editModal');
const editTodoInput = document.getElementById('editTodoInput');
const editTodoDate = document.getElementById('editTodoDate');
const editTodoPriority = document.getElementById('editTodoPriority');

export function openEditModal(todo) {
  editTodoInput.value = todo.text;
  editTodoDate.value = todo.dueDate || '';
  editTodoPriority.value = todo.priority || 'medium';
  
  editModal.classList.add('active');
  editTodoInput.focus();
  return todo.id;
}

export function closeEditModal() {
  editModal.classList.remove('active');
  editTodoInput.value = '';
  editTodoDate.value = '';
}

export function getEditData() {
  return {
    text: editTodoInput.value.trim(),
    dueDate: editTodoDate.value,
    priority: editTodoPriority.value
  };
}
