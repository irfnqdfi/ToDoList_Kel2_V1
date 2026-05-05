const todoList = document.getElementById('todoList');
const totalTasksEl = document.getElementById('totalTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const doneTasksEl = document.getElementById('doneTasks');

const priorityOrder = { high: 3, medium: 2, low: 1 };

function getNextPriority(current) {
  if (current === 'high') return 'medium';
  if (current === 'medium') return 'low';
  return 'high';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const options = { month: 'short', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString(undefined, options);
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dateStr) < today;
}

export function renderTodos(todos, { filter, search }, { onToggleComplete, onPriorityChange, onEdit, onDelete }) {
  // Stats
  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  totalTasksEl.textContent = total;
  pendingTasksEl.textContent = total - done;
  doneTasksEl.textContent = done;

  // Sorting
  let processedTodos = [...todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  
  // Search Filter
  if (search) {
    processedTodos = processedTodos.filter(t => 
      t.text.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Status Filter
  if (filter === 'active') {
    processedTodos = processedTodos.filter(todo => !todo.completed);
  } else if (filter === 'completed') {
    processedTodos = processedTodos.filter(todo => todo.completed);
  }
  
  todoList.innerHTML = '';
  
  if (processedTodos.length === 0) {
    todoList.innerHTML = `
      <div style="text-align:center; padding: 40px 0; color: var(--text-muted);">
        <i class="fas fa-tasks" style="font-size: 3rem; opacity: 0.2; margin-bottom: 10px; display: block;"></i>
        <p>No tasks found</p>
      </div>
    `;
    return;
  }

  processedTodos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.dataset.id = todo.id;
    
    const overdue = !todo.completed && isOverdue(todo.dueDate);
    
    li.innerHTML = `
      <div class="todo-check">
        <i class="${todo.completed ? 'fas fa-check-circle' : 'far fa-circle'}" 
           style="cursor: pointer; font-size: 1.2rem; color: ${todo.completed ? 'var(--primary)' : 'var(--text-muted)'}"></i>
      </div>
      <div class="todo-text ${todo.completed ? 'completed' : ''}">
        <span>${todo.text}</span>
        <div class="todo-meta">
          <span class="priority-badge badge-${todo.priority}">${todo.priority}</span>
          ${todo.dueDate ? `
            <span class="due-date ${overdue ? 'overdue' : ''}">
              <i class="far fa-calendar-alt"></i> ${formatDate(todo.dueDate)}
              ${overdue ? '<small>(Overdue)</small>' : ''}
            </span>
          ` : ''}
        </div>
      </div>
      <div class="todo-actions">
        <button class="edit-btn" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="delete-btn" title="Delete"><i class="fas fa-trash-alt"></i></button>
      </div>
    `;

    // Event Listeners
    li.querySelector('.todo-check i').addEventListener('click', () => onToggleComplete(todo.id));
    li.querySelector('.edit-btn').addEventListener('click', () => onEdit(todo.id));
    li.querySelector('.delete-btn').addEventListener('click', () => onDelete(todo.id));
    li.querySelector('.priority-badge').addEventListener('click', () => {
      onPriorityChange(todo.id, getNextPriority(todo.priority));
    });
    
    todoList.appendChild(li);
  });
}
