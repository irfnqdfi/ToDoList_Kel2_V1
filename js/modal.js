const editModal = document.getElementById('editModal');
const editTodoInput = document.getElementById('editTodoInput');

export function openEditModal(todo, onSave) {
  editTodoInput.value = todo.text;
  editModal.classList.add('active');
  editTodoInput.focus();
  return todo.id;
}

export function closeEditModal() {
  editModal.classList.remove('active');
  editTodoInput.value = '';
}
