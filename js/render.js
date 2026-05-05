const todoList = document.getElementById('todoList');
const priorityOrder = { high: 3, medium: 2, low: 1 };

function getNextPriority(current) {
  if (current === 'high') return 'medium';
  if (current === 'medium') return 'low';
  return 'high';
}

export function renderTodos(todos, currentFilter, { onToggleComplete, onPriorityChange, onEdit, onDelete }) {
  // Sort todos based on priority
  const sortedTodos = [...todos].sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  
  // Apply current filter
  let filteredTodos = [];
  if (currentFilter === 'all') {
    filteredTodos = sortedTodos;
  } else if (currentFilter === 'active') {
    filteredTodos = sortedTodos.filter(todo => !todo.completed);
  } else if (currentFilter === 'completed') {
    filteredTodos = sortedTodos.filter(todo => todo.completed);
  }
  
  todoList.innerHTML = '';
  
  if (filteredTodos.length === 0) {
    todoList.innerHTML = '<p style="text-align:center; color:#999;">No todos found.</p>';
    return;
  }

  filteredTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = todo.id;
    
    const todoTextDiv = document.createElement('div');
    todoTextDiv.className = 'todo-text';
    if (todo.completed) {
      todoTextDiv.classList.add('completed');
    }
    
    const checkIcon = document.createElement('i');
    checkIcon.className = todo.completed ? 'fas fa-check-circle' : 'far fa-circle';
    checkIcon.style.cursor = 'pointer';
    checkIcon.addEventListener('click', () => onToggleComplete(todo.id));
    
    const span = document.createElement('span');
    span.textContent = todo.text;
    
    const priorityIndicator = document.createElement('span');
    priorityIndicator.classList.add('priority-indicator');
    if (todo.priority === 'high') {
      priorityIndicator.classList.add('priority-high');
    } else if (todo.priority === 'medium') {
      priorityIndicator.classList.add('priority-medium');
    } else {
      priorityIndicator.classList.add('priority-low');
    }
    priorityIndicator.addEventListener('click', () => {
      const nextPriority = getNextPriority(todo.priority);
      onPriorityChange(todo.id, nextPriority);
    });
    
    todoTextDiv.appendChild(checkIcon);
    todoTextDiv.appendChild(priorityIndicator);
    todoTextDiv.appendChild(span);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'todo-actions';
    
    const editBtn = document.createElement('button');
    editBtn.innerHTML = '<i class="fas fa-edit"></i>';
    editBtn.addEventListener('click', () => onEdit(todo.id));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBtn.addEventListener('click', () => onDelete(todo.id));
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    
    li.appendChild(todoTextDiv);
    li.appendChild(actionsDiv);
    todoList.appendChild(li);
  });
}
